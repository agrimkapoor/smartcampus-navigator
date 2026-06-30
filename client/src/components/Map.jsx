import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import L from 'leaflet'
import Sidebar from './Sidebar'
import socket from '../utils/socket.js'
import BusETA from './BusETA'
import AlertToast from './AlertToast'
import PredictionPanel from './PredictionPanel'
import ModelInfo from './ModelInfo'

const getIcon = (type, isSelected, crowdCount, predictedCount) => {
  const icons = {
    canteen: '🍽️',
    lab: '🔬',
    building: '🏛️',
    bus_stop: '🚌',
    gate: '🚪',
    library: '📚',
    hostel: '🏠'
  }
  const emoji = icons[type] || '📍'

  let borderColor = '#22c55e'
  if (crowdCount > 70) borderColor = '#ef4444'
  else if (crowdCount > 40) borderColor = '#f59e0b'

  const predColor = predictedCount > 70 ? '#ef4444' : predictedCount > 40 ? '#f59e0b' : '#22c55e'
  const predBadge = predictedCount > 0 ? `
    <div style="position:absolute;top:-8px;right:-8px;background:${predColor};color:white;font-size:9px;font-weight:600;padding:1px 4px;border-radius:20px;white-space:nowrap;">${predictedCount}%</div>
  ` : ''

  return L.divIcon({
    html: `<div style="
      font-size: 24px; display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px;
      background: ${isSelected ? '#2563eb' : 'white'};
      border-radius: 50%;
      border: 3px solid ${isSelected ? '#2563eb' : borderColor};
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      position: relative;
    ">${emoji}${predBadge}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  })
}

const DTU_CENTER = [28.7501, 77.1183]

const Map = () => {
  const [locations, setLocations] = useState([])
  const [from, setFrom] = useState(null)
  const [to, setTo] = useState(null)
  const [route, setRoute] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [crowdData, setCrowdData] = useState({})
  const [predictions, setPredictions] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [mapLoading, setMapLoading] = useState(true)
  const crowdRef = useRef({})

  // Socket events
  useEffect(() => {
    socket.on('connect_error', () => {
      console.error('Socket connection failed — real-time updates band hain')
    })

    socket.on('crowd:update', (data) => {
      const id = data.locationId.toString()
      crowdRef.current[id] = data.count
      setCrowdData({ ...crowdRef.current })
    })

    return () => {
      socket.off('connect_error')
      socket.off('crowd:update')
    }
  }, [])

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/locations')
        setLocations(res.data)
      } catch (error) {
        console.error('Locations fetch error:', error)
      } finally {
        setMapLoading(false)
      }
    }
    fetchLocations()
  }, [])

  // Fetch predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/predict/all')
        const predMap = {}
        res.data.forEach(p => {
          predMap[p.location] = p.predicted_count
        })
        setPredictions(predMap)
      } catch (error) {
        console.error('Predictions fetch error:', error)
      }
    }
    fetchPredictions()
    const interval = setInterval(fetchPredictions, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkerClick = (loc) => {
    setSelectedLocation(loc)
    if (!from) {
      setFrom(loc)
      setTo(null)
      setRoute(null)
      setRouteInfo(null)
    } else if (!to && loc._id !== from._id) {
      setTo(loc)
    } else {
      setFrom(loc)
      setTo(null)
      setRoute(null)
      setRouteInfo(null)
    }
  }

  const getRoute = async () => {
    if (!from || !to) return
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5000/api/route', {
        from: from._id,
        to: to._id
      }, { withCredentials: true })
      setRoute(res.data.path)
      setRouteInfo({
        distance: res.data.totalDistance,
        walkTime: res.data.estimatedWalkTime
      })
    } catch (error) {
      console.error('Route error:', error)
      alert('Route nahi mila!')
    } finally {
      setLoading(false)
    }
  }

  const clearRoute = () => {
    setFrom(null)
    setTo(null)
    setRoute(null)
    setRouteInfo(null)
  }

  const polylinePoints = route
    ? route.map(loc => [loc.coordinates.lat, loc.coordinates.lng])
    : []

  if (mapLoading) {
    return (
      <div style={{
        height: '100vh', width: '100%', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{
          width: '40px', height: '40px', border: '4px solid #e5e7eb',
          borderTopColor: '#2563eb', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
          Map load ho raha hai...
        </p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>

      {/* Top Panel */}
      <div style={{
        position: 'absolute', top: '10px', left: '50%',
        transform: 'translateX(-50%)', zIndex: 1000,
        background: 'white', padding: '12px 20px',
        borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        minWidth: window.innerWidth < 768 ? '90%' : '320px',
        maxWidth: '90%', textAlign: 'center'
      }}>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>
          {!from && '📍 Kisi bhi location pe click karo — start point'}
          {from && !to && `✅ From: ${from.name} — ab destination select karo`}
          {from && to && `🗺️ ${from.name} → ${to.name}`}
        </div>
        {from && to && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={getRoute} disabled={loading} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}>
              {loading ? 'Loading...' : '🔍 Route Dhundho'}
            </button>
            <button onClick={clearRoute} style={{ background: '#f3f4f6', color: '#333', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}>
              ✖ Clear
            </button>
          </div>
        )}
        {routeInfo && (
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#2563eb' }}>
            📏 {routeInfo.distance}m &nbsp;|&nbsp; 🚶 ~{routeInfo.walkTime} min walk
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ position: 'absolute', top: '90px', left: '10px', zIndex: 1000, width: '240px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Location dhundho..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: '10px',
            border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            fontSize: '13px', outline: 'none'
          }}
        />
        {searchTerm && (
          <div style={{
            background: 'white', borderRadius: '10px', marginTop: '6px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)', maxHeight: '200px', overflowY: 'auto'
          }}>
            {locations
              .filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(loc => (
                <div
                  key={loc._id}
                  onClick={() => {
                    handleMarkerClick(loc)
                    setSearchTerm('')
                  }}
                  style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', borderBottom: '0.5px solid #f3f4f6' }}
                >
                  {loc.name}
                </div>
              ))}
            {locations.filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div style={{ padding: '10px 14px', fontSize: '13px', color: '#9ca3af' }}>
                Koi location nahi mili
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <MapContainer center={DTU_CENTER} zoom={16} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map(loc => {
          const isSelected = (from?._id === loc._id) || (to?._id === loc._id)
          const crowdCount = crowdData[loc._id.toString()] || 0
          const predictedCount = predictions[loc.name] || 0
          return (
            <Marker
              key={loc._id}
              position={[loc.coordinates.lat, loc.coordinates.lng]}
              icon={getIcon(loc.type, isSelected, crowdCount, predictedCount)}
              eventHandlers={{ click: () => handleMarkerClick(loc) }}
            >
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <strong>{loc.name}</strong><br />
                  <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                    {loc.type}
                  </span>
                  <br />
                  <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                    {loc.description}
                  </span>
                </div>
              </Popup>
            </Marker>
          )
        })}
        {polylinePoints.length > 0 && (
          <Polyline positions={polylinePoints} color="#2563eb" weight={4} opacity={0.8} />
        )}
      </MapContainer>

      <Sidebar
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
        crowdCount={selectedLocation ? (crowdRef.current[selectedLocation._id.toString()] || 0) : 0}
      />

      <BusETA />
      <AlertToast />
      <ModelInfo />
      <PredictionPanel locationName={selectedLocation?.name} />

    </div>
  )
}

export default Map