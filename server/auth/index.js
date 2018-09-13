import express from 'express'

import security from './security'
import account from './account'

const router = express.Router()

router.post('/', account)
router.use(security)

export default router
