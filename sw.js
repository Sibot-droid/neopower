// sw.js — network-first with cache fallback, so the app installs, loads fast,
// and still shows the last-seen stats when offline.
'use strict';
const CACHE = 'neopower-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const key = url.pathname.endsWith('/stats.json') ? 'stats.json' : e.request;
  e.respondWith(
    fetch(e.request).then((res) => {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(key, clone));
      return res;
    }).catch(() => caches.match(key).then((r) => r || caches.match('./index.html')))
  );
});
