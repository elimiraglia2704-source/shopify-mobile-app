/**
 * ELISEE MOBILE APP — CORE
 * Tutti i 10 principi integrati come sistema unico.
 *
 * P2: Velocità    → cache multi-layer, ottimistic UI, lazy loading
 * P3: AI Core     → intelligence engine integrato in ogni schermata
 * P4: Onboarding  → style quiz <60s, aha moment immediato
 * P5: Personalizz → contesto temporale, scoring comportamentale
 * P6: Design      → minimalista + power user layer (Konami code)
 * P7: Feedback    → analytics eventi, A/B testing nativo
 * P8: API-first   → window.EliseeApp pubblica
 * P9: Privacy     → zero trackers esterni, data export/delete
 * P10: Flywheel   → metriche reali visibili, insights azionabili
 */

import { ShopifyClient }  from './shopify.js';
import { cacheGet, cacheSet, prefetchImages } from './cache.js';
import {
  getProfile, updateProfile, incrementSession,
  STYLE_QUIZ, isFirstLaunch, completeOnboarding,
  rankProducts, smartSearch, trackView, trackViewEnd,
  trackAddToCart, trackWishlist, trackSearch,
  getContextualHeadline, getContext, getRecommendations,
  exportUserData, deleteUserData,
} from './intelligence.js';
import {
  track, getInsights, getFlywheel, getPrivacySummary,
  submitFeedback, AB_TESTS, trackABConversion, AnalyticsAPI,
} from './analytics.js';
import { MOCK_CUSTOMERS } from './mock-data.js';
import CONFIG from './config.js';

// Registrazione Service Worker per PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW setup failed', err));
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

// ═══════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════
const shopify = new ShopifyClient();

// ════════ GLOBAL ERROR HANDLER (Task 8) ════════
window.addEventListener('error', (e) => {
  console.error("Global Error Caught:", e.error);
  toast("Si è verificato un errore imprevisto. Riprova.", true);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error("Unhandled Promise Rejection:", e.reason);
  toast("Errore di rete o server irraggiungibile.", true);
});
// ════════════════════════════════════════════════

import { state } from './state.js';
import { $, $$, fmt, toast, refreshIcons, haptic } from './utils.js';
import { openCart, closeCart, updateCartBadge, addToCart, updateQty, renderCartBody, checkout } from './components/Cart.js';
import { initAssistant } from './components/Assistant.js';
import { initAuth } from './components/Auth.js';

// ═══════════════════════════════════════════════════════════
function go(screen, pushToHistory = true) {
  if (!$(`screen-${screen}`)) return;
  haptic(20);
  closeMenu(); closeCart();
  state.prevScreen = state.screen;
  state.screen = screen;

  $$('.screen').forEach(s => s.classList.remove('active'));
  $(`screen-${screen}`).classList.add('active');

  $$('.nav-tab[data-screen]').forEach(b => b.classList.toggle('active', b.dataset.screen === screen));

  if (screen === 'catalog') $('search-input')?.focus();
  if (screen === 'home')    renderFlywheel();
  $('app-main').scrollTop = 0;

  if (pushToHistory) {
    history.pushState({ screen }, '', `#${screen}`);
  }

  track('screen_view', { screen });
}
window.go = go; // global for inline HTML

// ═══════════════════════════════════════════════════════════
// SIDE MENU
// ═══════════════════════════════════════════════════════════
function openMenu() {
  haptic(15);
  $('side-menu').classList.add('open'); 
  $('menu-backdrop').classList.add('open');
  history.pushState({ overlay: 'menu' }, '', window.location.hash);
}
function closeMenu() { 
  $('side-menu').classList.remove('open'); 
  $('menu-backdrop').classList.remove('open');
  if (history.state?.overlay === 'menu') history.back();
}

function saveWish() { localStorage.setItem('elisee:wish', JSON.stringify(state.wishlist)); }

// ═══════════════════════════════════════════════════════════
// WISHLIST
// ═══════════════════════════════════════════════════════════
function isWished(id) { return state.wishlist.includes(id); }

