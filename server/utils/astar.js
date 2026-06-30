// Haversine formula — do coordinates ke beech actual distance meters mein
const haversine = (coord1, coord2) => {
  const R = 6371000 // Earth radius in meters
  const lat1 = coord1.lat * Math.PI / 180
  const lat2 = coord2.lat * Math.PI / 180
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const astar = (locations, startId, endId) => {
  // locations ko map mein convert karo — easy access ke liye
  const locMap = {}
  locations.forEach(loc => {
    locMap[loc._id.toString()] = loc
  })

  const start = locMap[startId]
  const end = locMap[endId]

  if (!start || !end) return null

  // open list — jinhe abhi explore karna hai
  const openList = []

  // closed list — jo explore ho chuke hain
  const closedList = new Set()

  // har node ka parent track karo — path reconstruct karne ke liye
  const parent = {}

  // G aur F costs
  const gCost = {}
  const fCost = {}

  gCost[startId] = 0
  fCost[startId] = haversine(start.coordinates, end.coordinates)

  openList.push(startId)

  while (openList.length > 0) {
    // openList mein se sabse kam fCost wala node lo
    openList.sort((a, b) => fCost[a] - fCost[b])
    const current = openList.shift()

    // end mil gaya — path reconstruct karo
    if (current === endId) {
      const path = []
      let node = endId
      while (node) {
        path.unshift(locMap[node])
        node = parent[node]
      }
      return path
    }

    closedList.add(current)

    const currentLoc = locMap[current]
    if (!currentLoc) continue

    // neighbours explore karo
    for (const neighbour of currentLoc.connectedTo) {
      const neighbourId = neighbour._id
        ? neighbour._id.toString()
        : neighbour.toString()

      if (closedList.has(neighbourId)) continue

      const neighbourLoc = locMap[neighbourId]
      if (!neighbourLoc) continue

      const tentativeG = gCost[current] + haversine(currentLoc.coordinates, neighbourLoc.coordinates)

      if (!openList.includes(neighbourId)) {
        openList.push(neighbourId)
      } else if (tentativeG >= (gCost[neighbourId] || Infinity)) {
        continue
      }

      // yeh path better hai — save karo
      parent[neighbourId] = current
      gCost[neighbourId] = tentativeG
      fCost[neighbourId] = tentativeG + haversine(neighbourLoc.coordinates, end.coordinates)
    }
  }

  // koi path nahi mila
  return null
}

export default astar