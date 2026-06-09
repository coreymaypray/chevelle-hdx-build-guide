const CACHE = 'chevelle-hdx-v7';
const ASSETS = [
  './',
  './index.html',
  './chevelle-hdx-interactive.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './dash-reference.jpg',
  './dash-reference-closeup.jpg',
  './behind-dash-reference.jpg',
  './aaw-diagrams/aaw-schematic-1971-72.png',
  './aaw-diagrams/aaw-fuse-panel-install.png',
  './aaw-diagrams/aaw-fuse-panel-layout.png',
  './aaw-diagrams/aaw-bag-h-instrument.png',
  './aaw-diagrams/aaw-bag-h-circuit-board.png',
  './aaw-diagrams/aaw-bag-j-engine-wiring.png',
  './aaw-diagrams/aaw-bag-j-engine-diagram.png',
  './aaw-diagrams/aaw-bag-m-rear-body.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // Cache files individually so one missing asset can't abort the whole precache
      Promise.all(ASSETS.map(u => c.add(u).catch(err => console.warn('SW precache skip', u, err))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Runtime cache same-origin GETs so anything viewed online survives offline
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
