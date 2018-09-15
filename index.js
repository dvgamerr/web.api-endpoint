import { Raven } from 'touno.io'
import conn from 'touno.io/db-opensource'
import server from './server'

import pokemon from './pokemon-go'

Raven.install({ autoBreadcrumbs: true }, 'web-api-endpoint')

Raven.Tracking(async () => {
  const db = await conn.open()
  Raven.ProcessClosed(process, async () => {
    db.close()
  })

  const app = await server.restart()
  app.use('/pokedex', pokemon)
})
