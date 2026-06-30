import mongoose from 'mongoose'

const crowdDataSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  count: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })

// fast query ke liye index
crowdDataSchema.index({ locationId: 1, timestamp: -1 })

export default mongoose.model('CrowdData', crowdDataSchema)