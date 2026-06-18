const CACHE_NAME = 'elisee-pwa-v4';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // Lasciamo passare le richieste liberamente, il SW serve solo per far riconoscere la PWA installabile
  event.respondWith(fetch(event.request).catch(() => new Response("Offline")));
});
