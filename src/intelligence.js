/**
 * ELISEE INTELLIGENCE ENGINE
 * Principi: 2 (velocità), 3 (AI core), 4 (onboarding), 5 (personalizzazione)
 *
 * Questo modulo è il "cervello" dell'app.
 * Impara dal comportamento dell'utente e adatta l'esperienza in tempo reale.
 * Tutto locale: zero chiamate esterne, zero tracking di terze parti.
 */

// ──────────────────────────────────────────────────────────────
// PROFILO UTENTE (persiste in localStorage, privacy-first)
// ──────────────────────────────────────────────────────────────
export const PROFILE_KEY = 'elisee:profile';

const DEFAULT_PROFILE = {
  name: 'Eliseo Miraglia', // Per far finta che l'utente sia già loggato
  email: 'utente@elisee.shop',
  dob: '',              // data di nascita
  pob: '',              // luogo di nascita
  style: null,          // 'sport' | 'street' | 'elegante' | 'outdoor'
  sizePrefs: {},        // { 'Taglia': 'M', ... }
  budget: null,         // 'low' | 'mid' | 'high'
  viewHistory: [],      // [{ id, title, cat, ts, duration }]
  cartHistory: [],      // [{ id, variantId, ts }]
  wishHistory: [],      // [productId]
  searchHistory: [],    // [query]
  sessionCount: 0,
  firstSeen: null,
  lastSeen: null,
  abVariant: null,      // per A/B testing
};

export function getProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_PROFILE, ...stored };
  } catch { return { ...DEFAULT_PROFILE }; }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      ...profile,
      lastSeen: Date.now(),
    }));
  } catch { /* storage full */ }
}

export function updateProfile(updates) {
  const p = getProfile();
  const merged = { ...p, ...updates };
  saveProfile(merged);
  return merged;
}

// ──────────────────────────────────────────────────────────────
// ONBOARDING: STYLE QUIZ
// Principio 4: valore in <60s
// ──────────────────────────────────────────────────────────────
export const STYLE_QUIZ = [
  {
    id: 'style',
    question: 'Qual è il tuo stile?',
    emoji: '🎯',
    options: [
      { value: 'sport',    label: 'Sport',    icon: '⚽' },
      { value: 'street',   label: 'Street',   icon: '🏙️' },
      { value: 'elegante', label: 'Elegante', icon: '✨' },
      { value: 'outdoor',  label: 'Outdoor',  icon: '🏔️' },
    ],
  },
  {
    id: 'budget',
    question: 'Il tuo budget medio per capo?',
    emoji: '💶',
    options: [
      { value: 'low',  label: '< €40',     icon: '💚' },
      { value: 'mid',  label: '€40 – €100', icon: '💛' },
      { value: 'high', label: '> €100',     icon: '🏆' },
    ],
  },
];

export function isFirstLaunch() {
  const p = getProfile();
  return !p.style && !p.firstSeen;
}

export function completeOnboarding(answers) {
  const p = getProfile();
  updateProfile({
    ...p,
    ...answers,
    firstSeen: Date.now(),
    sessionCount: 1,
  });
}

// ──────────────────────────────────────────────────────────────
// CONTEXT ENGINE
// Principio 5: contesto temporale + dispositivo
// ──────────────────────────────────────────────────────────────
export function getContext() {
  const h = new Date().getHours();
  let timeSlot;
  if (h >= 6  && h < 12) timeSlot = 'morning';
  else if (h >= 12 && h < 18) timeSlot = 'afternoon';
  else if (h >= 18 && h < 22) timeSlot = 'evening';
  else timeSlot = 'night';

  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;

  return {
    timeSlot,
    isWeekend,
    hour: h,
    isMobile: window.innerWidth < 600,
  };
}

export function getContextualHeadline(profile) {
  const ctx = getContext();
  const style = profile.style;
  const map = {
    morning:   { base: 'Buongiorno',  suffix: 'Inizia la giornata con stile.' },
    afternoon: { base: 'Ciao',        suffix: 'La tua collezione ti aspetta.' },
    evening:   { base: 'Buonasera',   suffix: 'Scopri i nuovi arrivi.' },
    night:     { base: 'Elisee',      suffix: 'Stile senza compromessi.' },
  };
  const { base, suffix } = map[ctx.timeSlot];
  return { base, suffix };
}

// ──────────────────────────────────────────────────────────────
// AI SCORING ENGINE
// Principio 3: AI come motore centrale
// ──────────────────────────────────────────────────────────────

/**
 * Calcola uno score di rilevanza per ogni prodotto in base al profilo utente.
 * Score 0-100: più alto = più rilevante per quell'utente.
 */