function toggleWish(productId) {
  haptic(30);
  const added = !isWished(productId);
  if (added) state.wishlist.push(productId);
  else        state.wishlist = state.wishlist.filter(id => id !== productId);
  saveWish();
  trackWishlist(productId, added);
  track(added ? 'wishlist_add' : 'wishlist_remove', { productId });
  toast(added ? '❤️ Aggiunto ai preferiti' : 'Rimosso dai preferiti');
  // Refresh wish icons
  $$(`.prod-wish[data-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle('wished', added);
    const ico = btn.querySelector('i');
    if (ico) { ico.style.fill = added ? 'var(--purple-light)' : 'none'; }
  });
  if (state.activeProduct?.id === productId) syncPDPWish();
}

function syncPDPWish() {
  const btn = $('pdp-wish-btn');
  if (!btn || !state.activeProduct) return;
  const w = isWished(state.activeProduct.id);
  btn.classList.toggle('wished', w);
  const ico = btn.querySelector('i');
  if (ico) ico.style.fill = w ? 'var(--purple-light)' : 'none';
}

// ═══════════════════════════════════════════════════════════
// FLYWHEEL — Principio 10
// ═══════════════════════════════════════════════════════════
function renderFlywheel() {
  const bar = document.querySelector('.flywheel-bar');
  if (!bar) return;
  const profile  = getProfile();
  const insights = getInsights(profile);
  if (!insights.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  bar.innerHTML = '';
  insights.forEach(ins => {
    const chip = document.createElement('div');
    chip.className = 'flywheel-chip';
    chip.innerHTML = `
      <span class="flywheel-val ${ins.type === 'savings' ? 'accent' : ''}">${ins.icon} ${ins.value}</span>
      <span class="flywheel-lbl">${ins.label}</span>`;
    bar.appendChild(chip);
  });
}

// ═══════════════════════════════════════════════════════════
// PRODUCT CARD
// ═══════════════════════════════════════════════════════════
function makeCard(product, showAIBadge = false) {
  const card = document.createElement('div');
  card.className = 'prod-card';

  const img = product.images.edges[0]?.node.url || '';
  const v   = product.variants.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  const hasDiscount = v?.compareAtPrice && parseFloat(v.compareAtPrice.amount) > parseFloat(v.price.amount);
  const wished = isWished(product.id);

  let badge = '';
  if (!product.availableForSale) badge = `<span class="prod-badge badge-sold">Esaurito</span>`;
  else if (showAIBadge && (product._score || 0) >= 70) badge = `<span class="prod-badge badge-ai">Per te</span>`;
  else if (hasDiscount) {
    const pct = Math.round(((parseFloat(v.compareAtPrice.amount) - parseFloat(v.price.amount)) / parseFloat(v.compareAtPrice.amount)) * 100);
    badge = `<span class="prod-badge badge-sale">−${pct}%</span>`;
  }

  card.innerHTML = `
    <div class="prod-img-wrap">
      <img src="${img}" alt="${product.title}" class="prod-img" loading="lazy" decoding="async">
      ${badge}
      <button class="prod-wish ${wished ? 'wished' : ''}" data-id="${product.id}" aria-label="Preferiti">
        <i data-lucide="heart" style="fill:${wished ? 'var(--purple-light)' : 'none'};stroke:${wished ? 'var(--purple-light)' : '#fff'}"></i>
      </button>
    </div>
    <div class="prod-body">
      <p class="prod-vendor">${product.vendor || 'ELISEE'}</p>
      <h4 class="prod-title">${product.title}</h4>
      <div class="prod-foot">
        <div class="prod-prices">
          <span class="prod-price">${fmt(price.amount, price.currencyCode)}</span>
          ${hasDiscount ? `<span class="prod-compare">${fmt(v.compareAtPrice.amount, v.compareAtPrice.currencyCode)}</span>` : ''}
        </div>
        <button class="prod-quick-add" ${!product.availableForSale ? 'disabled' : ''} aria-label="Aggiungi">
          <i data-lucide="${product.availableForSale ? 'plus' : 'x'}"></i>
        </button>
      </div>
    </div>`;

  card.querySelector('.prod-wish').addEventListener('click', e => { e.stopPropagation(); toggleWish(product.id); });
  card.querySelector('.prod-quick-add').addEventListener('click', e => {
    e.stopPropagation();
    if (product.availableForSale && v) addToCart(product, v.id);
  });
  card.addEventListener('click', () => openPDP(product));

  return card;
}

// ═══════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════
function renderHome() {
  const profile  = getProfile();
  const context  = getContext();

  // Headline contestuale (P5)
  const headline = getContextualHeadline(profile);
  const heroTitle = $('hero-title');
  if (heroTitle) {
    const firstName = profile.name ? profile.name.split(' ')[0] : 'Elisee';
    heroTitle.textContent = `${headline.base}, ${firstName}`;
  }

  // Collezioni chips
  const colsEl = $('home-collections');
  if (colsEl) {
    colsEl.innerHTML = '';
    const allChip = document.createElement('div');
    allChip.className = 'chip active';
    allChip.textContent = 'Tutti';
    allChip.addEventListener('click', () => { state.selectedCol = 'all'; go('catalog'); });
    colsEl.appendChild(allChip);
    state.collections.forEach(col => {
      const c = document.createElement('div');
      c.className = 'chip';
      c.textContent = col.title;
      c.addEventListener('click', () => { state.selectedCol = col.id; renderCatalog(); go('catalog'); });
      colsEl.appendChild(c);
    });
  }

  // Ultimi Arrivi (dal più recente al meno recente)
  const latestGrid = $('home-latest');
  if (latestGrid) {
    latestGrid.innerHTML = '';
    // I dati da Shopify sono già ordinati CREATED_AT, reverse: true
    const latest = state.products.slice(0, 4);
    latest.forEach(p => latestGrid.appendChild(makeCard(p, false)));
  }

  // Prodotti AI-ranked (P3 + P5)
  const grid = $('home-products');
  if (grid) {
    grid.innerHTML = '';
    const ranked = rankProducts(state.products, profile, 6);
    // Prefetch immagini above-fold (P2)
    prefetchImages(ranked.slice(0, 4).map(p => p.images.edges[0]?.node.url).filter(Boolean));
    ranked.forEach(p => grid.appendChild(makeCard(p, true)));
  }

  renderFlywheel();
  refreshIcons();
}

// ═══════════════════════════════════════════════════════════
// CATALOG
// ═══════════════════════════════════════════════════════════
function renderCatalogFilters() {
  const filters = $('catalog-filters');
  if (!filters) return;
  filters.innerHTML = '';
  const allC = document.createElement('div');
  allC.className = 'chip active';
  allC.textContent = 'Tutti';
  allC.dataset.col = 'all';
  filters.appendChild(allC);
  state.collections.forEach(col => {
    const c = document.createElement('div');
    c.className = 'chip'; c.textContent = col.title; c.dataset.col = col.id;
    if (col.id === state.selectedCol) { c.classList.add('active'); allC.classList.remove('active'); }
    filters.appendChild(c);
  });
  filters.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', async () => {
      state.selectedCol = c.dataset.col;
      filters.querySelectorAll('.chip').forEach(x => x.classList.toggle('active', x === c));
      
      // Fetch dinamico della collezione se non l'abbiamo già fatto
      if (state.selectedCol !== 'all') {
        if (!state.fetchedCollections) state.fetchedCollections = {};
        if (!state.fetchedCollections[state.selectedCol]) {
          const sentinel = $('catalog-sentinel');
          const grid = $('catalog-products');
          if (grid && !grid.innerHTML.includes('Caricamento')) {
            grid.innerHTML = `<div class="catalog-empty"><i data-lucide="loader" class="spin" style="width:36px;height:36px"></i><p>Caricamento catalogo...</p></div>`;
            refreshIcons(grid);
          }
          
          const data = await shopify.getCollectionProducts(state.selectedCol, 250);
          state.fetchedCollections[state.selectedCol] = true;
          
          // Uniamo i nuovi prodotti a quelli esistenti senza duplicati
          const existingIds = new Set(state.products.map(p => p.id));
          const newProducts = data.products.filter(p => !existingIds.has(p.id));
          state.products = [...state.products, ...newProducts];
        }
      }
      
      renderCatalog();
    });
  });
}

function renderCatalog() {
  const grid = $('catalog-products');
  if (!grid) return;
  const profile = getProfile();

  let list = state.searchQuery.trim()
    ? smartSearch(state.products, state.searchQuery, profile)
    : rankProducts(state.products, profile);

  // Filter by wishlist
  if (state.wishFilter) list = list.filter(p => isWished(p.id));

  // Filter by collection
  if (state.selectedCol !== 'all') {
    list = list.filter(p => p.collections?.edges?.some(e => e.node.id === state.selectedCol));
  }

  // Sort override
  if (state.sortOption === 'price-asc') list.sort((a,b) => +a.priceRange.minVariantPrice.amount - +b.priceRange.minVariantPrice.amount);
  if (state.sortOption === 'price-desc') list.sort((a,b) => +b.priceRange.minVariantPrice.amount - +a.priceRange.minVariantPrice.amount);
  if (state.sortOption === 'az') list.sort((a,b) => a.title.localeCompare(b.title));

  state.currentCatalogList = list;
  state.catalogRendered = Math.min(20, list.length);

  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML = `<div class="catalog-empty">
      <i data-lucide="search-x" style="width:36px;height:36px"></i>
      <p>Nessun prodotto trovato</p>
    </div>`;
  } else {
    list.slice(0, state.catalogRendered).forEach(p => grid.appendChild(makeCard(p, true)));
  }
  refreshIcons(grid);
}

// ═══════════════════════════════════════════════════════════
// PDP
// ═══════════════════════════════════════════════════════════
function openPDP(product) {
  trackViewEnd(); // salva durata prodotto precedente (P5)
  state.activeProduct = product;
  state.activeOptions = {};
  product.options?.forEach(o => { state.activeOptions[o.name] = o.values[0]; });
  syncVariant();
  renderPDP();
  trackView(product);
  track('product_view', { productId: product.id, title: product.title, price: product.priceRange.minVariantPrice.amount });
  go('pdp');
}

function syncVariant() {
  const p = state.activeProduct;
  if (!p) return;
  state.activeVariant = p.variants.edges.find(e =>
    e.node.selectedOptions.every(o => state.activeOptions[o.name] === o.value)
  )?.node || null;
}

function renderPDP() {
  const p = state.activeProduct;
  const v = state.activeVariant;
  if (!p) return;

  const imgs = p.images.edges.map(e => e.node.url).filter(Boolean);
  const mainImg = $('pdp-img');
  if (mainImg) { mainImg.src = imgs[0] || ''; mainImg.alt = p.title; }

  // Thumbnails (P2: prefetch all images)
  const thumbs = $('pdp-thumbs');
  if (thumbs) {
    thumbs.innerHTML = '';
    prefetchImages(imgs.slice(1));
    imgs.forEach((url, i) => {
      const img = document.createElement('img');
      img.src = url; img.alt = p.title;
      img.className = `pdp-thumb ${i === 0 ? 'active' : ''}`;
      img.loading = 'lazy';
      img.addEventListener('click', () => {
        if (mainImg) mainImg.src = url;
        thumbs.querySelectorAll('.pdp-thumb').forEach(t => t.classList.toggle('active', t === img));
      });
      thumbs.appendChild(img);
    });
  }

  // Info
  const vendor = $('pdp-vendor'); if (vendor) vendor.textContent = p.vendor || 'ELISEE';
  const title  = $('pdp-title');  if (title)  title.textContent  = p.title;
  const desc   = $('pdp-desc');   if (desc)   desc.textContent   = p.description || 'Nessuna descrizione.';

  if (v) {
    const priceEl = $('pdp-price');
    if (priceEl) priceEl.textContent = fmt(v.price.amount, v.price.currencyCode);
    const cmp = $('pdp-compare');
    if (cmp) {
      const hasDiscount = v.compareAtPrice && parseFloat(v.compareAtPrice.amount) > parseFloat(v.price.amount);
      cmp.style.display = hasDiscount ? 'inline' : 'none';
      if (hasDiscount) cmp.textContent = fmt(v.compareAtPrice.amount, v.compareAtPrice.currencyCode);
    }
    const buyBtn = $('pdp-add-cart');
    if (buyBtn) {
      buyBtn.disabled = !v.availableForSale;
      buyBtn.innerHTML = v.availableForSale
        ? '<i data-lucide="shopping-bag"></i> Aggiungi al Carrello'
        : '<i data-lucide="x"></i> Esaurito';
    }
  }

  // Opzioni varianti
  const optsEl = $('pdp-options');
  if (optsEl) {
    optsEl.innerHTML = '';
    p.options?.forEach(opt => {
      if (opt.name === 'Title' && opt.values[0] === 'Default Title') return;
      const g = document.createElement('div');
      g.className = 'opt-group';
      g.innerHTML = `<p class="opt-label">${opt.name}</p>`;
      const row = document.createElement('div');
      row.className = 'opt-chips';
      opt.values.forEach(val => {
        const chip = document.createElement('button');
        chip.className = `opt-chip ${state.activeOptions[opt.name] === val ? 'active' : ''}`;
        chip.textContent = val;
        chip.addEventListener('click', () => {
          state.activeOptions[opt.name] = val;
          syncVariant();
          renderPDP();
        });
        row.appendChild(chip);
      });
      g.appendChild(row);
      optsEl.appendChild(g);
    });
  }

  // Raccomandazioni AI (P3)
  const recsGrid = document.querySelector('.pdp-recs .products-grid');
  if (recsGrid) {
    recsGrid.innerHTML = '';
    getRecommendations(state.products, p.id, 4).forEach(rec => recsGrid.appendChild(makeCard(rec)));
  }

  syncPDPWish();
  refreshIcons();
}

// ═══════════════════════════════════════════════════════════
// ADMIN AREA
// ═══════════════════════════════════════════════════════════
function renderAdminArea(searchQuery = '') {
  const listEl = $('admin-customers-list');
  const totalEl = $('admin-total-customers');
  if (!listEl || !totalEl) return;

  totalEl.textContent = MOCK_CUSTOMERS.length;

  let filtered = MOCK_CUSTOMERS;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = MOCK_CUSTOMERS.filter(c => 
      c.firstName.toLowerCase().includes(q) || 
      c.lastName.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q)
    );
  }

  listEl.innerHTML = '';
  if (filtered.length === 0) {
    listEl.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 20px;">Nessun cliente trovato.</p>';
    return;
  }

  filtered.forEach(c => {
    const card = document.createElement('div');
    card.style.cssText = 'background: rgba(20, 10, 30, 0.45); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.3);';
    
    const initial = (c.firstName[0] || '?').toUpperCase();
    const tagsHTML = c.tags.map(t => `<span style="background: rgba(212,175,55,0.15); color: var(--gold); border: 1px solid rgba(212,175,55,0.3); padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: 600; text-transform: uppercase;">${t}</span>`).join('');

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, rgba(155,89,208,0.2), rgba(255,255,255,0.05)); border: 1px solid rgba(155,89,208,0.3); display: flex; align-items: center; justify-content: center; font-family: var(--font-d); font-size: 18px; color: var(--purple-light);">
            ${initial}
          </div>
          <div>
            <h3 style="font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 2px;">${c.firstName} ${c.lastName}</h3>
            <p style="font-size: 11px; color: var(--text-muted);">${c.email}</p>
          </div>
        </div>
        <div style="text-align: right;">
          <p style="font-family: var(--font-d); font-size: 16px; font-weight: 600; color: var(--text);">${fmt(c.totalSpent)}</p>
          <p style="font-size: 10px; color: var(--text-sub);">${c.ordersCount} ordin${c.ordersCount === 1 ? 'e' : 'i'}</p>
        </div>
      </div>
      ${tagsHTML ? `<div style="display: flex; gap: 6px; padding-left: 52px;">${tagsHTML}</div>` : ''}
    `;
    listEl.appendChild(card);
  });

  simulateLiveUsers();
}

