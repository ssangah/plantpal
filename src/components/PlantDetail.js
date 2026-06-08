import { styles } from '../App'

const statusColors = {
  urgent: { bar: '#e05c3a', bg: '#fdf0ec', text: '#c04020' },
  soon:   { bar: '#d4940a', bg: '#fdf7e8', text: '#a06d00' },
  ok:     { bar: '#4a7c59', bg: '#edf5f0', text: '#2d5e3e' },
}

function Avatar({ name, size = 32 }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const hue = name.charCodeAt(0) * 37 % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue},45%,55%)`, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, flexShrink: 0
    }}>{initials}</div>
  )
}

function getDaysSince(iso) {
  return Math.floor((Date.now() - new Date(iso)) / 86400000)
}

function ProgressRing({ pct, color, size = 64 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8ede9" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }} />
    </svg>
  )
}

export default function PlantDetail({ plant, status, onBack, onWater, onDelete }) {
  const sc = statusColors[status.level]

  return (
    <div>
      <div style={styles.navBar}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <h2 style={{ flex: 1, fontSize: 18, color: '#1a3d28', fontWeight: 600 }}>
          {plant.emoji} {plant.name}
        </h2>
        <button onClick={() => { if (window.confirm(`Remove ${plant.name}?`)) onDelete() }}
          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>🗑</button>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 14, padding: '16px', border: '1.5px solid #e8ede9', marginBottom: 14 }}>
          <ProgressRing pct={status.pct} color={sc.bar} size={64} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: sc.text }}>{status.label}</div>
            <div style={{ fontSize: 13, color: '#6b8c72', marginTop: 2 }}>Every {plant.frequency_days} days</div>
            {plant.notes && <div style={{ fontSize: 12, color: '#8aaa90', marginTop: 4 }}>{plant.notes}</div>}
          </div>
        </div>

        <button onClick={onWater} style={{ ...styles.primaryBtn, marginBottom: 24 }}>
          💧 Water Now
        </button>

        <h3 style={{ fontSize: 14, color: '#4a7c59', fontWeight: 600, marginBottom: 12 }}>Watering History</h3>

        {plant.logs?.length === 0 ? (
          <p style={{ color: '#8aaa90', fontSize: 14 }}>No watering logged yet.</p>
        ) : plant.logs.map((log, i) => (
          <div key={log.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f4f1' }}>
            <Avatar name={log.watered_by} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: '#1a3d28', fontWeight: 500 }}>{log.watered_by}</div>
              <div style={{ fontSize: 12, color: '#8aaa90' }}>
                {new Date(log.watered_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#8aaa90' }}>
              {getDaysSince(log.watered_at) === 0 ? 'Today' : `${getDaysSince(log.watered_at)}d ago`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
