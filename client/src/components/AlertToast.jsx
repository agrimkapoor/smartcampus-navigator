import { useEffect, useState } from 'react'
import socket from '../utils/socket.js'

const AlertToast = () => {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    socket.on('alert:push', (data) => {
      const id = Date.now()
      setAlerts(prev => [...prev, { ...data, id }])
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id))
      }, 5000)
    })

    return () => socket.off('alert:push')
  }, [])

  if (alerts.length === 0) return null

  return (
    <div style={{
      position: 'absolute', top: '80px', left: '50%',
      transform: 'translateX(-50%)', zIndex: 2000,
      display: 'flex', flexDirection: 'column', gap: '8px'
    }}>
      {alerts.map(alert => (
        <div key={alert.id} style={{
          background: alert.type === 'danger' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#2563eb',
          color: 'white', padding: '10px 20px',
          borderRadius: '10px', fontSize: '13px',
          fontWeight: '500', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          animation: 'slideDown 0.3s ease'
        }}>
          🔔 {alert.message}
        </div>
      ))}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default AlertToast