let _liveUsersTimer;
function simulateLiveUsers() {
  clearTimeout(_liveUsersTimer);
  const feedEl = $('admin-live-feed');
  const countEl = $('admin-live-count');
  if (!feedEl || !countEl) return;

  const actions = [
    "sta visualizzando il catalogo",
    "ha aggiunto al carrello",
    "sta effettuando il checkout",
    "sta visualizzando la Home",
    "ha rimosso un prodotto dal carrello",
    "sta cercando 'ciabatte'",
  ];
  const users = ["Ospite #4812", "Beatrice B.", "Ospite #192", "Carlo V.", "Ospite #991", "Martina G.", "Utente Anonimo", "Alessandro R."];
  const locations = ["da Milano", "da Roma", "da Londra", "da Napoli", "da New York", "da Parigi", "da Dubai", "da Zurigo", "da Torino"];

  let currentCount = Math.floor(Math.random() * 15) + 5;
  countEl.textContent = currentCount;

  feedEl.innerHTML = '';
  // Genera feed iniziale
  for(let i=0; i<4; i++) {
    addLiveFeedItem(
      feedEl, 
      users[Math.floor(Math.random()*users.length)], 
      locations[Math.floor(Math.random()*locations.length)],
      actions[Math.floor(Math.random()*actions.length)]
    );
  }

  // Loop di simulazione
  const loop = () => {
    currentCount += (Math.random() > 0.5 ? 1 : -1);
    if (currentCount < 2) currentCount = 2;
    if (currentCount > 35) currentCount = 35;
    countEl.textContent = currentCount;

    addLiveFeedItem(
      feedEl, 
      users[Math.floor(Math.random()*users.length)], 
      locations[Math.floor(Math.random()*locations.length)],
      actions[Math.floor(Math.random()*actions.length)]
    );
    
    // Rimuove vecchi item per non pesare sul DOM
    if (feedEl.children.length > 6) {
      feedEl.removeChild(feedEl.lastElementChild);
    }

    _liveUsersTimer = setTimeout(loop, Math.random() * 3000 + 1500);
  };
  
  _liveUsersTimer = setTimeout(loop, 2000);
}

