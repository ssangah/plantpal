const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/service-worker.js')
    return reg
  } catch (err) {
    console.error('SW registration failed:', err)
    return null
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export async function subscribeToPush() {
  try {
    const reg = await navigator.serviceWorker.ready
    if (!VAPID_PUBLIC_KEY) {
      // Dev mode: just return a mock sub so the UI works
      return { mock: true }
    }
    const existing = await reg.pushManager.getSubscription()
    if (existing) return existing
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })
    return sub
  } catch (err) {
    console.error('Push subscribe failed:', err)
    return null
  }
}

export async function unsubscribeFromPush() {
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
    return true
  } catch { return false }
}

export function isNotificationsSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

// Store overdue plant names in SW cache so background sync can read it
export async function updateOverdueCache(overduePlantNames) {
  try {
    const reg = await navigator.serviceWorker.ready
    const cache = await caches.open('plantpal-v1')
    const data = JSON.stringify({ overdue: overduePlantNames, updatedAt: Date.now() })
    await cache.put('plantpal-overdue', new Response(data, { headers: { 'Content-Type': 'application/json' } }))
  } catch {}
}

// Fire a local notification immediately (no server needed)
export async function sendLocalNotification(title, body, tag = 'plantpal') {
  const permission = await requestNotificationPermission()
  if (permission !== 'granted') return false
  try {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(title, {
      body,
      icon: '/icon-192.png',
      tag,
      renotify: true
    })
    return true
  } catch { return false }
}

// Schedule a daily reminder check — runs while the tab is open
export function startReminderChecker(plants, getStatus, onFire) {
  function check() {
    const overdue = plants.filter(p => getStatus(p).level === 'urgent')
    if (overdue.length > 0) {
      const names = overdue.map(p => p.name).join(', ')
      sendLocalNotification(
        'Plant Pal 🌿',
        `${overdue.length} plant${overdue.length > 1 ? 's' : ''} need watering: ${names}`
      )
      updateOverdueCache(overdue.map(p => p.name))
      if (onFire) onFire(overdue)
    }
  }
  // Check once on load (after 5s delay), then every 4 hours
  const initial = setTimeout(check, 5000)
  const interval = setInterval(check, 4 * 60 * 60 * 1000)
  return () => { clearTimeout(initial); clearInterval(interval) }
}
