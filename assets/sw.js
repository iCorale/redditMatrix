// Self-destructing SW — cleans up old registrations then dies.
// iOS Safari: any SW breaks cross-origin iframe redirects → page reload.
self.addEventListener('install', () => { self.skipWaiting() })
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
    const clients = await self.clients.matchAll({ type: 'window' })
    await Promise.all(clients.map((client) => client.navigate(client.url)))
    await self.registration.unregister()
  })())
})