function addLiveFeedItem(container, user, location, action) {
  const el = document.createElement('div');
  el.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); animation: slideDownFade 0.4s ease forwards; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.02);';
  el.innerHTML = `
    <div style="width: 4px; height: 4px; border-radius: 50%; background: #10b981; box-shadow: 0 0 5px #10b981;"></div>
    <span style="flex:1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      <strong style="color: var(--text-sub);">${user}</strong> 
      <span style="color: rgba(255,255,255,0.4);">${location}</span> 
      ${action}
    </span>
    <span style="margin-left: auto; font-size: 9px; opacity: 0.5;">adesso</span>
  `;
  container.insertBefore(el, container.firstChild);
}

// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════
function initSettings() {
  const mockToggle = $('mock-toggle');
  if (!mockToggle) return;
  mockToggle.checked = shopify.useMock;
  $('field-domain').value  = shopify.shopDomain  || '';
  $('field-token').value   = shopify.accessToken || '';
  $('field-version').value = shopify.apiVersion  || '2024-04';

  const toggle = () => {
    const fields = $('settings-fields');
    if (!fields) return;
    fields.style.opacity = mockToggle.checked ? '.4' : '1';
    fields.style.pointerEvents = mockToggle.checked ? 'none' : 'auto';
  };
  mockToggle.addEventListener('change', toggle);
  toggle();
  updateConnStatus();
}

function updateConnStatus() {
  const chip = $('conn-status'); if (!chip) return;
  chip.className = 'status-chip';
  const ico = $('conn-ico');
  const txt = $('conn-text');
  if (shopify.useMock) {
    chip.classList.add('status-demo');
    ico?.setAttribute('data-lucide','alert-circle');
    if (txt) txt.textContent = 'Modalità Demo — dati di prova';
  } else {
    chip.classList.add('status-live');
    ico?.setAttribute('data-lucide','check-circle-2');
    if (txt) txt.textContent = `Connesso: ${shopify.shopDomain}`;
  }
  refreshIcons(chip);
}

async function saveSettings() {
  const domain  = $('field-domain')?.value.trim() || '';
  const token   = $('field-token')?.value.trim()  || '';
  const version = $('field-version')?.value.trim() || '2024-04';
  const useMock = $('mock-toggle')?.checked || false;
  if (!useMock && (!domain || !token)) { toast('Inserisci dominio e token', true); return; }

  const btn = $('btn-save');
  btn.textContent = '⏳ Connessione...'; btn.disabled = true;

  if (!useMock) {
    const r = await shopify.testConnection(domain, token, version);
    if (!r.success) { toast(`Connessione fallita: ${r.error}`, true); btn.innerHTML = '<i data-lucide="check"></i> Connetti'; btn.disabled = false; refreshIcons(); return; }
    toast(`✅ Connesso: ${r.shopName}`);
  }
  shopify.saveConfig(domain, token, version, useMock);
  btn.innerHTML = '<i data-lucide="check"></i> Connetti';
  btn.disabled = false;
  refreshIcons(btn);
  updateConnStatus();
  loadData(true);
}

function resetSettings() {
  shopify.clearConfig();
  initSettings();
  toast('Demo ripristinato');
  loadData(true);
}

