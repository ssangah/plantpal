import { useState, useRef } from 'react'
import { identifyPlant } from '../plantApi'

export default function PlantIdentifier({ onIdentified, onClose }) {
  const [stage, setStage] = useState('upload') // upload | identifying | results | error
  const [results, setResults] = useState([])
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const fileRef = useRef()

  async function handleFile(file) {
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setStage('identifying')
    try {
      const matches = await identifyPlant(file)
      setResults(matches)
      setStage('results')
    } catch (e) {
      setError(e.message)
      setStage('error')
    }
  }

  function handleSelect(match) {
    onIdentified(match)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#f7fbf8', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 430, margin: '0 auto',
        padding: '0 0 40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#ccd9c8' }} />
        </div>

        <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid #e8ede9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 17, color: '#1a3d28', fontWeight: 600, margin: 0 }}>📷 Identify a Plant</h2>
          <button onClick={onClose} style={{ background: '#e8ede9', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <div style={{ padding: '16px' }}>

          {stage === 'upload' && (
            <div>
              <p style={{ fontSize: 13, color: '#6b8c72', marginBottom: 16, lineHeight: 1.5 }}>
                Take or upload a photo of a plant leaf — we'll identify it and suggest a watering schedule.
              </p>
              <input ref={fileRef} type="file" accept="image/*" capture="environment"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])} />
              <button onClick={() => { fileRef.current.setAttribute('capture', 'environment'); fileRef.current.click() }}
                style={primaryBtn}>
                📷 Take a Photo
              </button>
              <button onClick={() => { fileRef.current.removeAttribute('capture'); fileRef.current.click() }}
                style={{ ...secondaryBtn, marginTop: 10 }}>
                🖼 Choose from Library
              </button>
              <p style={{ fontSize: 11, color: '#8aaa90', textAlign: 'center', marginTop: 12 }}>
                Powered by PlantNet · Best results with a clear leaf photo
              </p>
            </div>
          )}

          {stage === 'identifying' && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              {preview && <img src={preview} alt="Plant" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />}
              <div style={{ fontSize: 13, color: '#6b8c72' }}>Identifying your plant…</div>
            </div>
          )}

          {stage === 'results' && (
            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                {preview && <img src={preview} alt="Plant" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3d28' }}>Top matches</div>
                  <div style={{ fontSize: 11, color: '#8aaa90' }}>Tap one to use it</div>
                </div>
              </div>
              {results.map((r, i) => (
                <button key={i} onClick={() => handleSelect(r)}
                  style={{ width: '100%', background: '#fff', borderRadius: 12, border: '1.5px solid #e8ede9', padding: '12px 14px', marginBottom: 8, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3d28' }}>{r.commonName}</div>
                    <div style={{ fontSize: 11, color: '#8aaa90', fontStyle: 'italic' }}>{r.scientificName}</div>
                    {r.family && <div style={{ fontSize: 10, color: '#b5d0bc', marginTop: 2 }}>{r.family}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: r.confidence > 70 ? '#2d5e3e' : r.confidence > 40 ? '#a06d00' : '#8aaa90' }}>
                      {r.confidence}%
                    </div>
                    <div style={{ fontSize: 9, color: '#8aaa90' }}>match</div>
                  </div>
                </button>
              ))}
              <button onClick={() => setStage('upload')} style={{ ...secondaryBtn, marginTop: 6 }}>
                Try another photo
              </button>
            </div>
          )}

          {stage === 'error' && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🍂</div>
              <div style={{ fontSize: 14, color: '#c04020', marginBottom: 16 }}>{error || 'Could not identify plant'}</div>
              <button onClick={() => setStage('upload')} style={primaryBtn}>Try again</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

const primaryBtn = {
  width: '100%', padding: '13px', borderRadius: 12,
  background: '#4a7c59', color: '#fff', border: 'none',
  fontSize: 15, fontWeight: 600, cursor: 'pointer'
}
const secondaryBtn = {
  width: '100%', padding: '12px', borderRadius: 12,
  background: '#edf5f0', color: '#2d5e3e',
  border: '1.5px solid #b5d0bc', fontSize: 14,
  fontWeight: 600, cursor: 'pointer'
}
