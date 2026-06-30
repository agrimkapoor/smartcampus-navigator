import { useEffect, useState } from 'react'
import axios from 'axios'

const PredictionPanel = ({ locationName }) => {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!locationName) return

    const fetchPrediction = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`http://localhost:5000/api/predict/${locationName}`)
        setPrediction(res.data)
      } catch (error) {
        console.error('Prediction error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrediction()
  }, [locationName])

  if (!locationName) return null
  if (loading) return (
    <div style={{
      position: 'absolute', bottom: '30px', right: '10px',
      zIndex: 1000, background: 'white', borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      padding: '12px 16px', fontSize: '13px', color: '#6b7280'
    }}>
      🧠 Prediction load ho rahi hai...
    </div>
  )

  if (!prediction || prediction.error) return null

  const getBg = (count) => {
    if (count > 70) return { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' }
    if (count > 40) return { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' }
    return { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' }
  }

  const style = getBg(prediction.predicted_count)

  return (
    <div style={{
      position: 'absolute', bottom: '30px', right: '10px',
      zIndex: 1000, background: 'white', borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      padding: '16px', minWidth: '240px'
    }}>
      <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '500', color: '#9ca3af' }}>
        🧠 ML PREDICTION — अगले 1 घंटे में
      </p>

      <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#111' }}>
        {prediction.location}
      </p>

      <div style={{
        background: style.bg, borderRadius: '8px',
        padding: '10px 12px', marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: style.dot }}></div>
          <span style={{ fontSize: '13px', fontWeight: '500', color: style.color }}>
            {prediction.predicted_count}% crowd expected
          </span>
        </div>
        <div style={{ background: '#e5e7eb', borderRadius: '20px', height: '6px' }}>
          <div style={{
            width: `${prediction.predicted_count}%`,
            height: '100%', borderRadius: '20px',
            background: style.dot
          }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
        <span>⏱️ Wait time: ~{prediction.predicted_wait_min} min</span>
        <span style={{
          background: prediction.confidence === 'high' ? '#dcfce7' : '#fef3c7',
          color: prediction.confidence === 'high' ? '#166534' : '#92400e',
          padding: '1px 6px', borderRadius: '20px', fontSize: '11px'
        }}>
          {prediction.confidence} confidence
        </span>
      </div>
    </div>
  )
}

export default PredictionPanel