// ═══════════════════════════════════════════════════════════
// ONBOARDING QUIZ — Principio 4: <60 secondi
// ═══════════════════════════════════════════════════════════
function showOnboarding() {
  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  overlay.id = 'ob-overlay';

  let step = 0;
  const answers = {};

  function renderStep() {
    const q = STYLE_QUIZ[step];
    const total = STYLE_QUIZ.length;
    overlay.innerHTML = `
      <div class="ob-header">
        <img src="${CONFIG.logo?.src || 'logo.png'}" alt="Elisee" class="ob-logo">
        <button class="ob-skip" id="ob-skip">Salta</button>
      </div>
      <div class="ob-body">
        <div class="ob-step-indicator">
          ${STYLE_QUIZ.map((_,i) => `<div class="ob-step-dot ${i < step ? 'done' : ''}"></div>`).join('')}
        </div>
        <span class="ob-emoji">${q.emoji}</span>
        <h2 class="ob-question">${q.question}</h2>
        <div class="ob-options">
          ${q.options.map(o => `
            <button class="ob-option" data-val="${o.value}">
              <span class="ob-opt-icon">${o.icon}</span>
              <span class="ob-opt-label">${o.label}</span>
            </button>`).join('')}
        </div>
      </div>
      <div class="ob-footer">
        <button class="btn-primary ob-next" id="ob-next" disabled>
          ${step < total - 1 ? 'Continua →' : 'Scopri Elisee ✨'}
        </button>
        <p class="ob-progress-note">Passo ${step + 1} di ${total} · <30 secondi</p>
      </div>`;

    overlay.querySelectorAll('.ob-option').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.ob-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        answers[q.id] = btn.dataset.val;
        const nextBtn = overlay.querySelector('#ob-next');
        nextBtn.disabled = false;
        // Auto-avanzamento rapido e fluido
        setTimeout(() => nextBtn.click(), 250);
      });
    });

    overlay.querySelector('#ob-next').addEventListener('click', () => {
      if (!answers[q.id]) return;
      step++;
      if (step >= STYLE_QUIZ.length) {
        finishOnboarding(answers);
      } else {
        renderStep();
      }
    });

    overlay.querySelector('#ob-skip').addEventListener('click', () => finishOnboarding({}));
  }

  function finishOnboarding(ans) {
    completeOnboarding(ans);
    track('onboarding_complete', ans);
    overlay.style.animation = 'fadeIn .3s ease reverse both';
    setTimeout(() => { overlay.remove(); renderHome(); renderFlywheel(); }, 300);
  }

  renderStep();
  document.querySelector('.app-shell').appendChild(overlay);
}

// ═══════════════════════════════════════════════════════════
// DATA LOADING — Principio 2: cache + speed
// ═══════════════════════════════════════════════════════════
async function loadData(force = false) {
  // Cache check (P2)
  if (!force) {
    const cachedP = cacheGet('products');
    const cachedC = cacheGet('collections');
    // Verifica che cachedP sia nel nuovo formato (non un array)
    if (cachedP && !Array.isArray(cachedP) && cachedC) {
      state.products    = cachedP.products;
      state.pageInfo    = cachedP.pageInfo;
      state.collections = cachedC;
      renderHome();
      renderCatalogFilters();
      renderCatalog();
      updateConnStatus();
      return;
    }
  }

  // Skeleton (ottimistic UI P2)
  const grid = $('home-products');
  if (grid) grid.innerHTML = Array(4).fill(0).map(() => `
    <div class="skel-card"><div class="skel-img"></div>
      <div class="skel-body"><div class="skel-line"></div><div class="skel-line s"></div></div>
    </div>`).join('');

  try {
    const [prodData, collectionsData] = await Promise.all([
      shopify.getProducts(20), // Fetch initial 20 items
      shopify.getCollections(),
    ]);
    
    state.products = prodData.products;
    state.pageInfo = prodData.pageInfo;
    state.collections = collectionsData;

    // Store in cache (P2) - cache the object with pageInfo
    cacheSet('products', prodData);
    cacheSet('collections', state.collections);

    renderHome();
    renderCatalogFilters();
    renderCatalog();
    updateConnStatus();
  } catch (err) {
    console.error('Data load error:', err);
    updateConnStatus('error');
  }
}

async function loadMoreProducts() {
  if (state.isLoadingMore || !state.pageInfo.hasNextPage) return;
  state.isLoadingMore = true;
  
  const sentinel = $('catalog-sentinel');
  if (sentinel) { sentinel.style.opacity = '1'; sentinel.innerHTML = '<i data-lucide="loader" class="spin"></i> Caricamento...'; refreshIcons(sentinel); }

  try {
    const prodData = await shopify.getProducts(20, state.pageInfo.endCursor);
    
    // Append the new products
    state.products = [...state.products, ...prodData.products];
    state.pageInfo = prodData.pageInfo;

    // Update the cache with the appended list
    cacheSet('products', { products: state.products, pageInfo: state.pageInfo });

    // Invece di fare un re-render totale, aggiungiamo solo le card (più efficiente) o per semplicità rieseguiamo renderCatalog
    renderCatalog();
  } catch (err) {
    console.error('Failed to load more products:', err);
  } finally {
    state.isLoadingMore = false;
    if (sentinel) { sentinel.style.opacity = '0'; sentinel.innerHTML = ''; }
  }
}

// ═══════════════════════════════════════════════════════════
// POWER USER — Principio 6: depth for power users
// ═══════════════════════════════════════════════════════════
// Konami code: ↑↑↓↓←→←→BA → opens power panel
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;
document.addEventListener('keydown', e => {
  if (e.key === KONAMI[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === KONAMI.length) { konamiIdx = 0; openPowerPanel(); }
  } else { konamiIdx = 0; }
});

function openPowerPanel() {
  const existing = document.querySelector('.power-overlay');
  if (existing) { existing.classList.toggle('open'); return; }

  const profile  = getProfile();
  const privacy  = getPrivacySummary();
  const fw       = getFlywheel();
  const ab       = AB_TESTS;

  const panel = document.createElement('div');
  panel.className = 'power-overlay open';
  panel.innerHTML = `
    <p class="power-header">⚡ ELISEE POWER PANEL</p>
    <div class="power-section">
      <p class="power-section-title">Intelligence</p>
      <div class="power-item"><span>Style</span><span class="power-val">${profile.style || 'unknown'}</span></div>
      <div class="power-item"><span>Budget</span><span class="power-val">${profile.budget || 'unknown'}</span></div>
      <div class="power-item"><span>Sessions</span><span class="power-val">${profile.sessionCount || 0}</span></div>
      <div class="power-item"><span>Products viewed</span><span class="power-val">${fw.productsViewed || 0}</span></div>
    </div>
    <div class="power-section">
      <p class="power-section-title">A/B Tests</p>
      <div class="power-item"><span>hero_cta</span><span class="power-val">${ab.HERO_CTA}</span></div>
      <div class="power-item"><span>product_sort</span><span class="power-val">${ab.PRODUCT_SORT}</span></div>
    </div>
    <div class="power-section">
      <p class="power-section-title">Privacy</p>
      <div class="power-item"><span>Events</span><span class="power-val">${privacy.totalEvents}</span></div>
      <div class="power-item"><span>Data location</span><span class="power-val">Local only</span></div>
      <div class="power-item"><span>3rd parties</span><span class="power-val">None</span></div>
    </div>
    <div class="power-section">
      <p class="power-section-title">API</p>
      <div class="power-item"><span>window.EliseeApp</span><span class="power-val">available</span></div>
      <div class="power-item"><span>Shopify</span><span class="power-val">${shopify.shopDomain}</span></div>
    </div>
    <button class="btn-secondary power-close" id="power-close">✕ Chiudi</button>`;

  panel.querySelector('#power-close').addEventListener('click', () => panel.remove());
  document.querySelector('.app-shell').appendChild(panel);
  track('power_panel_open');
}

