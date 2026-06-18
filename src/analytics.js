/**
 * ELISEE ANALYTICS
 * Principi: 7 (feedback loop), 8 (API-first), 9 (privacy), 10 (flywheel)
 *
 * Privacy-first: ZERO dati inviati a server esterni.
 * Tutto resta nel browser dell'utente. Trasparenza totale.
 */

const ANALYTICS_KEY = 'elisee:analytics';
const AB_KEY        = 'elisee:ab';

// ──────────────────────────────────────────────────────────────
// EVENT STORE (locale, privacy-first)
// ──────────────────────────────────────────────────────────────
function loadEvents() {
  try { return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]'); }
  catch { return []; }
}

function saveEvents(events) {
  try { localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events.slice(-500))); }
  catch { /* quota */ }
}

export function track(eventName, data = {}) {
  const events = loadEvents();
  events.push({
    e: eventName,
    d: data,
    t: Date.now(),
    s: getSessionId(),
  });
  saveEvents(events);

  // Aggiorna flywheel in tempo reale
  updateFlywheel(eventName, data);
}

// ──────────────────────────────────────────────────────────────
// SESSION
// ──────────────────────────────────────────────────────────────
let _sessionId = null;
function getSessionId() {
  if (!_sessionId) _sessionId = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  return _sessionId;
}

// ──────────────────────────────────────────────────────────────
// A/B TESTING
// Principio 7: A/B testing nativo
// ──────────────────────────────────────────────────────────────
export function getABVariant(testName, variants = ['a', 'b']) {
  try {
    const stored = JSON.parse(localStorage.getItem(AB_KEY) || '{}');
    if (stored[testName]) return stored[testName];
    const variant = variants[Math.floor(Math.random() * variants.length)];
    stored[testName] = variant;
    localStorage.setItem(AB_KEY, JSON.stringify(stored));
    return variant;
  } catch { return variants[0]; }
}

export function trackABConversion(testName, variant) {
  track('ab_conversion', { test: testName, variant });
}

// Active A/B tests
export const AB_TESTS = {
  HERO_CTA:      getABVariant('hero_cta', ['a', 'b']),  // a: 'Scopri' b: 'Shop Now'
  PRODUCT_SORT:  getABVariant('product_sort', ['relevance', 'new']), // default sort
};

// ──────────────────────────────────────────────────────────────
// FLYWHEEL — METRICHE DI VALORE REALE
// Principio 10: progresso visibile + insight azionabili
// ──────────────────────────────────────────────────────────────
const FLYWHEEL_KEY = 'elisee:flywheel';

function loadFlywheel() {
  try {
    return JSON.parse(localStorage.getItem(FLYWHEEL_KEY) || JSON.stringify({
      productsViewed:  0,
      productsWished:  0,
      cartAdds:        0,
      searchesRun:     0,
      savedAmount:     0,
      sessionDuration: 0,
      lastReset:       Date.now(),
      allTime: {
        productsViewed:  0,
        cartAdds:        0,
        ordersStarted:   0,
      }
    }));
  } catch { return {}; }
}

function saveFlywheel(fw) {
  try { localStorage.setItem(FLYWHEEL_KEY, JSON.stringify(fw)); }
  catch { /* quota */ }
}

function updateFlywheel(eventName, data) {
  const fw = loadFlywheel();
  switch (eventName) {
    case 'product_view':    fw.productsViewed++;    fw.allTime.productsViewed++;    break;
    case 'wishlist_add':    fw.productsWished++;    break;
    case 'cart_add':        fw.cartAdds++;          fw.allTime.cartAdds++;          break;
    case 'search':          fw.searchesRun++;       break;
    case 'promo_applied':   fw.savedAmount += (data.saved || 0);  break;
    case 'checkout_start':  fw.allTime.ordersStarted++;  break;
  }
  saveFlywheel(fw);
}

export function getFlywheel() { return loadFlywheel(); }

