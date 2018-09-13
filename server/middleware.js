import { Raven } from 'touno.io'

export default (app, server) => {
  app.get('*', (req, res) => res.status(500).end())

  app.post('/', (req, res) => {
    res.json({ online: true })
  })

  app.post('/restart/:password', (req, res) => Raven.Tracking(async () => {
    if (process.env.SERVER_PASSWORD) {
      try {
        let { params } = req

        if (!params || params.password !== process.env.SERVER_PASSWORD) throw new Error('server is not restart.')
        await server.restart()
        res.status(200).end()
      } catch (ex) {
        res.status(500).end(ex.message)
      }
    } else {
      res.status(500).end('disabled')
    }
  }, true))
}
