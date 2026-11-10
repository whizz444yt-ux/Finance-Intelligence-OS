/* Finance Intelligence OS — offline application shell. External feeds are never cached here. */
const CACHE_PREFIX = 'fios-shell-';
const CACHE_NAME = CACHE_PREFIX + 'v1.1.1-futures-only';
const BASE_URL = new URL('./', self.registration.scope);
const BASE_PATH = BASE_URL.pathname;
const CORE_PATHS = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.webmanifest',
  BASE_PATH + 'icon.svg',
  BASE_PATH + 'resources.json',
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_PATHS.map(async path => {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response && response.ok) await cache.put(path, response.clone());
      } catch (_) { /* best effort; offline-first visit still works where assets are cached */ }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Do not cache cross-origin provider calls, query results, news, quotes, charts or user APIs.
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE_PATH)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) || (await caches.match(BASE_PATH + 'index.html')) || Response.error();
      }
    })());
    return;
  }
  if (CORE_PATHS.includes(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      const network = fetch(request).then(async response => {
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      }).catch(() => null);
      return cached || await network || Response.error();
    })());
  }
});
