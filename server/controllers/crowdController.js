import CrowdData from '../models/CrowdData.js'
import Location from '../models/Location.js'
import { io } from '../index.js'

// POST /api/crowd/update — simulator se data aayega
export const updateCrowd = async (req, res) => {
  try {
    const { locationName, count } = req.body

    // location dhundho naam se
    const location = await Location.findOne({ name: locationName })
    if (!location) {
      return res.status(404).json({ message: `Location not found: ${locationName}` })
    }

    // DB mein save karo
    await CrowdData.create({
      locationId: location._id,
      count
    })

    // Socket.io se sabko broadcast karo
    io.emit('crowd:update', {
      locationId: location._id,
      locationName: location.name,
      count,
      timestamp: new Date()
    })

    res.json({ message: 'Crowd data updated', locationName, count })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/crowd/latest — sabhi locations ki latest crowd
export const getLatestCrowd = async (req, res) => {
  try {
    const locations = await Location.find()

    const crowdData = await Promise.all(
      locations.map(async (loc) => {
        const latest = await CrowdData.findOne({ locationId: loc._id })
          .sort({ timestamp: -1 })

        return {
          locationId: loc._id,
          locationName: loc.name,
          count: latest ? latest.count : 0
        }
      })
    )

    res.json(crowdData)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const updateBus = async (req, res) => {
  try {
    const { stopName, eta } = req.body
    io.emit('bus:update', { stopName, eta })
    res.json({ message: 'Bus updated', stopName, eta })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const sendAlert = async (req, res) => {
  try {
    const { message, type } = req.body
    io.emit('alert:push', { message, type, timestamp: new Date() })
    res.json({ message: 'Alert sent' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}