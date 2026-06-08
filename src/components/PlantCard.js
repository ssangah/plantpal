import { useState } from 'react'

const statusColors = {
  urgent: { bar: '#e05c3a', bg: '#fdf0ec', text: '#c04020' },
  soon:   { bar: '#d4940a', bg: '#fdf7e8', text: '#a06d00' },
  ok:     { bar: '#4a7c59', bg: '#edf5f0', text: '#2d5e3e' },
}

function Avatar({ name, size = 14 }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const hue = name.charCodeAt(0) * 37 % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue},45%,55%)`, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 600, flexShrink: 0
    }}>{initials}</div>
  )
}

function getDaysSince(iso) {
  return Math.floor((Date.now() - new Date(iso)) / 86400000)
}

export default function PlantCard({ plant, status, onWater, onSelect }) {
  const [justWatered, setJustWatered] = useState(false)
  const sc = statusColors[status.level]
  const lastLog = plant.logs?.[0]

  function handleWater(e) {
    e.stopPropagation()
    setJustWatered(true)
    setTimeout(() => setJustWatered(false), 1200)
    onWater()
  }

  return (
    <div onClick={onSelect} style={{
      background: '#fff', borderRadius: 14,
      border: `1.5px solid ${justWatered ? '#4a7c59' : '#e8ede9'}`,
      padding: '12px 14px', marginBottom: 10,
      cursor: 'pointer', transition: 'border-color 0.3s',
      display: 'flex', alignItems: 'center', gap: 12
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: plant.color + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, flexShrink: 0
      }}>{plant.emoji}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#1a3d28' }}>{plant.name}</span>
          <span style={{ fontSize: 11, color: sc.text, background: sc.bg, padding: '2px 8px', borderRadius: 8, flexShrink: 0, marginLeft: 6 }}>
            {status.label}
          </span>
        </div>
        <div style={{ marginTop: 6, background: '#f0f4f1', borderRadius: 4, height: 4 }}>
          <div style={{ height: 4, borderRadius: 4, background: sc.bar, width: `${status.pct}%`, transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ marginTop: 5, fontSize: 11, color: '#8aaa90', display: 'flex', alignItems: 'center', gap: 4 }}>
          {lastLog ? (
            <>
              <Avatar name={lastLog.watered_by} size={14} />
              <span>{lastLog.watered_by} · {getDaysSince(lastLog.watered_at) === 0 ? 'today' : `${getDaysSince(lastLog.watered_at)}d ago`}</span>
            </>
          ) : <span>Never watered</span>}
        </div>
      </div>

      <button onClick={handleWater} style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: justWatered ? '#4a7c59' : '#edf5f0',
        border: 'none', cursor: 'pointer', fontSize: 18,
        transition: 'background 0.3s'
      }}>💧</button>
    </div>
  )
}
