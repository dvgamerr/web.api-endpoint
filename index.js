import { Raven } from 'touno.io'
import server from './server'

Raven.install({ autoBreadcrumbs: true },  'web-api-opensource')

Raven.Tracking(async () => {
  const app = await server.restart()
})
