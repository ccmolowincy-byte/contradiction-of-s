/* sw.js — Service Worker for The Contradiction of S
 * Strategy:
 *   - Our own files: cache-first (fast repeat loads)
 *   - CDN libraries (Three.js, TF.js, Supabase, fonts): cache-first after first load
 *   - Supabase API calls: network-only (live data)
 *   - TF.js model weights (storage.googleapis.com): network-only (too large, HTTP-cached by browser)
 *
 * Bump CACHE_V when deploying significant updates to force clients to re-fetch.
 */
const CACHE_V = 'cos-v2';

const PRECACHE = [
  './ar.html',
  './gesture.html',
  './index.html',
  './projection.html',
  './style.css',
  './js/archive-cloud.js',
  './js/gesture.js',
  './js/custom-skel-draw.js',
  './js/transitions.js',
  './js/swipe-nav.js',
  './assets/skel/petals.png',
  './assets/skel/face.png',
  './assets/skel/bone.png',
  './assets/textures/xray-01.png',
  './assets/skel/stars/s00.png',
  './assets/skel/stars/s01.png',
  './assets/skel/stars/s02.png',
  './assets/skel/stars/s03.png',
  './assets/skel/stars/s04.png',
  './assets/skel/stars/s05.png',
  './assets/skel/stars/s06.png',
  './assets/skel/stars/s07.png',
  './assets/skel/stars/s08.png',
  './assets/skel/stars/s09.png',
  './assets/skel/stars/s10.png',
  './assets/skel/stars/s11.png',
  './assets/skel/stars/s12.png',
  './icons/app-icon.svg',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_V)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())  // Don't block install on precache failures
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_V).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET
  if (e.request.method !== 'GET') return;

  // Skip Supabase API (always live)
  if (url.hostname.includes('supabase.co')) return;

  // Skip TF.js model weights — too large, already HTTP-cached by browser
  if (url.hostname === 'storage.googleapis.com') return;
  if (url.hostname.includes('tfhub.dev')) return;

  // CDN libraries and fonts — cache on first load, serve from cache after
  const isCDN = url.hostname.includes('jsdelivr.net')
              || url.hostname.includes('fonts.googleapis.com')
              || url.hostname.includes('fonts.gstatic.com');

  if (isCDN) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(resp => {
          if (resp && resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE_V).then(c => c.put(e.request, clone));
          }
          return resp;
        });
      })
    );
    return;
  }

  // Our HTML pages — network-first so updates propagate; fall back to cache
  if (e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_V).then(c => c.put(e.request, clone));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // All other own assets — cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_V).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => undefined);
    })
  );
});
