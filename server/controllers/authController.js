import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // check karo user already exist toh nahi karta
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // password hash karo
    const hashedPassword = await bcrypt.hash(password, 10)

    // user banao
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    res.status(201).json({ message: 'Registered successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // user dhundho
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // password compare karo
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // JWT token banao
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // cookie mein daalo
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({ message: 'Logged in successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out successfully' })
}

// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}