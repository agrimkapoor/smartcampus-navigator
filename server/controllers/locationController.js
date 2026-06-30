import Location from '../models/Location.js'

// GET all locations
export const getLocations = async (req, res) => {
  try {
    const { type } = req.query
    
    let filter = {}
    if (type) filter.type = type

    const locations = await Location.find(filter).populate('connectedTo', 'name coordinates')
    res.json(locations)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET single location
export const getLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).populate('connectedTo', 'name coordinates')
    if (!location) {
      return res.status(404).json({ message: 'Location not found' })
    }
    res.json(location)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}