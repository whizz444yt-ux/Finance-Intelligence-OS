/* ICT Futures Intelligence OS — same-origin shell cache only. External news, quotes and social data are never cached. */
const CACHE_PREFIX = 'ict-futures-shell-';
const CACHE_NAME = CACHE_PREFIX + 'v3.0.0';
const BASE_URL = new URL('./', self.registration.scope);
const BASE_PATH = BASE_URL.pathname;
const CORE_PATHS = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.webmanifest',
  BASE_PATH + 'icon.svg',
  BASE_PATH + 'data/market-universe.json',
  BASE_PATH + 'data/ict-playbook.json',
  BASE_PATH + 'data/ict-academy.json',
  BASE_PATH + 'data/source-directory.json',
  BASE_PATH + 'data/news-snapshot.json'
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_PATHS.map(async path => {
      try { const response = await fetch(path, {cache:'reload'}); if (response && response.ok) await cache.put(path, response.clone()); }
      catch (_) { /* best effort */ }
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
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE_PATH)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) { const cache = await caches.open(CACHE_NAME); await cache.put(request, response.clone()); }
        return response;
      } catch (_) { return (await caches.match(request)) || (await caches.match(BASE_PATH + 'index.html')) || Response.error(); }
    })());
    return;
  }
  if (CORE_PATHS.includes(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      const network = fetch(request).then(async response => { if (response && response.ok) { const cache = await caches.open(CACHE_NAME); await cache.put(request, response.clone()); } return response; }).catch(() => null);
      return cached || await network || Response.error();
    })());
  }
});