// ═══════════════════════════════════════════════════════════
// PUBLIC API — Principio 8: API-first
// ═══════════════════════════════════════════════════════════
window.EliseeApp = {
  version: '2.0.0',
  principles: 10,

  // Navigation
  navigate: go,

  // Data
  getProducts:    () => state.products,
  getCollections: () => state.collections,
  getCart:        () => state.cart,
  getWishlist:    () => state.wishlist,

  // Intelligence
  getProfile,
  updateProfile,
  rankProducts: (products) => rankProducts(products, getProfile()),

  // Analytics
  analytics: AnalyticsAPI,
  track,

  // Privacy (P9)
  privacy: {
    exportData:  exportUserData,
    deleteData:  () => { deleteUserData(); AnalyticsAPI.clearAllData(); toast('Tutti i dati cancellati'); },
    getSummary:  getPrivacySummary,
  },

  // Power user
  openPowerPanel,

  // Reload data
  reload: () => loadData(true),
};

// ═══════════════════════════════════════════════════════════
// APPLY CONFIG — Principio 6
// ═══════════════════════════════════════════════════════════
function applyConfig() {
  if (CONFIG.app?.name)        document.title = CONFIG.app.name;
  if (CONFIG.logo?.favicon) {
    const fav = document.querySelector('link[rel="icon"]');
    if (fav) fav.href = CONFIG.logo.favicon;
  }
  if (CONFIG.logo?.src) {
    $$('#header-logo-img, .side-logo').forEach(img => { img.src = CONFIG.logo.src; });
  }
  if (CONFIG.hero?.image) { const h = $('hero-img'); if (h) h.src = CONFIG.hero.image; }
  if (CONFIG.hero?.ctaText) { const c = $('hero-cta'); if (c) c.textContent = CONFIG.hero.ctaText; }
  if (CONFIG.social?.instagram) { const el = $('link-instagram'); if (el) el.href = CONFIG.social.instagram; }
  if (CONFIG.social?.tiktok)    { const el = $('link-tiktok');    if (el) el.href = CONFIG.social.tiktok; }
  if (CONFIG.colors) {
    const r = document.documentElement;
    Object.entries({
      '--bg':           CONFIG.colors.bg,
      '--purple':       CONFIG.colors.purple,
      '--purple-light': CONFIG.colors.purpleLight,
      '--purple-dark':  CONFIG.colors.purpleDark,
      '--gold':         CONFIG.colors.gold,
      '--text':         CONFIG.colors.text,
    }).forEach(([k, v]) => { if (v) r.style.setProperty(k, v); });
  }
}


export const updateDynamicHome = () => {
  const title = $('hero-title');
  const sub = $('hero-sub');
  if (!title || !sub) return;

  const profile = getProfile();
  const name = profile.name ? profile.name.split(' ')[0] : 'Elisee';
  const ctx = getContextualHeadline(profile);

  title.textContent = `${ctx.base}, ${name}`;
  sub.textContent = ctx.sub;
  sub.style.color = ctx.color;
  
  // Simulazione adattamento layout
  if (new Date().getHours() >= 19) {
    // Dark mode più profonda per la sera (Edge AI UI adapt)
    document.documentElement.style.setProperty('--bg', '#050008');
  } else {
    document.documentElement.style.setProperty('--bg', '#0a0010');
  }
};

