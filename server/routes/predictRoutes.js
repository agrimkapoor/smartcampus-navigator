import express from 'express'
import { getPrediction, getAllPredictions } from '../controllers/predictController.js'

const router = express.Router()

router.get('/all', getAllPredictions)
router.get('/:locationName', getPrediction)

export default router