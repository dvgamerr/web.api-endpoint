import { Raven, debuger } from 'touno.io'
import bodyParser from 'body-parser'

import auth from './auth'

const logger = debuger.scope('router')
export default (app, server) => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Token, X-Access')
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Credentials', true)
    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
      return
    }

    next()
  })

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.use((req, res, next) => {
    logger.info(`${req.method.toLocaleUpperCase()} - ${req.url}`)
    next()
  })

  app.use((err, req, res, next) => {
    logger.error(`${req.method.toLocaleUpperCase()} - ${req.url}`)
    logger.error(err)
    res.status(500).json({ error: err.message })
  })

  app.get('*', (req, res) => res.status(500).end())

  app.get('/status', (req, res) => {
    res.json({ online: true })
  })

  app.use(auth)

  app.post('/restart/:password', (req, res) => Raven.Tracking(async () => {
    if (process.env.SERVER_PASSWORD) {
      try {
        let { params } = req

        if (!params || params.password !== process.env.SERVER_PASSWORD) throw new Error('server is not restart.')
        await server.restart()
        logger.info('request restarted.')
        res.status(200).end()
      } catch (ex) {
        res.status(500).end(ex.message)
      }
    } else {
      res.status(500).end('disabled')
    }
  }, true))
}
