import express from 'express'
import { updateCrowd, getLatestCrowd, updateBus, sendAlert } from '../controllers/crowdController.js'

const router = express.Router()

router.post('/update', updateCrowd)
router.get('/latest', getLatestCrowd)
router.post('/bus-update', updateBus)
router.post('/alert', sendAlert)

export default router