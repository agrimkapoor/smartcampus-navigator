import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Location from './models/Location.js'

dotenv.config()

const locations = [
  {
    name: 'Main Canteen',
    type: 'canteen',
    coordinates: { lat: 28.7501, lng: 77.1183 },
    description: 'Main canteen near admin block'
  },
  {
    name: 'AB Block',
    type: 'building',
    coordinates: { lat: 28.7495, lng: 77.1180 },
    description: 'Academic Block — CSE, IT departments'
  },
  {
    name: 'Library',
    type: 'library',
    coordinates: { lat: 28.7508, lng: 77.1178 },
    description: 'Central library'
  },
  {
    name: 'Gate 1 (Main Gate)',
    type: 'gate',
    coordinates: { lat: 28.7480, lng: 77.1160 },
    description: 'Main entrance gate'
  },
  {
    name: 'Gate 2',
    type: 'gate',
    coordinates: { lat: 28.7520, lng: 77.1200 },
    description: 'Secondary entrance gate'
  },
  {
    name: 'Workshop',
    type: 'lab',
    coordinates: { lat: 28.7490, lng: 77.1195 },
    description: 'Mechanical workshop'
  },
  {
    name: 'EC Block',
    type: 'building',
    coordinates: { lat: 28.7512, lng: 77.1188 },
    description: 'Electronics department'
  },
  {
    name: 'Bus Stop Gate 1',
    type: 'bus_stop',
    coordinates: { lat: 28.7478, lng: 77.1158 },
    description: 'Bus stop near main gate'
  },
  {
    name: 'Bus Stop Gate 2',
    type: 'bus_stop',
    coordinates: { lat: 28.7522, lng: 77.1202 },
    description: 'Bus stop near gate 2'
  },
  {
    name: 'Boys Hostel Block A',
    type: 'hostel',
    coordinates: { lat: 28.7530, lng: 77.1175 },
    description: 'Boys hostel A block'
  },
  {
    name: 'Girls Hostel',
    type: 'hostel',
    coordinates: { lat: 28.7525, lng: 77.1165 },
    description: 'Girls hostel'
  },
  {
    name: 'Sports Ground',
    type: 'building',
    coordinates: { lat: 28.7535, lng: 77.1190 },
    description: 'Main sports ground'
  },
  {
    name: 'Admin Block',
    type: 'building',
    coordinates: { lat: 28.7498, lng: 77.1172 },
    description: 'Administrative block'
  },
  {
    name: 'Computer Lab',
    type: 'lab',
    coordinates: { lat: 28.7493, lng: 77.1185 },
    description: 'Main computer lab — AB Block'
  },
  {
    name: 'Medical Centre',
    type: 'building',
    coordinates: { lat: 28.7505, lng: 77.1168 },
    description: 'Campus medical centre'
  }
]

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')

    // pehle purana data delete karo
    await Location.deleteMany()
    console.log('Old locations deleted')

    // naya data insert karo
    const inserted = await Location.insertMany(locations)
    console.log(`${inserted.length} locations inserted`)

    // ab connections banao A* ke liye
    const loc = await Location.find()

    // helper function — naam se id dhundho
    const getId = (name) => loc.find(l => l.name === name)?._id

    // connections define karo
    const connections = {
      'Main Canteen':       ['AB Block', 'Library', 'Admin Block', 'Computer Lab'],
      'AB Block':           ['Main Canteen', 'Computer Lab', 'Workshop', 'Gate 1 (Main Gate)'],
      'Library':            ['Main Canteen', 'Admin Block', 'EC Block'],
      'Gate 1 (Main Gate)': ['AB Block', 'Bus Stop Gate 1', 'Admin Block'],
      'Gate 2':             ['EC Block', 'Bus Stop Gate 2', 'Boys Hostel Block A'],
      'Workshop':           ['AB Block', 'EC Block', 'Sports Ground'],
      'EC Block':           ['Library', 'Workshop', 'Gate 2', 'Sports Ground'],
      'Bus Stop Gate 1':    ['Gate 1 (Main Gate)'],
      'Bus Stop Gate 2':    ['Gate 2'],
      'Boys Hostel Block A':['Gate 2', 'Girls Hostel', 'Sports Ground'],
      'Girls Hostel':       ['Boys Hostel Block A', 'Medical Centre'],
      'Sports Ground':      ['Workshop', 'EC Block', 'Boys Hostel Block A'],
      'Admin Block':        ['Main Canteen', 'Library', 'Gate 1 (Main Gate)', 'Medical Centre'],
      'Computer Lab':       ['Main Canteen', 'AB Block'],
      'Medical Centre':     ['Admin Block', 'Girls Hostel']
    }

    // har location ke liye connectedTo update karo
    for (const [name, neighbours] of Object.entries(connections)) {
      const id = getId(name)
      const neighbourIds = neighbours.map(n => getId(n)).filter(Boolean)
      await Location.findByIdAndUpdate(id, { connectedTo: neighbourIds })
    }

    console.log('Connections added successfully')
    console.log('Seed complete!')
    process.exit(0)

  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seedDB()