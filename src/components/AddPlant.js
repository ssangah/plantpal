import { useState } from 'react'
import { styles } from '../App'
import PlantIdentifier from './PlantIdentifier'
import { researchPlant } from '../plantApi'

const COLORS = ['#4a7c59','#7b9e6b','#c17f3e','#8b6b3d','#5b8a6f','#a05c2e','#3d6b4f','#9e7b4a']
const EMOJIS = ['🌿','🪴','🌱','🌵','🌺','🍃','🌻','🌸','🎋','🍀','🌴','🪷']

export default function AddPlant({ onBack, onSave }) {
  const [form, setForm] = useState({ name: '', emoji: '🌿', frequencyDays: 7, color: COLORS[0], notes: '' })
  const [saving, setSaving] = useState(false)
  const [showIdentifier, setShowIdentifier] = useState(false)
  const [researching, setResearching] = useState(false)

  async function handleIdentified(match) {
    setShowIdentifier(false)
    setForm(f => ({ ...f, name: match.commonName }))
    // Auto-research the identified plant
    setResearching(true)
    try {
      const data = await researchPlant(match.commonName)
      setForm(f => ({
        ...f,
        name: data.commonName || match.commonName,
        frequencyDays: data.wateringFrequencyDays || f.frequencyDays,
        notes: data.wateringTip || f.notes
      }))
    } catch {}
    setResearching(false)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave({ ...form, name: form.name.trim() })
    setSaving(false)
  }

  return (
    <div>
      <div style={styles.navBar}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <h2 style={{ fontSize: 18, color: '#1a3d28', fontWeight: 600 }}>New Plant</h2>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Identify from photo */}
        <button onClick={() => setShowIdentifier(true)}
          style={{ width: '100%', padding: '12px', borderRadius: 12, background: '#edf5f0', color: '#2d5e3e', border: '1.5px dashed #7b9e6b', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          📷 Identify from a photo instead
        </button>

        {researching && (
          <div style={{ background: '#edf5f0', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#2d5e3e', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔍</span> Looking up care schedule…
          </div>
        )}

        <label style={styles.label}>Plant name</label>
        <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
          placeholder="e.g. Peace Lily"
          style={styles.input} />

        <label style={styles.label}>Emoji</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {EMOJIS.map(em => (
            <button key={em} onClick={() => setForm(f => ({...f, emoji: em}))}
              style={{ width: 42, height: 42, borderRadius: 10, border: `2px solid ${form.emoji === em ? '#4a7c59' : '#e8ede9'}`, background: form.emoji === em ? '#edf5f0' : '#fff', fontSize: 22, cursor: 'pointer' }}>
              {em}
            </button>
          ))}
        </div>

        <label style={styles.label}>
          Water every <strong style={{ color: '#2d5e3e' }}>{form.frequencyDays}</strong> days
        </label>
        <input type="range" min={1} max={30} step={1} value={form.frequencyDays}
          onChange={e => setForm(f => ({...f, frequencyDays: Number(e.target.value)}))}
          style={{ marginBottom: 16 }} />

        <label style={styles.label}>Color tag</label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setForm(f => ({...f, color: c}))}
              style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #1a3d28' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>

        <label style={styles.label}>Notes (optional)</label>
        <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
          placeholder="Care tips, location…" rows={3}
          style={{ ...styles.input, resize: 'none', lineHeight: 1.5 }} />

        <button onClick={handleSave} disabled={!form.name.trim() || saving || researching}
          style={{ ...styles.primaryBtn, opacity: form.name.trim() && !researching ? 1 : 0.5 }}>
          {saving ? 'Saving…' : 'Save Plant 🌱'}
        </button>
      </div>

      {showIdentifier && (
        <PlantIdentifier
          onIdentified={handleIdentified}
          onClose={() => setShowIdentifier(false)}
        />
      )}
    </div>
  )
}
