import axios from 'axios'

const FASTAPI_URL = 'http://localhost:8000'

// simple in-memory cache
const cache = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const getCached = (key) => {
  if (cache[key] && Date.now() - cache[key].time < CACHE_TTL) {
    return cache[key].data
  }
  return null
}

const setCache = (key, data) => {
  cache[key] = { data, time: Date.now() }
}

export const getPrediction = async (req, res) => {
  try {
    const { locationName } = req.params
    const now = new Date()
    const hour = now.getHours()
    const day_of_week = now.getDay()

    // cache check karo
    const cacheKey = `${locationName}-${hour}-${day_of_week}`
    const cached = getCached(cacheKey)
    if (cached) {
      return res.json({ ...cached, fromCache: true })
    }

    const response = await axios.post(`${FASTAPI_URL}/predict`, {
      location_name: locationName,
      hour,
      day_of_week
    })

    setCache(cacheKey, response.data)
    res.json(response.data)

  } catch (error) {
    res.status(500).json({ message: 'Prediction error', error: error.message })
  }
}

export const getAllPredictions = async (req, res) => {
  try {
    const locations = [
      "Main Canteen", "AB Block", "Library", "Gate 1 (Main Gate)",
      "Gate 2", "Workshop", "EC Block", "Bus Stop Gate 1",
      "Bus Stop Gate 2", "Boys Hostel Block A", "Girls Hostel",
      "Sports Ground", "Admin Block", "Computer Lab", "Medical Centre"
    ]

    const now = new Date()
    const hour = now.getHours()
    const day_of_week = now.getDay()

    const predictions = await Promise.all(
      locations.map(async (loc) => {
        const cacheKey = `${loc}-${hour}-${day_of_week}`
        const cached = getCached(cacheKey)
        if (cached) return { ...cached, fromCache: true }

        try {
          const response = await axios.post(`${FASTAPI_URL}/predict`, {
            location_name: loc,
            hour,
            day_of_week
          })
          setCache(cacheKey, response.data)
          return response.data
        } catch {
          return { location: loc, predicted_count: 0 }
        }
      })
    )

    res.json(predictions)

  } catch (error) {
    res.status(500).json({ message: 'Prediction error', error: error.message })
  }
}