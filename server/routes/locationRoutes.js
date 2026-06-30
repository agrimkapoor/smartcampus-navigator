import express from 'express'
import { getLocations, getLocation } from '../controllers/locationController.js'

const router = express.Router()

router.get('/', getLocations)
router.get('/:id', getLocation)

export default router