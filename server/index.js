import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import locationRoutes from './routes/locationRoutes.js'
import routeRoutes from './routes/routeRoutes.js'
import crowdRoutes from './routes/crowdRoutes.js'
import predictRoutes from './routes/predictRoutes.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5174',
    credentials: true
  }
})

// CORS sabse pehle
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// routes
app.get('/ping', (req, res) => {
  res.json({ message: 'Server is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/locations', locationRoutes)
app.use('/api/route', routeRoutes)
app.use('/api/crowd', crowdRoutes)
app.use('/api/predict', predictRoutes)

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    httpServer.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    })
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err)
  })