import express from 'express'
import { getRoute } from '../controllers/routeController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, getRoute)

export default router