const CACHE = 'chevelle-hdx-v3';
const ASSETS = [
  './',
  './chevelle-hdx-interactive.html',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  './dash-reference.jpg',
  './dash-reference-closeup.jpg',
  './behind-dash-reference.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
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
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
