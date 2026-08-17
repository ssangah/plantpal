import { useState, useRef } from 'react'
import { styles } from '../App'
import PlantResearch from './PlantResearch'
import { uploadPhoto } from '../photoStorage'
import { supabase } from '../supabaseClient'

const statusColors = {
  urgent: { bar: '#e05c3a', bg: '#fdf0ec', text: '#c04020' },
  soon:   { bar: '#d4940a', bg: '#fdf7e8', text: '#a06d00' },
  ok:     { bar: '#4a7c59', bg: '#edf5f0', text: '#2d5e3e' },
}

function Avatar({ name, size = 32 }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const hue = name.charCodeAt(0) * 37 % 360
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},45%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
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

// Added for debug

async function handlePhotoChange(file) {
  if (!file) return
  setPhotoPreview(URL.createObjectURL(file))
  setUploading(true)
  try {
    const path = await uploadPhoto(file)
    console.log('Uploaded path:', path)
    const { data, error } = await supabase.from('plants').update({ photo_url: path }).eq('id', plant.id)
    console.log('Update result:', data, error)
    if (onRefresh) onRefresh()
  } catch (e) {
    console.error('Photo update failed:', e)
  }
  setUploading(false)
}

// Added for debug

export default function PlantDetail({ plant, status, onBack, onWater, onDelete, onRefresh }) {
  const [showResearch, setShowResearch] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()
  const sc = statusColors[status.level]

  async function handlePhotoChange(file) {
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const path = await uploadPhoto(file)
      await supabase.from('plants').update({ photo_url: path }).eq('id', plant.id)
      if (onRefresh) onRefresh()
    } catch (e) {
      console.error('Photo update failed:', e)
    }
    setUploading(false)
  }

  const displayPhoto = photoPreview || plant.photo_url

  return (
    <div style={{ background: '#f7fbf8', minHeight: '100vh' }}>
      {/* Hero photo */}
      <div style={{ width: '100%', height: 220, overflow: 'hidden', position: 'relative', background: plant.color + '33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {displayPhoto
          ? <img src={displayPhoto} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 72 }}>{plant.emoji}</span>
        }
        {uploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>
            Uploading…
          </div>
        )}
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 50%)' }} />
        {/* Nav buttons */}
        <button onClick={onBack} style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8 }}>
          <button onClick={() => fileRef.current.click()}
            style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Change photo">📷</button>
          <button onClick={() => { if (window.confirm(`Remove ${plant.name}?`)) onDelete() }}
            style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment"
          style={{ display: 'none' }}
          onChange={e => handlePhotoChange(e.target.files[0])} />
      </div>

      <div style={{ padding: '16px 16px 60px' }}>
        <h2 style={{ fontSize: 20, color: '#1a3d28', fontWeight: 700, marginBottom: 14 }}>{plant.emoji} {plant.name}</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 14, padding: '16px', border: '1.5px solid #e8ede9', marginBottom: 14 }}>
          <ProgressRing pct={status.pct} color={sc.bar} size={64} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: sc.text }}>{status.label}</div>
            <div style={{ fontSize: 13, color: '#6b8c72', marginTop: 2 }}>Every {plant.frequency_days} days</div>
            {plant.notes && <div style={{ fontSize: 12, color: '#8aaa90', marginTop: 4 }}>{plant.notes}</div>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={onWater} style={{ ...styles.primaryBtn, flex: 1 }}>💧 Water Now</button>
          <button onClick={() => setShowResearch(true)}
            style={{ padding: '14px 16px', borderRadius: 14, background: '#edf5f0', color: '#2d5e3e', border: '1.5px solid #b5d0bc', cursor: 'pointer', fontSize: 18 }}
            title="AI plant research">🔍</button>
        </div>

        <h3 style={{ fontSize: 14, color: '#4a7c59', fontWeight: 600, marginBottom: 12 }}>Watering History</h3>
        {plant.logs?.length === 0 ? (
          <p style={{ color: '#8aaa90', fontSize: 14 }}>No watering logged yet.</p>
        ) : plant.logs.map((log, i) => (
          <div key={log.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f4f1' }}>
            <Avatar name={log.watered_by} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: '#1a3d28', fontWeight: 500 }}>{log.watered_by}</div>
              <div style={{ fontSize: 12, color: '#8aaa90' }}>{new Date(log.watered_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            </div>
            <div style={{ fontSize: 11, color: '#8aaa90' }}>{getDaysSince(log.watered_at) === 0 ? 'Today' : `${getDaysSince(log.watered_at)}d ago`}</div>
          </div>
        ))}
      </div>

      {showResearch && <PlantResearch plantName={plant.name} onClose={() => setShowResearch(false)} />}
    </div>
  )
}
