// ─── Elisee PWA Service Worker v7 ────────────────────────────────────────────
// Strategia: Network-first per navigazione, cache-first per assets statici.
// La versione viene aggiornata ad ogni deploy (cambio CACHE_NAME).
const CACHE_NAME = 'elisee-pwa-v7';

// Asset critici da precachare
const PRECACHE_URLS = [
  '/',
  '/explore',
  '/manifest.json',
];

// ─── Install: precache + skipWaiting immediato ────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Attiva subito il nuovo SW senza aspettare che le tab vecchie si chiudano
  self.skipWaiting();
});

// ─── Activate: rimuove le cache obsolete ─────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Eliminata cache obsoleta:', key);
            return caches.delete(key);
          })
      )
    )
  );
  // Prende il controllo di tutte le tab aperte immediatamente
  event.waitUntil(self.clients.claim());
});

// ─── Fetch: Network-first per pagine, Stale-while-revalidate per assets ───────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora richieste non HTTP (chrome-extension, ecc.)
  if (!url.protocol.startsWith('http')) return;

  // Ignora richieste API e Shopify (sempre network)
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('shopify') ||
    url.hostname.includes('myshopify') ||
    request.method !== 'GET'
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Navigazione (HTML) → Network-first: sempre la versione più aggiornata
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    );
    return;
  }

  // Asset statici (JS, CSS, img) → Stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        // Serve subito dalla cache (se disponibile), aggiorna in background
        return cached || networkFetch;
      })
    )
  );
});

// ─── Messaggio dal client: forza refresh cache ───────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});
