import { useState } from 'react'

export default function Onboarding({ onSetName }) {
  const [name, setName] = useState('')

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', padding: '4rem 1.5rem', minHeight: '100vh', background: '#f7fbf8', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🪴</div>
        <h1 style={{ fontSize: 28, color: '#2d5e3e', fontWeight: 700, marginBottom: 8 }}>Plant Pal</h1>
        <p style={{ color: '#6b8c72', fontSize: 15 }}>Keep your plants alive, together</p>
      </div>

      <label style={{ display: 'block', fontSize: 13, color: '#4a7c59', fontWeight: 600, marginBottom: 8 }}>
        Your name
      </label>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && name.trim() && onSetName(name.trim())}
        placeholder="e.g. Alex"
        autoFocus
        style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: '1.5px solid #b5d0bc', fontSize: 16, outline: 'none', background: '#fff', marginBottom: 8 }}
      />
      <p style={{ fontSize: 12, color: '#8aaa90', marginBottom: 20 }}>
        This shows up in the watering log so your friend knows who did it
      </p>
      <button
        onClick={() => name.trim() && onSetName(name.trim())}
        disabled={!name.trim()}
        style={{ width: '100%', padding: '14px', borderRadius: 14, background: name.trim() ? '#4a7c59' : '#b5d0bc', color: '#fff', border: 'none', fontSize: 16, fontWeight: 600, cursor: name.trim() ? 'pointer' : 'default' }}>
        Enter Garden →
      </button>
    </div>
  )
}