// ═══════════════════════════════════════════════════════════
// EVENTS — bind everything
// ═══════════════════════════════════════════════════════════
function bindEvents() {
  // Gestione pulsante indietro nativo (Android/Browser)
  window.addEventListener('popstate', (e) => {
    if ($('cart-drawer')?.classList.contains('open')) { closeCart(); return; }
    if ($('side-menu')?.classList.contains('open')) { closeMenu(); return; }
    
    initAuth(e, go, renderAdminArea);

    if (e.state && e.state.screen) {
      go(e.state.screen, false);
    } else {
      go('home', false);
    }
  });

  // Header
  $('hamburger-btn')?.addEventListener('click', openMenu);
  $('header-logo-btn')?.addEventListener('click', () => go('home'));
  $('header-cart-btn')?.addEventListener('click', openCart);

  // Bottom Nav custom triggers
  $('nav-menu-btn')?.addEventListener('click', openMenu);

  // Side menu backdrop
  $('menu-backdrop').addEventListener('click', closeMenu);
  $$('[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.screen;
      if (state.activeScreen !== target) go(target);
      if ($('menu-backdrop').classList.contains('open')) closeMenu();
    });
  });

  $('nav-search-btn')?.addEventListener('click', () => {
    go('catalog');
    setTimeout(() => {
      const searchInput = $('search-input');
      if (searchInput) searchInput.focus();
    }, 100);
  });

  // Bottom nav
  $$('.nav-tab[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => go(btn.dataset.screen));
  });
  $('nav-cart-btn').addEventListener('click', openCart);

  // Cart
  $('cart-backdrop').addEventListener('click', closeCart);
  $('cart-close-btn').addEventListener('click', closeCart);
  $('checkout-btn').addEventListener('click', checkout);

  // Hero CTA — A/B test (P7)
  const heroCta = $('hero-cta');
  if (heroCta) {
    if (AB_TESTS.HERO_CTA === 'b') heroCta.textContent = 'Shop Now →';
    heroCta.addEventListener('click', () => {
      trackABConversion('hero_cta', AB_TESTS.HERO_CTA);
      go('catalog');
    });
  }
  $('home-see-all')?.addEventListener('click', () => go('catalog'));

  // Search
  const searchInput = $('search-input');
  const searchClear = $('search-clear');
  if (searchInput) {
    let searchTimer;
    searchInput.addEventListener('input', e => {
      state.searchQuery = e.target.value;
      if (searchClear) searchClear.style.display = state.searchQuery ? 'flex' : 'none';
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        trackSearch(state.searchQuery);
        track('search', { query: state.searchQuery });
        renderCatalog();
      }, 250); // debounce 250ms (P2)
    });
    searchClear?.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      searchClear.style.display = 'none';
      renderCatalog();
      searchInput.focus();
    });
  }

  $('sort-select')?.addEventListener('change', e => { state.sortOption = e.target.value; renderCatalog(); });

  $('wish-filter-btn')?.addEventListener('click', () => {
    state.wishFilter = !state.wishFilter;
    $('wish-filter-btn').classList.toggle('active', state.wishFilter);
    renderCatalog();
  });

  // PDP
  $('pdp-back')?.addEventListener('click', () => { trackViewEnd(); go(state.prevScreen === 'pdp' ? 'catalog' : (state.prevScreen || 'home')); });
  $('pdp-add-cart')?.addEventListener('click', () => {
    if (state.activeProduct && state.activeVariant) addToCart(state.activeProduct, state.activeVariant.id);
  });
  $('pdp-wish-btn')?.addEventListener('click', () => { if (state.activeProduct) toggleWish(state.activeProduct.id); });

  // Settings & Profile
  $('settings-back')?.addEventListener('click', () => go(state.prevScreen || 'home'));
  $('btn-save')?.addEventListener('click', saveSettings);
  $('btn-reset')?.addEventListener('click', resetSettings);
  $('profile-settings-btn')?.addEventListener('click', () => go('settings'));

  // Profilo - Navigazione sezioni
  $('btn-profile-orders')?.addEventListener('click', () => go('orders'));
  $('btn-profile-inbox')?.addEventListener('click', () => go('inbox'));
  $('btn-profile-vip')?.addEventListener('click', () => go('vip'));
  $('vip-back')?.addEventListener('click', () => go('profile'));
  

  
  const showDirAuth = () => {
    const overlay = $('dir-auth-overlay');
    if (overlay) overlay.classList.remove('hidden');
  };
  $('btn-profile-dir-clienti')?.addEventListener('click', showDirAuth);
  $('btn-profile-dir-admin')?.addEventListener('click', showDirAuth);
  
  $('dir-auth-back-btn')?.addEventListener('click', () => {
    const overlay = $('dir-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
  });

  $('dir-do-login')?.addEventListener('click', async () => {
    const user = $('dir-login-username').value;
    const pass = $('dir-login-password').value;
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json();
      
      if (data.success) {
        const overlay = $('dir-auth-overlay');
        if (overlay) overlay.classList.add('hidden');
        $('dir-login-username').value = '';
        $('dir-login-password').value = '';
        sessionStorage.setItem('admin_token', data.token); // Secure token
        go('admin');
        renderAdminArea();
        toast('Accesso Direzione consentito.');
      } else {
        toast(data.error || 'Credenziali errate.', true);
      }
    } catch (err) {
      toast('Errore di rete durante il login', true);
    }
  });

  $('btn-profile-wishlist')?.addEventListener('click', () => {
    state.wishFilter = true;
    go('catalog');
    renderCatalogFilters(); // Aggiorna per riflettere il filtro
    renderCatalog();
  });

  // Admin Area
  $('admin-back')?.addEventListener('click', () => go('profile'));
  const adminSearch = $('admin-search');
  if (adminSearch) {
    let adminSearchTimer;
    adminSearch.addEventListener('input', e => {
      clearTimeout(adminSearchTimer);
      adminSearchTimer = setTimeout(() => {
        renderAdminArea(e.target.value);
      }, 300);
    });
  }

  // AI Marketing Studio
  $('btn-ai-marketing-welcome')?.addEventListener('click', () => {
    $('ai-marketing-output').style.display = 'flex';
    const codeEl = $('ai-marketing-code');
    codeEl.innerHTML = '<i data-lucide="loader" class="spin"></i> Generazione template in corso...';
    refreshIcons($('ai-marketing-output'));
    
    setTimeout(() => {
      codeEl.textContent = `<!DOCTYPE html>
<html lang="it">
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #050008; color: #ffffff; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #0a0010; border: 1px solid #d4af37; padding: 40px; border-radius: 12px; }
    h1 { color: #d4af37; font-size: 28px; text-align: center; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
    p { font-size: 16px; line-height: 1.6; color: #a09aa6; }
    .btn { display: block; width: 100%; max-width: 250px; margin: 30px auto; padding: 15px; background: #9b59d0; color: #fff; text-align: center; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Benvenuto nel Club Elisee</h1>
    <p>Ciao *|FNAME|*,</p>
    <p>La tua identità digitale ha sbloccato l'accesso a un'esperienza premium. Non siamo un semplice store, siamo il tuo nuovo concierge personale per lo stile.</p>
    <p>Abbiamo già analizzato il tuo profilo. Scopri la selezione riservata a te.</p>
    <a href="https://shopify-mobile-app-omega.vercel.app" class="btn">Entra nell'App</a>
  </div>
</body>
</html>`;
    }, 1200);
  });

  $('btn-ai-marketing-promo')?.addEventListener('click', () => {
    $('ai-marketing-output').style.display = 'flex';
    const codeEl = $('ai-marketing-code');
    codeEl.innerHTML = '<i data-lucide="loader" class="spin"></i> Generazione template in corso...';
    refreshIcons($('ai-marketing-output'));
    
    setTimeout(() => {
      codeEl.textContent = `<!DOCTYPE html>
<html lang="it">
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #050008; color: #ffffff; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #0a0010; border: 1px solid #9b59d0; padding: 40px; border-radius: 12px; text-align: center; }
    h1 { color: #9b59d0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
    .highlight { color: #d4af37; font-size: 22px; margin: 20px 0; }
    .btn { display: inline-block; padding: 15px 30px; background: #d4af37; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Private Sale Elisee</h1>
    <p>Un invito esclusivo, *|FNAME|*.</p>
    <div class="highlight">Fino al 40% su pezzi iconici</div>
    <p>L'AI del nostro store ha riservato per te dei capi che si abbinano perfettamente al tuo ultimo ordine.</p>
    <a href="https://shopify-mobile-app-omega.vercel.app" class="btn">Sblocca il tuo Sconto</a>
  </div>
</body>
</html>`;
    }, 1200);
  });

  $('btn-ai-marketing-copy')?.addEventListener('click', () => {
    const code = $('ai-marketing-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
      toast('Codice HTML copiato per Mailchimp!');
    });
  });


  // Edit Profile
  $('go-edit-profile-btn')?.addEventListener('click', () => go('edit-profile'));
  $('edit-profile-back')?.addEventListener('click', () => go('profile'));
  $('btn-save-profile')?.addEventListener('click', () => {
    const newName  = $('input-profile-name').value.trim() || 'Utente';
    const newEmail = $('input-profile-email').value.trim() || '';
    const newDob   = $('input-profile-dob').value || '';
    const newPob   = $('input-profile-pob').value.trim() || '';
    const newPass  = $('input-profile-password').value; // Finto check

    const nameDisplay = $('profile-name-display');
    if (nameDisplay) nameDisplay.textContent = newName;
    
    // Possiamo aggiornare anche l'iniziale nell'avatar
    const avatarDisplay = $('profile-avatar-display');
    if (avatarDisplay) avatarDisplay.innerHTML = `<span style="font-weight:bold; font-size:32px; color:var(--text);">${newName.charAt(0).toUpperCase()}</span>`;
    
    // Svuoto il campo password per motivi di sicurezza/UI
    const passInput = $('input-profile-password');
    if (passInput) passInput.value = '';

    // Aggiorno il profilo in cache (intelligenza)
    updateProfile({ name: newName, email: newEmail, dob: newDob, pob: newPob });
    
    // Aggiorno istantaneamente il saluto nella Home
    const heroTitle = $('hero-title');
    if (heroTitle) {
      const headline = getContextualHeadline(getProfile());
      heroTitle.textContent = `${headline.base}, ${newName.split(' ')[0]}`;
    }

    // Aggiorno visibilità bottone Area Direzione
    const adminBtn = $('btn-profile-admin');
    if (adminBtn) {
      const isAdmin = newEmail.toLowerCase().includes('eliseemilano.com') || newName.toLowerCase().includes('eliseo');
      adminBtn.style.display = isAdmin ? 'flex' : 'none';
    }

    go('profile');
    toast('Profilo aggiornato con successo!');
  });

  // Lazy load con IntersectionObserver puro (nessun MutationObserver sul DOM principale)
  const lazyObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
        lazyObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  // Espone il lazy observer globalmente per usarlo nei render
  window._eliseeObserver = lazyObserver;

  // Infinite scroll observer per il catalogo (DOM Pagination / Virtual Scrolling)
  const sentinelObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (state.currentCatalogList && state.catalogRendered < state.currentCatalogList.length) {
        // Appendi i successivi elementi dal DOM
        const fragment = document.createDocumentFragment();
        const nextBatch = state.currentCatalogList.slice(state.catalogRendered, state.catalogRendered + 20);
        nextBatch.forEach(p => fragment.appendChild(makeCard(p, true)));
        $('catalog-products').appendChild(fragment);
        state.catalogRendered += nextBatch.length;
        refreshIcons($('catalog-products'));
      } else if (state.pageInfo?.hasNextPage && !state.isLoadingMore) {
        // Fallback su chiamata API se il listato locale è terminato
        loadMoreProducts();
      }
    }
  }, { rootMargin: '300px' });
  const catalogSentinel = $('catalog-sentinel');
  if (catalogSentinel) sentinelObserver.observe(catalogSentinel);
}

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Check landing status (disattivato temporaneamente per permettere sempre l'accesso alla pagina di Iscrizione/Accesso)
  // if (sessionStorage.getItem('hasSeenLanding') === 'true') {
  //   const overlay = $('landing-overlay');
  //   if (overlay) overlay.style.display = 'none';
  // }

  applyConfig();
  refreshIcons();

  // Session tracking (P5, P10)
  incrementSession();
  track('session_start', { context: getContext() });

  // Init Profile UI
  const p = getProfile();
  if (p.name) {
    const nd = $('profile-name-display'); if (nd) nd.textContent = p.name;
    const ni = $('input-profile-name');   if (ni) ni.value = p.name;
    const ad = $('profile-avatar-display'); 
    if (ad) ad.innerHTML = `<span style="font-weight:bold; font-size:32px; color:var(--text);">${p.name.charAt(0).toUpperCase()}</span>`;
  }
  if (p.email) {
    const ei = $('input-profile-email'); if (ei) ei.value = p.email;
  }
  
  updateDynamicHome();

  // Controllo accessi Area Direzione (mostra solo all'Admin)
  const adminBtn = $('btn-profile-admin');
  if (adminBtn) {
    const isAdmin = p.email?.toLowerCase().includes('eliseemilano.com') || p.name?.toLowerCase().includes('eliseo');
    adminBtn.style.display = isAdmin ? 'flex' : 'none';
  }
  if (p.dob) {
    const d = $('input-profile-dob'); if (d) d.value = p.dob;
  }
  if (p.pob) {
    const pEl = $('input-profile-pob'); if (pEl) pEl.value = p.pob;
  }

  updateCartBadge();
  renderCartBody();
  bindEvents();

  // Onboarding (P4) — mostra se è il primo lancio
  if (isFirstLaunch()) {
    loadData().then(() => showOnboarding());
  } else {
    loadData();
  }

  // ════════ AI STYLIST & DYNAMIC HOME LOGIC ════════
  initAssistant();

  // ════════ VISUAL SEARCH LOGIC ════════
  const vsBtn = $('visual-search-btn');
  const vsOverlay = $('vs-overlay');
  const vsClose = $('vs-close');
  const vsCapture = $('vs-capture-btn');
  const vsStatus = $('vs-status');

  if (vsBtn && vsOverlay) {
    vsBtn.addEventListener('click', () => {
      vsOverlay.classList.remove('hidden');
      vsStatus.textContent = 'Inquadra un capo di abbigliamento...';
    });
    vsClose.addEventListener('click', () => {
      vsOverlay.classList.add('hidden');
    });
    vsCapture.addEventListener('click', () => {
      vsStatus.innerHTML = '<span class="spin" style="display:inline-block;">⏳</span> Analisi in corso...';
      setTimeout(() => {
        vsOverlay.classList.add('hidden');
        toast('Trovati 3 prodotti simili nel catalogo!');
        const searchInput = $('search-input');
        if (searchInput) {
          searchInput.value = 'Scarpe running simili';
          state.searchQuery = 'Scarpe running simili';
          $('search-clear').style.display = 'flex';
          renderCatalog();
        }
      }, 400);
    });
  }

});
