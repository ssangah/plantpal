import { useState, useEffect } from 'react'
import {
  isNotificationsSupported,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  sendLocalNotification
} from '../notifications'

export default function NotificationSettings({ showToast }) {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSupported(isNotificationsSupported())
    setPermission(Notification.permission || 'default')
    checkSubscription()
  }, [])

  async function checkSubscription() {
    try {
      const reg = await navigator.serviceWorker?.ready
      const sub = await reg?.pushManager?.getSubscription()
      setSubscribed(!!sub)
    } catch {}
  }

  async function handleEnable() {
    setLoading(true)
    const perm = await requestNotificationPermission()
    setPermission(perm)
    if (perm === 'granted') {
      await subscribeToPush()
      setSubscribed(true)
      await sendLocalNotification('Plant Pal 🌿', 'Notifications enabled! We\'ll remind you when plants need watering.')
      showToast('Notifications enabled!')
    } else {
      showToast('Permission denied — check your browser settings')
    }
    setLoading(false)
  }

  async function handleDisable() {
    setLoading(true)
    await unsubscribeFromPush()
    setSubscribed(false)
    showToast('Notifications disabled')
    setLoading(false)
  }

  if (!supported) return (
    <div style={card}>
      <div style={title}>🔔 Push Notifications</div>
      <p style={desc}>
        Not supported in this browser. On iPhone, use Safari and add the app to your Home Screen first.
      </p>
    </div>
  )

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={title}>🔔 Reminders</div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
          background: subscribed ? '#edf5f0' : '#f0f4f1',
          color: subscribed ? '#2d5e3e' : '#8aaa90'
        }}>{subscribed ? 'On' : 'Off'}</span>
      </div>
      <p style={desc}>
        Get notified when plants are overdue for watering. Checks every 4 hours while the app is open.
      </p>
      {permission === 'denied' ? (
        <p style={{ fontSize: 12, color: '#c04020', marginTop: 8 }}>
          Notifications are blocked. Go to your browser settings to re-enable them.
        </p>
      ) : subscribed ? (
        <button onClick={handleDisable} disabled={loading}
          style={{ ...btn, background: '#fdf0ec', color: '#c04020', border: '1.5px solid #f5c4b3' }}>
          {loading ? 'Disabling…' : 'Turn off reminders'}
        </button>
      ) : (
        <button onClick={handleEnable} disabled={loading} style={btn}>
          {loading ? 'Enabling…' : 'Enable reminders'}
        </button>
      )}
    </div>
  )
}

const card = {
  background: '#fff', borderRadius: 14,
  border: '1.5px solid #e8ede9', padding: '16px', marginBottom: 14
}
const title = { fontWeight: 600, fontSize: 14, color: '#1a3d28', marginBottom: 4 }
const desc = { fontSize: 13, color: '#6b8c72', lineHeight: 1.5 }
const btn = {
  marginTop: 12, width: '100%', padding: '11px',
  borderRadius: 10, background: '#edf5f0', color: '#2d5e3e',
  border: '1.5px solid #b5d0bc', cursor: 'pointer',
  fontWeight: 600, fontSize: 14
}
