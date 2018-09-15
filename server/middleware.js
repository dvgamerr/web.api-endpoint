import { Raven, debuger } from 'touno.io'

const logger = debuger.scope('router')
export default (app, server) => {
  app.get('/online', (req, res) => {
    res.json({ online: true })
  })

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