/**
 * Genera insights azionabili (non vanity metrics)
 */
export function getInsights(profile) {
  const fw = loadFlywheel();
  const events = loadEvents();
  const insights = [];

  // Insight 1: prodotti visti oggi
  const todayViews = events.filter(e =>
    e.e === 'product_view' && e.t > Date.now() - 86400000
  ).length;
  if (todayViews > 0) {
    insights.push({
      icon: '👁️',
      value: todayViews,
      label: `prodott${todayViews === 1 ? 'o visto' : 'i esplorati'} oggi`,
      type: 'views',
    });
  }

  // Insight 2: risparmio effettivo
  if (fw.savedAmount > 0) {
    insights.push({
      icon: '💶',
      value: `€${fw.savedAmount.toFixed(0)}`,
      label: 'risparmiati con i tuoi codici',
      type: 'savings',
      actionable: true,
    });
  }

  // Insight 3: wishlist
  const wishCount = profile.wishHistory?.length || 0;
  if (wishCount > 0) {
    insights.push({
      icon: '❤️',
      value: wishCount,
      label: `articol${wishCount === 1 ? 'o salvato' : 'i salvati'}`,
      type: 'wishlist',
      actionable: true,
    });
  }

  // Insight 4: stile definito
  if (profile.style) {
    const styleEmoji = { sport: '⚽', street: '🏙️', elegante: '✨', outdoor: '🏔️' };
    insights.push({
      icon: styleEmoji[profile.style] || '🎯',
      value: profile.style.charAt(0).toUpperCase() + profile.style.slice(1),
      label: 'il tuo stile Elisee',
      type: 'style',
    });
  }

  // Insight 5: sessioni totali (milestone)
  const sessions = profile.sessionCount || 0;
  const milestones = [5, 10, 25, 50];
  const nextMilestone = milestones.find(m => m > sessions);
  if (sessions >= 3 && nextMilestone) {
    const remaining = nextMilestone - sessions;
    insights.push({
      icon: '🏆',
      value: `${sessions} sessioni`,
      label: `ancora ${remaining} per sbloccare il badge VIP`,
      type: 'milestone',
    });
  }

  return insights;
}

// ──────────────────────────────────────────────────────────────
// FEEDBACK SEMPLICE
// Principio 7: canali di feedback integrati
// ──────────────────────────────────────────────────────────────
export function submitFeedback(rating, note = '') {
  track('feedback', { rating, note, url: window.location.href });
  return Promise.resolve({ ok: true });
}

export function getFeedbackHistory() {
  return loadEvents().filter(e => e.e === 'feedback');
}

// ──────────────────────────────────────────────────────────────
// PRIVACY DASHBOARD
// Principio 9: trasparenza totale
// ──────────────────────────────────────────────────────────────
export function getPrivacySummary() {
  const events = loadEvents();
  const fw     = loadFlywheel();
  const eventsMap = {};
  events.forEach(e => { eventsMap[e.e] = (eventsMap[e.e] || 0) + 1; });

  return {
    totalEvents:   events.length,
    eventTypes:    eventsMap,
    oldestEvent:   events[0]?.t ? new Date(events[0].t).toLocaleDateString('it-IT') : 'n/a',
    dataLocation:  'Solo sul tuo dispositivo',
    thirdParties:  'Nessuno',
    flywheel:      fw,
  };
}

export function clearAllData() {
  localStorage.removeItem(ANALYTICS_KEY);
  localStorage.removeItem(FLYWHEEL_KEY);
  localStorage.removeItem(AB_KEY);
}

// ──────────────────────────────────────────────────────────────
// PUBLIC API (Principio 8: API-first)
// ──────────────────────────────────────────────────────────────
export const AnalyticsAPI = {
  track,
  getInsights,
  getFlywheel,
  getPrivacySummary,
  clearAllData,
  getABVariant,
  AB_TESTS,
};
