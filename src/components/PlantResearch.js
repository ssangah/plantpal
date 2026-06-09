import { useState, useEffect } from 'react'
import { researchPlant } from '../plantApi'

const difficultyColor = { Easy: '#2d5e3e', Moderate: '#a06d00', Expert: '#c04020' }
const difficultyBg = { Easy: '#edf5f0', Moderate: '#fdf7e8', Expert: '#fdf0ec' }

export default function PlantResearch({ plantName, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    researchPlant(plantName)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [plantName])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#f7fbf8', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 430, margin: '0 auto',
        maxHeight: '85vh', overflowY: 'auto', padding: '0 0 40px'
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#ccd9c8' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid #e8ede9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#8aaa90', marginBottom: 2 }}>AI Plant Research</div>
            <h2 style={{ fontSize: 17, color: '#1a3d28', fontWeight: 600, margin: 0 }}>{plantName}</h2>
          </div>
          <button onClick={onClose} style={{ background: '#e8ede9', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: '16px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b8c72' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 14 }}>Researching {plantName}…</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#c04020' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
              <p style={{ fontSize: 14 }}>{error}</p>
            </div>
          )}

          {data && (
            <div>
              {/* Scientific name + difficulty */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: '#6b8c72', fontStyle: 'italic' }}>{data.scientificName}</div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: difficultyBg[data.difficulty], color: difficultyColor[data.difficulty] }}>
                  {data.difficulty}
                </span>
              </div>

              {/* Key stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  ['💧', 'Water', `Every ${data.wateringFrequencyDays}d`],
                  ['☀️', 'Light', data.light],
                  ['💨', 'Humidity', data.humidity],
                ].map(([icon, label, val]) => (
                  <div key={label} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e8ede9', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
                    <div style={{ fontSize: 9, color: '#8aaa90', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1a3d28' }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Watering tip */}
              <div style={{ background: '#edf5f0', borderRadius: 10, padding: '12px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>💧</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#2d5e3e', marginBottom: 3 }}>Watering tip</div>
                  <div style={{ fontSize: 13, color: '#3d6b4f', lineHeight: 1.5 }}>{data.wateringTip}</div>
                </div>
              </div>

              {/* Quick tips */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#4a7c59', marginBottom: 8 }}>Quick tips</div>
                {data.quickTips?.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                    <span style={{ color: '#4a7c59', flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13, color: '#3d5e3e', lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Common problems */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#a06d00', marginBottom: 8 }}>Watch out for</div>
                {data.commonProblems?.map((prob, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                    <span style={{ color: '#d4940a', flexShrink: 0, marginTop: 1 }}>⚠</span>
                    <span style={{ fontSize: 13, color: '#5c4500', lineHeight: 1.5 }}>{prob}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, fontSize: 11, color: '#8aaa90', textAlign: 'center' }}>
                Powered by Claude AI
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
