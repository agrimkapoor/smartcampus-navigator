import { useState, useEffect } from 'react'
import axios from 'axios'

const ModelInfo = () => {
  const [open, setOpen] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/predict/all')
        const data = res.data
        const avg = Math.round(data.reduce((a, b) => a + b.predicted_count, 0) / data.length)
        const highCount = data.filter(d => d.predicted_count > 70).length
        const lowCount = data.filter(d => d.predicted_count <= 40).length
        setStats({ avg, highCount, lowCount, total: data.length })
      } catch (error) {
        console.error('Stats error:', error)
      }
    }
    fetchStats()
  }, [])

  return (
    <div style={{
      position: 'absolute', bottom: '30px', left: '50%',
      transform: 'translateX(-50%)', zIndex: 1000
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'white', border: '0.5px solid #e5e7eb',
          borderRadius: '20px', padding: '6px 14px',
          fontSize: '12px', cursor: 'pointer',color:'black',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}
      >
        🧠 ML Model Info
      </button>

      {open && stats && (
        <div style={{
          position: 'absolute', bottom: '40px', left: '50%',
          transform: 'translateX(-50%)',
          background: 'white', borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          padding: '16px', minWidth: '260px'
        }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#111' }}>
            🧠 LSTM Model — Campus Crowd Predictor
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '600', color: '#111' }}>{stats.total}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Locations tracked</p>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '600', color: '#111' }}>{stats.avg}%</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Avg predicted crowd</p>
            </div>
            <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '600', color: '#991b1b' }}>{stats.highCount}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>High crowd locations</p>
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '600', color: '#166534' }}>{stats.lowCount}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Low crowd locations</p>
            </div>
          </div>

          <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '10px 12px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '500', color: '#1e40af' }}>MODEL DETAILS</p>
            <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#374151' }}>Architecture: LSTM (64→32→Dense)</p>
            <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#374151' }}>Training: 30 days simulated data</p>
            <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#374151' }}>Features: Hour, Day, Location</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#374151' }}>Updates: Every 5 minutes</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelInfo