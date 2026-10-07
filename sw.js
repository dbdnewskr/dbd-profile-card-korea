const APP_CACHE = 'dbd-profile-app-v5';
const PORTRAIT_CACHE = 'dbd-profile-portraits-v1';
const CORE = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './embedded-assets.js',
  './portrait-data.js',
  './app.js',
  './manifest.webmanifest',
  './assets/favicon.svg',
  './assets/pwa-192.png',
  './assets/pwa-512.png',
  './assets/steam.png',
  './assets/playstation.png',
  './assets/switch.png',
  './assets/platforms/xbox.png',
  './assets/platforms/epic.png',
  './assets/platforms/msstore.png',
  './assets/platforms/discord.svg',
  './assets/grades/ash-1.png',
  './assets/grades/ash-2.png',
  './assets/grades/ash-3.png',
  './assets/grades/ash-4.png',
  './assets/grades/bronze-1.png',
  './assets/grades/bronze-2.png',
  './assets/grades/bronze-3.png',
  './assets/grades/bronze-4.png',
  './assets/grades/silver-1.png',
  './assets/grades/silver-2.png',
  './assets/grades/silver-3.png',
  './assets/grades/silver-4.png',
  './assets/grades/gold-1.png',
  './assets/grades/gold-2.png',
  './assets/grades/gold-3.png',
  './assets/grades/gold-4.png',
  './assets/grades/iri-1.png',
  './assets/grades/iri-2.png',
  './assets/grades/iri-3.png',
  './assets/grades/iri-4.png',
  './assets/grades/none.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keep = new Set([APP_CACHE, PORTRAIT_CACHE]);
    for (const key of await caches.keys()) if (!keep.has(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'images.weserv.nl') {
    event.respondWith((async()=>{
      const cache = await caches.open(PORTRAIT_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) await cache.put(req, res.clone());
        return res;
      } catch (e) {
        return hit || Response.error();
      }
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith((async()=>{
      const cache = await caches.open(APP_CACHE);
      const hit = await cache.match(req, {ignoreSearch:true});
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && res.ok) await cache.put(req, res.clone());
        return res;
      } catch (e) {
        if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
        return Response.error();
      }
    })());
  }
});

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type !== 'CACHE_PORTRAITS' || !Array.isArray(data.urls)) return;
  event.waitUntil((async()=>{
    const cache = await caches.open(PORTRAIT_CACHE);
    let done = 0, success = 0;
    const total = data.urls.length;
    for (const url of data.urls) {
      try {
        const req = new Request(url, {mode:'cors', credentials:'omit'});
        const exists = await cache.match(req);
        if (!exists) {
          const res = await fetch(req);
          if (!res.ok) throw new Error(String(res.status));
          await cache.put(req, res.clone());
        }
        success++;
      } catch (e) {}
      done++;
      event.source?.postMessage({type:'CACHE_PROGRESS', done, total, success});
    }
    event.source?.postMessage({type:'CACHE_COMPLETE', done, total, success});
  })());
});
