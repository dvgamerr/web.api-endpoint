import conn from 'touno.io/db-touno'
import { Raven, debuger } from 'touno.io'

const logger = debuger.scope('Auth-v2')
export default (req, res, next) => Raven.Tracking(async () => {
  try {
    const { LogRequest, Account } = await conn.open()

    let requested = {
      token: false,
      requested: null,
      created: null,
      ipaddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      url: req.originalUrl
    }

    let { headers } = req
    let token = /(\w+?)\.(.*)/i.exec(headers['x-token'] || '') || []

    if (!headers['x-token'] || !headers['x-access'] || isNaN(parseInt(headers['x-access']))) {
      await new LogRequest(requested).save()
      logger.log(`req: ${requested.url} error: Unauthorized access.`)
      res.status(400).json({ error: 'Unauthorized access.' })
      return
    }
    requested.requested = new Date(parseInt(headers['x-access']))
    requested.created = new Date()
    // if (requested.created - requested.requested > 15000 || requested.created - requested.requested < -5000) {
    //   await new LogRequest(requested).save()
    //   res.status(400).send('{ "error": "Unauthorized timeout." }')
    //   return
    // }

    if (!token[2].trim() || !token[1].trim()) {
      await new LogRequest(requested).save()
      logger.log(`req: ${requested.url} error: Authentication failure.`)
      res.status(400).json({ error: 'Authentication failure.' })
      return
    }

    let data = await Account.findOne({ username: token[2].trim(), active: true }) || {}
    if (!data && req.originalUrl !== '/request-token-access') {
      logger.log(`req: ${requested.url} error: Authentication not Activate.`)
      res.status(400).json({ error: 'Authentication not Activate.' })
      return
    }

    if ((token[1].trim() !== data.token || token[2].trim() !== data.username) && req.originalUrl !== '/request-token-access') {
      await new LogRequest(requested).save()
      logger.log('token:', data.token, token[1].trim(), data.username, token[2].trim())
      logger.log(`req: ${requested.url} error: Authentication required.`)
      res.status(400).json({ error: 'Authentication required.' })
      return
    }
    logger.log(`req: ${requested.url} auth pass.`)
    requested.token = true
    await new LogRequest(requested).save()
    next()
  } catch (ex) {
    logger.error(ex)
    res.status(500).json({ error: ex.message })
  }
})
