import conn from 'touno.io/db-touno'
import { RandomString } from 'touno.io/algorithm'
import { Raven, debuger } from 'touno.io'

const logger = debuger.scope('Auth-v2')
export default (req, res) => Raven.Tracking(async () => {
  try {
    const { Account } = await conn.open()

    let { register } = req.body || {}
    if (!register) throw new Error('Register parameter fail.')
    logger.log('Member Token Username:', register)

    let data = await Account.findOne({ username: register.trim() })
    if (data) throw new Error('Member Requested duplicate.')
    let hash = RandomString(16)
    res.set({ 'X-Key': hash })

    logger.info('Created Member-Key:', hash)
    await new Account({ username: register.trim(), token: hash, active: false }).save()
  } catch (ex) {
    logger.error(ex)
    res.end()
  }
  res.end()
})
