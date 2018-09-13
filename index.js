import { Raven } from 'touno.io'
import conn from 'touno.io/db-opensource'
import server from './server'

import exhentai from './exhentai.org'

Raven.install({ autoBreadcrumbs: true }, 'web-api-opensource')

Raven.Tracking(async () => {
  const db = await conn.open()
  Raven.ProcessClosed(process, async () => {
    db.close()
  })
  const app = await server.restart()
  app.use('/app/exhentai', exhentai)
})
