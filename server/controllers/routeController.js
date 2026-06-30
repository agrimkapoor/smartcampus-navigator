import Location from '../models/Location.js'
import astar from '../utils/astar.js'

export const getRoute = async (req, res) => {
  try {
    const { from, to } = req.body

    if (!from || !to) {
      return res.status(400).json({ message: 'from aur to dono chahiye' })
    }

    if (from === to) {
      return res.status(400).json({ message: 'Start aur end same nahi ho sakte' })
    }

    // saare locations fetch karo with connections
    const locations = await Location.find().populate('connectedTo', 'name coordinates connectedTo')

    // A* run karo
    const path = astar(locations, from, to)

    if (!path) {
      return res.status(404).json({ message: 'Koi route nahi mila' })
    }

    // total distance calculate karo
    let totalDistance = 0
    for (let i = 0; i < path.length - 1; i++) {
      const curr = path[i].coordinates
      const next = path[i + 1].coordinates
      const R = 6371000
      const dLat = (next.lat - curr.lat) * Math.PI / 180
      const dLng = (next.lng - curr.lng) * Math.PI / 180
      const a = Math.sin(dLat/2)**2 + Math.cos(curr.lat * Math.PI/180) * Math.cos(next.lat * Math.PI/180) * Math.sin(dLng/2)**2
      totalDistance += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    }

    res.json({
      path: path.map(loc => ({
        id: loc._id,
        name: loc.name,
        type: loc.type,
        coordinates: loc.coordinates
      })),
      totalDistance: Math.round(totalDistance),
      estimatedWalkTime: Math.round(totalDistance / 80) // 80 meters per minute walking speed
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}