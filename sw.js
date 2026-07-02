// Service worker for the AlpRoute PWA.
// - Caches the same-origin app shell so the app launches offline.
// - Caches map tiles you browse so previously-seen areas still render offline.
// Cross-origin data calls (Supabase, CDNs, Overpass, translation, the optimizer
// API) always go to the network and are never intercepted — auth, payments and
// live data keep working normally.

const CACHE = 'alproute-shell-v114';
const TILES = 'alproute-tiles-v2';   // bumped: purges old 1024px @2x satellite tiles on activate
const TILE_MAX = 1500;            // cap cached tiles (~a few large regions)
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon-180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== TILES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function trimTiles(cache) {
  cache.keys().then((keys) => {
    const over = keys.length - TILE_MAX;
    for (let i = 0; i < over; i++) cache.delete(keys[i]);
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // never touch POST (API/auth/payments)
  const url = new URL(req.url);

  // Map tiles → cache-first, so browsed areas work offline.
  if (/(^|\.)tile\.openstreetmap\.org$/.test(url.hostname) || url.hostname === 'api.maptiler.com') {
    e.respondWith(
      caches.open(TILES).then((cache) =>
        cache.match(req).then((hit) =>
          hit || fetch(req).then((resp) => {
            if (resp && (resp.ok || resp.type === 'opaque')) { cache.put(req, resp.clone()); trimTiles(cache); }
            return resp;
          }).catch(() => hit)
        )
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;  // let CDN / Supabase / APIs hit network

  // App launches: fresh if online, cached shell offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  // Other same-origin GETs (icons, manifest): cache-first.
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
