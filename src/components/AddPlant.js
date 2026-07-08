import { useState, useRef } from 'react'
import { styles } from '../App'
import PlantIdentifier from './PlantIdentifier'
import { researchPlant } from '../plantApi'
import { uploadPhoto } from '../photoStorage'

const COLORS = ['#4a7c59','#7b9e6b','#c17f3e','#8b6b3d','#5b8a6f','#a05c2e','#3d6b4f','#9e7b4a']
const EMOJIS = ['🌿','🪴','🌱','🌵','🌺','🍃','🌻','🌸','🎋','🍀','🌴','🪷']

export default function AddPlant({ onBack, onSave }) {
  const [form, setForm] = useState({ name: '', emoji: '🌿', frequencyDays: 7, color: COLORS[0], notes: '', photoPath: null })
  const [saving, setSaving] = useState(false)
  const [showIdentifier, setShowIdentifier] = useState(false)
  const [researching, setResearching] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  async function handleManualPhoto(file) {
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const path = await uploadPhoto(file)
      setForm(f => ({ ...f, photoPath: path }))
    } catch (e) {
      console.error('Upload failed:', e)
    }
    setUploading(false)
  }

  async function handleIdentified(match, imageFile) {
    setShowIdentifier(false)
    setForm(f => ({ ...f, name: match.commonName }))
    if (imageFile) setPhotoPreview(URL.createObjectURL(imageFile))

    let photoPath = null
    if (imageFile) {
      try {
        photoPath = await uploadPhoto(imageFile)
        setForm(f => ({ ...f, name: match.commonName, photoPath }))
      } catch (e) { console.error('Photo upload failed:', e) }
    }

    setResearching(true)
    try {
      const data = await researchPlant(match.commonName)
      setForm(f => ({
        ...f,
        name: data.commonName || match.commonName,
        frequencyDays: data.wateringFrequencyDays || f.frequencyDays,
        notes: data.wateringTip || f.notes,
        photoPath: photoPath || f.photoPath
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
    <div style={{ background: '#f7fbf8', minHeight: '100vh' }}>
      <div style={styles.navBar}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <h2 style={{ fontSize: 18, color: '#1a3d28', fontWeight: 600 }}>New Plant</h2>
      </div>

      <div style={{ padding: '16px 16px 60px' }}>

        {/* Photo section */}
        <div style={{ marginBottom: 16 }}>
          {photoPreview ? (
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <img src={photoPreview} alt="Plant" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 14, border: '2px solid #b5d0bc', display: 'block' }} />
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>
                  Uploading…
                </div>
              )}
              <button onClick={() => { setPhotoPreview(null); setForm(f => ({ ...f, photoPath: null })) }}
                style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              <button onClick={() => fileRef.current.click()}
                style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                Change
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button onClick={() => fileRef.current.click()}
                style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#edf5f0', color: '#2d5e3e', border: '1.5px dashed #7b9e6b', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                📷 Add Photo
              </button>
              <button onClick={() => setShowIdentifier(true)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#edf5f0', color: '#2d5e3e', border: '1.5px dashed #7b9e6b', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                🔍 Identify
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }}
            onChange={e => handleManualPhoto(e.target.files[0])} />
        </div>

        {researching && (
          <div style={{ background: '#edf5f0', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#2d5e3e', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔍</span> Looking up care schedule…
          </div>
        )}

        <label style={styles.label}>Plant name</label>
        <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
          placeholder="e.g. Peace Lily" style={styles.input} />

        <label style={styles.label}>Emoji <span style={{ fontSize: 11, color: '#8aaa90', fontWeight: 400 }}>(shown if no photo)</span></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {EMOJIS.map(em => (
            <button key={em} onClick={() => setForm(f => ({...f, emoji: em}))}
              style={{ width: 42, height: 42, borderRadius: 10, border: `2px solid ${form.emoji === em ? '#4a7c59' : '#e8ede9'}`, background: form.emoji === em ? '#edf5f0' : '#fff', fontSize: 22, cursor: 'pointer' }}>
              {em}
            </button>
          ))}
        </div>

        <label style={styles.label}>Water every <strong style={{ color: '#2d5e3e' }}>{form.frequencyDays}</strong> days</label>
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

        <button onClick={handleSave} disabled={!form.name.trim() || saving || researching || uploading}
          style={{ ...styles.primaryBtn, opacity: form.name.trim() && !researching && !uploading ? 1 : 0.5 }}>
          {saving ? 'Saving…' : uploading ? 'Uploading photo…' : 'Save Plant 🌱'}
        </button>
      </div>

      {showIdentifier && (
        <PlantIdentifier onIdentified={handleIdentified} onClose={() => setShowIdentifier(false)} />
      )}
    </div>
  )
}
