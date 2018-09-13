import express from 'express'
import main from './main'

// router: /app/exhentai/
const router = express.Router()

router.post('/', main)

export default router
