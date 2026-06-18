/**
 * ELISEE — CACHE MULTI-LAYER
 * Principio 2: Velocità < 300ms percepiti
 *
 * Layer 1: Memory (Map) — accesso ~0ms
 * Layer 2: SessionStorage — accesso ~2ms
 * Layer 3: LocalStorage   — accesso ~5ms, persistente tra sessioni
 */

const MEM = new Map();

const TTL = {
  products:    5 * 60 * 1000,  // 5 min
  collections: 10 * 60 * 1000, // 10 min
  pdp:         15 * 60 * 1000, // 15 min
};

function now() { return Date.now(); }

/* ── Write ── */
export function cacheSet(key, data, ttl = TTL.products) {
  const entry = { data, exp: now() + ttl };
  MEM.set(key, entry);
  try {
    sessionStorage.setItem(`elisee:${key}`, JSON.stringify(entry));
  } catch { /* storage full — ok */ }
}

/* ── Read ── */
export function cacheGet(key) {
  // L1: Memory
  const mem = MEM.get(key);
  if (mem && mem.exp > now()) return mem.data;

  // L2: SessionStorage
  try {
    const raw = sessionStorage.getItem(`elisee:${key}`);
    if (raw) {
      const entry = JSON.parse(raw);
      if (entry.exp > now()) {
        MEM.set(key, entry); // promuovi in memoria
        return entry.data;
      }
      sessionStorage.removeItem(`elisee:${key}`);
    }
  } catch { /* parse error */ }

  return null;
}

/* ── Invalidate ── */
export function cacheClear(keyPrefix = '') {
  for (const k of MEM.keys()) {
    if (!keyPrefix || k.startsWith(keyPrefix)) MEM.delete(k);
  }
  if (!keyPrefix) {
    sessionStorage.clear();
  } else {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(`elisee:${keyPrefix}`)) sessionStorage.removeItem(k);
    }
  }
}

/* ── Prefetch immagini (lazy + priority) ── */
const prefetched = new Set();
export function prefetchImage(url) {
  if (!url || prefetched.has(url)) return;
  prefetched.add(url);
  const link = document.createElement('link');
  link.rel  = 'prefetch';
  link.as   = 'image';
  link.href = url;
  document.head.appendChild(link);
}

export function prefetchImages(urls = []) {
  // Prefetch prime 4 immediatamente, resto in idle
  urls.slice(0, 4).forEach(prefetchImage);
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => urls.slice(4).forEach(prefetchImage));
  }
}

/* ── Optimistic update helper ── */
export function withOptimistic(uiUpdateFn, asyncFn) {
  uiUpdateFn(); // aggiorna UI subito
  return asyncFn().catch(err => {
    console.warn('[cache] optimistic rollback:', err);
    throw err;
  });
}
