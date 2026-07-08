// Self-destructing SW — cleans up old registrations then dies.
// iOS Safari: any SW breaks cross-origin iframe redirects → page reload.
self.addEventListener('install', () => { self.skipWaiting() })
self.addEventListener('activate', () => { self.registration.unregister() })
