import { Raven } from 'touno.io'
import conn from 'touno.io/db-opensource'

export default (req, res) => Raven.Tracking(async () => {
  try {
    await conn.open()
    res.end('pass.')
  } catch (ex) {
    res.status(500).json({ error: ex.message })
  }
})
