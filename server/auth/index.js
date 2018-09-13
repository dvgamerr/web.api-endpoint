import express from 'express'

import security from './security'
import account from './account'

const router = express.Router()

router.use(security)
router.post('/request-token-access', account)

export default router
