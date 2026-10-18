/* Public offline shell and notification delivery; private APIs are never cached. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(async (windows) => {
        const page = windows.find(
          (client) => new URL(client.url).origin === self.location.origin,
        )
        if (page) return page.focus()
        return self.clients.openWindow('/')
      }),
  )
})

self.addEventListener('push', (event) => {
  // Generic text protects private records on the lock screen.
  event.waitUntil(
    self.registration.showNotification('DAYSTAR · Your next small step', {
      body: 'A scheduled commitment is ready. Open your private workspace to see it.',
      icon: '/daystar.svg',
      tag: 'daystar-routines',
    }),
  )
})

// Only anonymous public shell/assets are cached. APIs, Identity callbacks,
// account pages with query tokens, and non-GET requests always use the network.
const SHELL_CACHE = 'daystar-shell-20261018-v1'
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const response = await fetch('/offline-assets.json', { cache: 'no-store', credentials: 'omit' })
    if (!response.ok) throw new Error('Offline asset list unavailable')
    const assets = await response.json()
    const cache = await caches.open(SHELL_CACHE)
    await Promise.all(assets.map(async (path) => {
      const result = await fetch(path, { credentials: 'omit', cache: 'reload' })
      if (!result.ok) throw new Error('Offline asset unavailable')
      await cache.put(path, result)
    }))
    const shell = await fetch('/', { credentials: 'omit', cache: 'reload' })
    if (!shell.ok || !shell.headers.get('content-type')?.includes('text/html')) throw new Error('Public shell unavailable')
    await cache.put('/offline-shell', shell)
  })())
})
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // No skipWaiting: updates activate after old tabs close. It is then safe
    // to remove only obsolete Daystar public shells, never private IndexedDB.
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key.startsWith('daystar-shell-') && key !== SHELL_CACHE).map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.search || url.hash) return
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith((async () => (await caches.match(event.request)) || fetch(event.request))())
  } else if (event.request.mode === 'navigate' && ['/', '/app'].includes(url.pathname)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { signal: AbortSignal.timeout(8000) })
        if (response.status < 500) return response
        throw new Error('Application temporarily unavailable')
      }
      catch {
        const cached = await caches.open(SHELL_CACHE).then((cache) => cache.match('/offline-shell'))
        return cached || new Response('Open Daystar online once to prepare offline access.', { status: 503, headers: { 'Content-Type': 'text/plain' } })
      }
    })())
  }
})
