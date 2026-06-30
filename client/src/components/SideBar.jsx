const typeColors = {
  canteen: { bg: '#fef3c7', color: '#92400e' },
  lab: { bg: '#ede9fe', color: '#5b21b6' },
  building: { bg: '#eff6ff', color: '#1e40af' },
  bus_stop: { bg: '#dcfce7', color: '#166534' },
  gate: { bg: '#fce7f3', color: '#9d174d' },
  library: { bg: '#ffedd5', color: '#9a3412' },
  hostel: { bg: '#f1f5f9', color: '#334155' }
}

const typeEmoji = {
  canteen: '🍽️',
  lab: '🔬',
  building: '🏛️',
  bus_stop: '🚌',
  gate: '🚪',
  library: '📚',
  hostel: '🏠'
}

const Sidebar = ({ location, onClose, crowdCount = 0 }) => {
  if (!location) return null

  const colors = typeColors[location.type] || { bg: '#f3f4f6', color: '#374151' }
  const emoji = typeEmoji[location.type] || '📍'

  const crowdBg = crowdCount > 70 ? '#fef2f2' : crowdCount > 40 ? '#fffbeb' : '#f0fdf4'
  const crowdDot = crowdCount > 70 ? '#ef4444' : crowdCount > 40 ? '#f59e0b' : '#22c55e'
  const crowdText = crowdCount > 70 ? '#991b1b' : crowdCount > 40 ? '#92400e' : '#166534'
  const crowdLabel = crowdCount > 70 ? `High — ${crowdCount}% crowd` : crowdCount > 40 ? `Medium — ${crowdCount}% crowd` : `Low — ${crowdCount}% crowd`

  const isMobile = window.innerWidth < 768

  return (
    <div style={{
      position: 'absolute',
      top: isMobile ? 'auto' : '80px',
      bottom: isMobile ? '0' : 'auto',
      right: isMobile ? '0' : '10px',
      left: isMobile ? '0' : 'auto',
      zIndex: 1000,
      background: 'white',
      borderRadius: isMobile ? '16px 16px 0 0' : '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      width: isMobile ? '100%' : '260px',
      maxHeight: isMobile ? '60vh' : 'auto',
      overflowY: 'auto',
      padding: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '28px' }}>{emoji}</span>
          <div>
            <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#111' }}>{location.name}</p>
            <span style={{ fontSize: '11px', background: colors.bg, color: colors.color, padding: '2px 8px', borderRadius: '20px', display: 'inline-block', marginTop: '2px', fontWeight: '500' }}>
              {location.type}
            </span>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9ca3af' }}>✕</button>
      </div>

      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px', lineHeight: '1.5' }}>
        {location.description || 'No description available'}
      </p>

      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>COORDINATES</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#374151', fontFamily: 'monospace' }}>
          {location.coordinates.lat.toFixed(4)}°N, {location.coordinates.lng.toFixed(4)}°E
        </p>
      </div>

      <div style={{ background: crowdBg, borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
        <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>CROWD STATUS</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: crowdDot }}></div>
          <p style={{ margin: 0, fontSize: '13px', color: crowdText, fontWeight: '500' }}>{crowdLabel}</p>
        </div>
        <div style={{ background: '#e5e7eb', borderRadius: '20px', height: '6px' }}>
          <div style={{ width: `${crowdCount}%`, height: '100%', borderRadius: '20px', background: crowdDot, transition: 'width 0.5s ease' }}></div>
        </div>
      </div>

      {location.connectedTo && location.connectedTo.length > 0 && (
        <div>
          <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>CONNECTED TO</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {location.connectedTo.map((conn, i) => (
              <span key={i} style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '20px' }}>
                {conn.name || conn}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar