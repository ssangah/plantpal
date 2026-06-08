import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import PlantCard from './components/PlantCard'
import AddPlant from './components/AddPlant'
import PlantDetail from './components/PlantDetail'
import Settings from './components/Settings'
import Onboarding from './components/Onboarding'
import Toast from './components/Toast'

export default function App() {
  const [plants, setPlants] = useState([])
  const [userName, setUserName] = useState(() => localStorage.getItem('plantpal_name') || '')
  const [view, setView] = useState('home')
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  const fetchPlants = useCallback(async () => {
    const { data, error } = await supabase
      .from('plants')
      .select('*, waterings(id, watered_at, watered_by)')
      .order('name')
    if (!error && data) {
      const normalized = data.map(p => ({
        ...p,
        logs: (p.waterings || [])
          .sort((a, b) => new Date(b.watered_at) - new Date(a.watered_at))
      }))
      setPlants(normalized)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPlants()

    // Real-time subscription — updates instantly when friend waters a plant
    const channel = supabase
      .channel('plantpal-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plants' }, fetchPlants)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waterings' }, fetchPlants)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchPlants])

  async function handleWater(plantId) {
    const { error } = await supabase.from('waterings').insert({
      plant_id: plantId,
      watered_by: userName || 'Someone',
      watered_at: new Date().toISOString()
    })
    if (!error) { showToast('💧 Watered!'); fetchPlants() }
    else showToast('Error saving — check connection')
  }

  async function handleAddPlant(form) {
    const { error } = await supabase.from('plants').insert({
      name: form.name,
      emoji: form.emoji,
      frequency_days: form.frequencyDays,
      color: form.color,
      notes: form.notes
    })
    if (!error) { showToast('🌱 Plant added!'); fetchPlants(); setView('home') }
    else showToast('Error adding plant')
  }

  async function handleDeletePlant(id) {
    await supabase.from('waterings').delete().eq('plant_id', id)
    await supabase.from('plants').delete().eq('id', id)
    showToast('Plant removed')
    fetchPlants()
    setView('home')
  }

  function handleSetName(name) {
    setUserName(name)
    localStorage.setItem('plantpal_name', name)
    showToast(`Welcome, ${name}! 👋`)
  }

  function getStatus(plant) {
    const last = plant.logs?.[0]
    if (!last) return { label: 'Never watered', level: 'urgent', pct: 100 }
    const days = Math.floor((Date.now() - new Date(last.watered_at)) / 86400000)
    const pct = Math.min(100, Math.round((days / plant.frequency_days) * 100))
    if (days >= plant.frequency_days) return { label: `${days}d overdue`, level: 'urgent', pct: 100 }
    if (days >= plant.frequency_days * 0.75) return { label: 'Due soon', level: 'soon', pct }
    return { label: `${plant.frequency_days - days}d left`, level: 'ok', pct }
  }

  const sorted = [...plants].sort((a, b) => {
    const order = { urgent: 0, soon: 1, ok: 2 }
    return order[getStatus(a).level] - order[getStatus(b).level]
  })

  const selected = plants.find(p => p.id === selectedId)

  if (!userName) return <Onboarding onSetName={handleSetName} />

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#4a7c59', fontSize: 18 }}>
      Loading your garden… 🌿
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f7fbf8' }}>
      <Toast message={toast} />

      {view === 'home' && (
        <div>
          <Header userName={userName} plants={plants} getStatus={getStatus}
            onSettings={() => setView('settings')} onRefresh={fetchPlants} />
          <div style={{ padding: '12px 16px' }}>
            {sorted.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#8aaa90' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🌱</div>
                <p style={{ fontSize: 16 }}>No plants yet — add your first one!</p>
              </div>
            )}
            {sorted.map(plant => (
              <PlantCard key={plant.id} plant={plant} status={getStatus(plant)}
                onWater={() => handleWater(plant.id)}
                onSelect={() => { setSelectedId(plant.id); setView('detail') }} />
            ))}
          </div>
          <div style={{ padding: '0 16px 32px' }}>
            <button onClick={() => setView('add')} style={styles.primaryBtn}>
              + Add Plant
            </button>
          </div>
        </div>
      )}

      {view === 'detail' && selected && (
        <PlantDetail plant={selected} status={getStatus(selected)}
          onBack={() => setView('home')}
          onWater={() => handleWater(selected.id)}
          onDelete={() => handleDeletePlant(selected.id)} />
      )}

      {view === 'add' && (
        <AddPlant onBack={() => setView('home')} onSave={handleAddPlant} />
      )}

      {view === 'settings' && (
        <Settings userName={userName} onBack={() => setView('home')}
          onSetName={handleSetName} onRefresh={fetchPlants} showToast={showToast} />
      )}
    </div>
  )
}

function Header({ userName, plants, getStatus, onSettings, onRefresh }) {
  const counts = plants.reduce((acc, p) => {
    acc[getStatus(p).level]++; return acc
  }, { urgent: 0, soon: 0, ok: 0 })

  return (
    <div style={{ background: '#fff', padding: '16px 16px 12px', borderBottom: '1px solid #e8ede9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 12, color: '#8aaa90', marginBottom: 2 }}>Welcome back,</p>
          <h1 style={{ fontSize: 20, color: '#2d5e3e', fontWeight: 700 }}>{userName} 🌿</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onRefresh} style={styles.iconBtn} title="Sync">🔄</button>
          <button onClick={onSettings} style={styles.iconBtn} title="Settings">⚙️</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['urgent','🚨','Overdue','#fdf0ec','#c04020'],['soon','⏰','Due soon','#fdf7e8','#a06d00'],['ok','✅','Happy','#edf5f0','#2d5e3e']].map(([lvl,ico,lbl,bg,clr]) => (
          <div key={lvl} style={{ flex: 1, background: bg, borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>{ico}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: clr }}>{counts[lvl]}</div>
            <div style={{ fontSize: 10, color: clr, opacity: 0.8 }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const styles = {
  primaryBtn: {
    width: '100%', padding: '14px', borderRadius: 14,
    background: '#4a7c59', color: '#fff', border: 'none',
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
  },
  secondaryBtn: {
    width: '100%', padding: '12px', borderRadius: 12,
    background: '#edf5f0', color: '#2d5e3e',
    border: '1.5px solid #b5d0bc', fontSize: 14,
    fontWeight: 600, cursor: 'pointer'
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    border: '1.5px solid #b5d0bc', background: '#fff',
    cursor: 'pointer', fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  navBar: {
    background: '#fff', padding: '14px 16px',
    borderBottom: '1px solid #e8ede9',
    display: 'flex', alignItems: 'center', gap: 10
  },
  backBtn: {
    background: 'none', border: 'none',
    fontSize: 22, cursor: 'pointer', color: '#4a7c59', padding: 0
  },
  label: {
    display: 'block', fontSize: 13,
    color: '#4a7c59', fontWeight: 600, marginBottom: 6
  },
  input: {
    width: '100%', padding: '11px 12px',
    borderRadius: 10, border: '1.5px solid #b5d0bc',
    fontSize: 15, outline: 'none',
    background: '#f7fbf8', marginBottom: 16, display: 'block'
  }
}
