import { useState } from 'react'
import { styles } from '../App'
import NotificationSettings from './NotificationSettings'

export default function Settings({ userName, onBack, onSetName, onRefresh, showToast }) {
  const [nameInput, setNameInput] = useState(userName)

  function handleSaveName() {
    if (!nameInput.trim()) return
    onSetName(nameInput.trim())
    onBack()
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('Link copied! 📋'))
      .catch(() => showToast('Copy failed — share the URL manually'))
  }

  return (
    <div>
      <div style={styles.navBar}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <h2 style={{ fontSize: 18, color: '#1a3d28', fontWeight: 600 }}>Settings</h2>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={card}>
          <label style={styles.label}>Your display name</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={nameInput} onChange={e => setNameInput(e.target.value)}
              style={{ ...styles.input, margin: 0, flex: 1 }} />
            <button onClick={handleSaveName}
              style={{ padding: '0 16px', borderRadius: 10, background: '#4a7c59', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Save
            </button>
          </div>
        </div>

        <NotificationSettings showToast={showToast} />

        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1a3d28', marginBottom: 6 }}>🤝 Share with a friend</div>
          <p style={{ fontSize: 13, color: '#6b8c72', marginBottom: 12, lineHeight: 1.5 }}>
            Share this page's URL with your friend. They open it, enter their name, and you're both tracking the same garden in real time.
          </p>
          <button onClick={handleCopyLink} style={styles.secondaryBtn}>
            📋 Copy link
          </button>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1a3d28', marginBottom: 6 }}>🔄 Sync</div>
          <p style={{ fontSize: 13, color: '#6b8c72', marginBottom: 12 }}>
            The app updates automatically, but you can also pull the latest manually.
          </p>
          <button onClick={() => { onRefresh(); showToast('Synced ✓'); onBack() }} style={styles.secondaryBtn}>
            Refresh now
          </button>
        </div>
      </div>
    </div>
  )
}

const card = {
  background: '#fff', borderRadius: 14, border: '1.5px solid #e8ede9',
  padding: '16px', marginBottom: 14
}
