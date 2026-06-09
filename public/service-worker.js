const CACHE_NAME = 'plantpal-v1'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim())
})

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {}
  const title = data.title || 'Plant Pal'
  const options = {
    body: data.body || 'Time to water your plants!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'plantpal-reminder',
    renotify: true,
    data: { url: data.url || '/' }
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus()
      }
      return clients.openWindow(e.notification.data.url || '/')
    })
  )
})

// Background sync — check overdue plants every hour
self.addEventListener('periodicsync', e => {
  if (e.tag === 'check-plants') {
    e.waitUntil(checkOverduePlants())
  }
})

async function checkOverduePlants() {
  try {
    const cache = await caches.open(CACHE_NAME)
    const resp = await cache.match('plantpal-overdue')
    if (resp) {
      const data = await resp.json()
      if (data.overdue && data.overdue.length > 0) {
        const names = data.overdue.join(', ')
        await self.registration.showNotification('Plant Pal 🌿', {
          body: `${data.overdue.length} plant${data.overdue.length > 1 ? 's' : ''} need watering: ${names}`,
          icon: '/icon-192.png',
          tag: 'overdue-plants'
        })
      }
    }
  } catch {}
}