export function scoreProduct(product, profile) {
  let score = 50; // base

  const title = (product.title || '').toLowerCase();
  const vendor = (product.vendor || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const text = `${title} ${vendor} ${desc}`;

  // Boost per stile preferito
  const styleKeywords = {
    sport:    ['sport', 'running', 'jersey', 'calcio', 'basket', 'training', 'track'],
    street:   ['street', 'urban', 'hoodie', 'cap', 'tee', 'graphic', 'drop'],
    elegante: ['elegante', 'seta', 'lino', 'blazer', 'premium', 'luxe', 'limited'],
    outdoor:  ['outdoor', 'trekking', 'wind', 'fleece', 'tech', 'mountain'],
  };
  const kws = styleKeywords[profile.style] || [];
  const matches = kws.filter(k => text.includes(k)).length;
  score += matches * 12;

  // Budget fit
  const price = parseFloat(product.priceRange?.minVariantPrice?.amount || 0);
  if (profile.budget === 'low'  && price < 40)   score += 15;
  if (profile.budget === 'mid'  && price >= 40 && price <= 100) score += 15;
  if (profile.budget === 'high' && price > 100)  score += 15;

  // Boost per prodotti nella wishlist (alta intenzione)
  if (profile.wishHistory?.includes(product.id)) score += 25;

  // Penalità per prodotti già visti molte volte
  const views = profile.viewHistory?.filter(v => v.id === product.id).length || 0;
  if (views > 3) score -= 10;

  // Boost per prodotti con sconto (disponibilità)
  const v = product.variants?.edges?.[0]?.node;
  if (v?.compareAtPrice && parseFloat(v.compareAtPrice.amount) > parseFloat(v.price.amount)) {
    score += 8;
  }

  // Penalità se esaurito
  if (!product.availableForSale) score -= 30;

  // Context: weekend boost per capi casual
  const ctx = getContext();
  if (ctx.isWeekend && (profile.style === 'street' || profile.style === 'sport')) score += 5;
  if (!ctx.isWeekend && profile.style === 'elegante') score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Ordina i prodotti per rilevanza AI e ritorna i top N
 */
export function rankProducts(products, profile, limit = null) {
  const scored = products.map(p => ({ ...p, _score: scoreProduct(p, profile) }));
  scored.sort((a, b) => b._score - a._score);
  return limit ? scored.slice(0, limit) : scored;
}

/**
 * Smart search: fuzzy match + score AI
 */
export function smartSearch(products, query, profile) {
  if (!query.trim()) return rankProducts(products, profile);
  const q = query.toLowerCase().trim();
  const terms = q.split(' ').filter(Boolean);

  return products
    .map(p => {
      const collectionsText = p.collections?.edges?.map(e => e.node.title || '').join(' ') || '';
      const text = `${p.title} ${p.vendor} ${p.description} ${collectionsText}`.toLowerCase();
      const exactMatch = text.includes(q);
      const termScore = terms.filter(t => text.includes(t)).length / terms.length;
      
      // Esclude i prodotti che non corrispondono alla ricerca
      if (!exactMatch && termScore === 0) {
        return { ...p, _score: 0 };
      }

      const aiScore = scoreProduct(p, profile);
      return {
        ...p,
        _score: (exactMatch ? 100 : termScore * 60) + aiScore * 0.3,
      };
    })
    .filter(p => p._score > 0)
    .sort((a, b) => b._score - a._score);
}

// ──────────────────────────────────────────────────────────────
// OPTION PREFERENCES (Memory AI)
// ──────────────────────────────────────────────────────────────
export function saveOptionPreference(optionName, optionValue) {
  const p = getProfile();
  const prefs = p.optionPrefs || {};
  prefs[optionName.toLowerCase()] = optionValue;
  updateProfile({ optionPrefs: prefs });
}

export function getOptionPreference(optionName) {
  const p = getProfile();
  return p.optionPrefs ? p.optionPrefs[optionName.toLowerCase()] : null;
}

// ──────────────────────────────────────────────────────────────
// BEHAVIOR TRACKER
// Principio 5: più dati di qualità = più potenza percepita
// ──────────────────────────────────────────────────────────────
let _viewStart = null;
let _currentProductId = null;

export function trackView(product) {
  _viewStart = Date.now();
  _currentProductId = product.id;
}

export function trackViewEnd() {
  if (!_viewStart || !_currentProductId) return;
  const duration = Date.now() - _viewStart;
  if (duration < 500) return; // skip flash views

  const p = getProfile();
  const history = p.viewHistory || [];
  history.unshift({ id: _currentProductId, ts: Date.now(), duration });
  if (history.length > 50) history.pop(); // keep last 50

  updateProfile({ viewHistory: history });
  _viewStart = null;
  _currentProductId = null;
}

export function trackAddToCart(productId, variantId) {
  const p = getProfile();
  const history = p.cartHistory || [];
  history.unshift({ id: productId, variantId, ts: Date.now() });
  if (history.length > 30) history.pop();
  updateProfile({ cartHistory: history });
}

export function trackWishlist(productId, added) {
  const p = getProfile();
  let history = p.wishHistory || [];
  if (added) { if (!history.includes(productId)) history.unshift(productId); }
  else { history = history.filter(id => id !== productId); }
  updateProfile({ wishHistory: history });
}

export function trackSearch(query) {
  if (!query.trim()) return;
  const p = getProfile();
  const history = p.searchHistory || [];
  const clean = history.filter(q => q !== query);
  clean.unshift(query);
  updateProfile({ searchHistory: clean.slice(0, 10) });
}

export function incrementSession() {
  const p = getProfile();
  updateProfile({ sessionCount: (p.sessionCount || 0) + 1 });
}

// ──────────────────────────────────────────────────────────────
// RECOMMENDATIONS
// ──────────────────────────────────────────────────────────────
export function getRecommendations(allProducts, viewedProductId, limit = 4) {
  const viewed = allProducts.find(p => p.id === viewedProductId);
  if (!viewed) return allProducts.slice(0, limit);

  const profile = getProfile();
  
  // Otteniamo il tipo di prodotto o il primo tag per capire la categoria
  const viewedType = viewed.productType || (viewed.tags && viewed.tags[0]) || '';
  const viewedCollections = viewed.collections?.edges?.map(e => e.node.id) || [];

  // Cross-selling Semantico ("Completa l'Outfit")
  const others = allProducts
    .filter(p => p.id !== viewedProductId)
    .map(p => {
      let score = scoreProduct(p, profile);
      const pType = p.productType || (p.tags && p.tags[0]) || '';
      const pCollections = p.collections?.edges?.map(e => e.node.id) || [];
      
      const isSameType = (viewedType && pType === viewedType) || 
                         pCollections.some(c => viewedCollections.includes(c));

      if (isSameType) {
        score -= 20; // Penalità: Evitiamo di mostrare 4 magliette se sta già guardando una maglietta
      } else {
        score += 30; // Boost "Completa l'outfit": Suggeriamo accessori, pantaloni, etc.
      }

      return { ...p, _score: score };
    })
    .sort((a, b) => b._score - a._score);

  return others.slice(0, limit);
}

// ──────────────────────────────────────────────────────────────
// PRIVACY: Data export + delete
// ──────────────────────────────────────────────────────────────
export function exportUserData() {
  return JSON.stringify(getProfile(), null, 2);
}

export function deleteUserData() {
  localStorage.removeItem(PROFILE_KEY);
  sessionStorage.clear();
}

// ──────────────────────────────────────────────────────────────
// SMART TYPO AI (Levenshtein Distance)
// ──────────────────────────────────────────────────────────────
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function checkTypo(query, products) {
  if (!query || query.length < 3) return null;
  const q = query.toLowerCase().trim();
  
  // Extract unique words from all product titles and vendors
  const dictionary = new Set();
  products.forEach(p => {
    if (p.title) p.title.toLowerCase().split(/[\s-]+/).forEach(w => dictionary.add(w));
    if (p.vendor) p.vendor.toLowerCase().split(/[\s-]+/).forEach(w => dictionary.add(w));
  });
  
  // Aggiungiamo anche le collection al dizionario
  products.forEach(p => {
    if (p.collections && p.collections.edges) {
      p.collections.edges.forEach(e => {
        if (e.node.title) e.node.title.toLowerCase().split(/[\s-]+/).forEach(w => dictionary.add(w));
      });
    }
  });

  const words = q.split(/[\s-]+/);
  const correctedWords = words.map(word => {
    if (word.length < 3) return word; 
    if (dictionary.has(word)) return word;
    
    let localBest = word;
    let localMinDist = 3; // Correzione massima di 2 lettere
    
    dictionary.forEach(dictWord => {
      if (Math.abs(dictWord.length - word.length) > 2) return;
      const dist = levenshtein(word, dictWord);
      if (dist < localMinDist) {
        localMinDist = dist;
        localBest = dictWord;
      }
    });
    return localBest;
  });
  
  const correctedQuery = correctedWords.join(' ');
  return correctedQuery !== q ? correctedQuery : null;
}
