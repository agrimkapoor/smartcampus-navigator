import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const API = 'http://localhost:5000/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // app open hone pe check karo user logged in hai ya nahi
  useEffect(() => {
    const getMe = async () => {
      try {
        const res = await axios.get(`${API}/auth/me`, { withCredentials: true })
        setUser(res.data)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    getMe()
  }, [])

  const register = async (name, email, password) => {
    const res = await axios.post(`${API}/auth/register`, { name, email, password }, { withCredentials: true })
    return res.data
  }

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true })
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)