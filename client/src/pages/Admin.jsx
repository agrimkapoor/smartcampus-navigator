import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const Admin = () => {
  const [locations, setLocations] = useState([])
  const [message, setMessage] = useState('')
  const [alertType, setAlertType] = useState('info')
  const [sending, setSending] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/locations')
        setLocations(res.data)
      } catch (error) {
        console.error('Error:', error)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const sendAlert = async () => {
    if (!message.trim()) return
    setSending(true)
    try {
      await axios.post('http://localhost:5000/api/crowd/alert', {
        message,
        type: alertType
      })
      setMessage('')
      alert('Alert sent successfully!')
    } catch (error) {
      alert('Error sending alert')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>SmartCampus Admin</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>Welcome, {user?.name}</p>
        </div>
        <button
          onClick={logout}
          style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      {/* Send Alert */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>📢 Send Campus Alert</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Alert message likho..."
          rows={3}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '10px', fontFamily: 'sans-serif' }}
        />
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
          </select>
          <button
            onClick={sendAlert}
            disabled={sending}
            style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer' }}
          >
            {sending ? 'Sending...' : 'Send Alert'}
          </button>
        </div>
      </div>

      {/* Locations Table */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>📍 All Locations ({locations.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Name</th>
              <th style={{ padding: '8px' }}>Type</th>
              <th style={{ padding: '8px' }}>Coordinates</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(loc => (
              <tr key={loc._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px' }}>{loc.name}</td>
                <td style={{ padding: '8px' }}>
                  <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}>
                    {loc.type}
                  </span>
                </td>
                <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '11px' }}>
                  {loc.coordinates.lat.toFixed(4)}, {loc.coordinates.lng.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Admin