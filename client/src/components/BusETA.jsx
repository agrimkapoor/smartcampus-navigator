import { useEffect, useState } from 'react'
import socket from '../utils/socket.js'

const BusETA = () => {
  const [busData, setBusData] = useState({})

  useEffect(() => {
    socket.on('bus:update', (data) => {
      setBusData(prev => ({
        ...prev,
        [data.stopName]: data.eta
      }))
    })

    return () => {
      socket.off('bus:update')
    }
  }, [])

  if (Object.keys(busData).length === 0) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '10px',
      zIndex: 1000,
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      padding: '12px 16px',
      minWidth: '220px'
    }}>
      <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '500', color: '#9ca3af' }}>
        🚌 BUS ETA
      </p>
      {Object.entries(busData).map(([stop, eta]) => (
        <div key={stop} style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '6px 0',
          borderBottom: '0.5px solid #f3f4f6'
        }}>
          <span style={{ fontSize: '13px', color: '#374151' }}>{stop}</span>
          <span style={{
            fontSize: '12px', fontWeight: '500',
            background: eta <= 5 ? '#dcfce7' : '#fef3c7',
            color: eta <= 5 ? '#166534' : '#92400e',
            padding: '2px 8px', borderRadius: '20px'
          }}>
            {eta} min
          </span>
        </div>
      ))}
    </div>
  )
}

export default BusETA