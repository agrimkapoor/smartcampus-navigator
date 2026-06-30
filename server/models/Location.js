import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['canteen', 'lab', 'building', 'bus_stop', 'gate', 'library', 'hostel'],
    required: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  description: {
    type: String,
    default: ''
  },
  // A* ke liye — yeh node ke neighbours honge
  connectedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }]
}, { timestamps: true })

export default mongoose.model('Location', locationSchema)