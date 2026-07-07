const CACHE = 'chevelle-hdx-v10';
/* Code files are network-first (edits reach the iPad without a version bump);
   everything else stays cache-first. */
const CODE = [
  './', './index.html', './chevelle-hdx-interactive.html',
  './chevelle-wiremap.js', './chevelle-data.js', './chevelle-app.js', './manifest.json'
];
const STATIC = [
  './icon-180.png', './icon-192.png', './icon-512.png',
  './dash-reference.jpg', './dash-reference-closeup.jpg', './behind-dash-reference.jpg',
  './engine-bay-reference.jpg', './under-car-reference.jpg', './rear-sender-reference.jpg',
  './fonts/geist-400.woff2', './fonts/geist-500.woff2', './fonts/geist-600.woff2', './fonts/geist-700.woff2',
  './fonts/geist-mono-400.woff2', './fonts/geist-mono-500.woff2', './fonts/geist-mono-600.woff2',
  './aaw-diagrams/aaw-schematic-1971-72.png', './aaw-diagrams/aaw-fuse-panel-install.png',
  './aaw-diagrams/aaw-fuse-panel-layout.png', './aaw-diagrams/aaw-bag-h-instrument.png',
  './aaw-diagrams/aaw-bag-h-circuit-board.png', './aaw-diagrams/aaw-bag-j-engine-wiring.png',
  './aaw-diagrams/aaw-bag-j-engine-diagram.png', './aaw-diagrams/aaw-bag-m-rear-body.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      /* cache:'reload' bypasses the HTTP cache so a version bump always ships fresh bytes (F29);
         individual catch so one missing asset can't abort the whole precache */
      Promise.all(CODE.concat(STATIC).map(u =>
        c.add(new Request(u, { cache: 'reload' })).catch(err => console.warn('SW precache skip', u, err))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

function isCodeRequest(request) {
  if (request.mode === 'navigate') return true;
  const p = new URL(request.url).pathname;
  return /\/(chevelle-app\.js|chevelle-data\.js|chevelle-wiremap\.js|chevelle-hdx-interactive\.html|manifest\.json|index\.html)$/.test(p);
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (isCodeRequest(e.request)) {
    /* network-first with a 3s cap: newest content when online, but on flaky
       garage wifi fall back to cache fast instead of hanging (F11) */
    const network = fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    });
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (!cached) return network;                  // nothing cached: must wait for network
        const capped = network.catch(() => cached);   // never rejects → race can't reject
        const timeout = new Promise(r => setTimeout(() => r(cached), 3000));
        return Promise.race([capped, timeout]);       // whichever is first; network still revalidates
      })
    );
    return;
  }
  /* cache-first for images/fonts/diagrams, with runtime caching */
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
