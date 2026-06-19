import { state } from '../state.js';
import { $, $$, fmt, toast, refreshIcons, haptic } from '../utils.js';
import { trackAddToCart } from '../intelligence.js';
import { track } from '../analytics.js';
import { ShopifyClient } from '../shopify.js';

const shopify = new ShopifyClient();

export function saveCart() { localStorage.setItem('elisee:cart', JSON.stringify(state.cart)); }

export function openCart() { 
  const b = $('cart-backdrop');
  const d = $('cart-drawer');
  if (b) b.classList.add('open'); 
  if (d) d.classList.add('open'); 
  history.pushState({ overlay: 'cart' }, '', window.location.hash);
  track('cart_open'); 
}

export function closeCart() { 
  const b = $('cart-backdrop');
  const d = $('cart-drawer');
  if (b) b.classList.remove('open'); 
  if (d) d.classList.remove('open'); 
  if (history.state?.overlay === 'cart') history.back();
}

export function updateCartBadge() {
  const n = state.cart.reduce((s, i) => s + i.qty, 0);
  const badge = $('cart-count');
  const dot   = $('cart-dot');
  if (badge) { 
    badge.textContent = n || ''; 
    badge.classList.toggle('visible', n > 0); 
    
    // Anima il badge per catturare l'attenzione
    badge.classList.remove('cart-pop');
    void badge.offsetWidth; // trigger reflow
    if (n > 0) badge.classList.add('cart-pop');
  }
  if (dot)   { dot.classList.toggle('visible', n > 0); }
}

export function addToCart(product, variantId) {
  const variant = product.variants.edges.find(e => e.node.id === variantId)?.node;
  if (!variant) { toast('Seleziona una variante', true); return; }

  const img = product.images.edges[0]?.node.url || '';
  const existing = state.cart.find(i => i.variantId === variantId);
  if (existing) { existing.qty++; }
  else {
    state.cart.push({
      variantId, productId: product.id,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      img, qty: 1,
    });
  }
  saveCart();
  updateCartBadge();
  renderCartBody();
  haptic(40);
  toast(`"${product.title}" aggiunto`);

  trackAddToCart(product.id, variantId);
  track('cart_add', { productId: product.id, price: variant.price.amount });
}

export function updateQty(variantId, delta) {
  const item = state.cart.find(i => i.variantId === variantId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.variantId !== variantId);
  saveCart();
  updateCartBadge();
  renderCartBody();
  haptic(30);
}

export function renderCartBody() {
  const body = $('cart-body');
  const btn  = $('checkout-btn');
  const tot  = $('cart-total');
  if (!body) return;

  if (!state.cart.length) {
    body.innerHTML = `<div class="cart-empty" style="display:flex;flex-direction:column;align-items:center;padding:40px 20px;text-align:center;">
      <i data-lucide="shopping-cart" style="width:44px;height:44px;opacity:0.3;margin-bottom:16px;"></i>
      <p style="color:var(--text-muted);font-size:16px;margin-bottom:24px;">Il carrello è vuoto</p>
      <button id="btn-start-shopping" class="btn-primary" style="background:var(--gold);color:#000;font-weight:600;padding:12px 24px;border-radius:12px;border:none;cursor:pointer;">
        Inizia lo Shopping
      </button>
    </div>`;
    if (btn) btn.disabled = true;
    if (tot) tot.textContent = '€0.00';
    refreshIcons(body);
    
    const startBtn = body.querySelector('#btn-start-shopping');
    if (startBtn) startBtn.addEventListener('click', closeCart);
    return;
  }

  if (btn) btn.disabled = false;
  let total = 0;
  body.innerHTML = '';

  state.cart.forEach(item => {
    const lineTotal = parseFloat(item.price.amount) * item.qty;
    total += lineTotal;
    const varLabel = item.variantTitle !== 'Default Title' ? item.variantTitle : '';
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${item.img}" alt="${item.title}" class="ci-img" loading="lazy" decoding="async">
      <div class="ci-detail">
        <div>
          <p class="ci-title">${item.title}</p>
          ${varLabel ? `<p class="ci-variant">${varLabel}</p>` : ''}
        </div>
        <div class="ci-row">
          <span class="ci-price">${fmt(lineTotal, item.price.currencyCode)}</span>
          <div class="qty-ctrl">
            <button class="qty-btn">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn">+</button>
          </div>
        </div>
      </div>`;
    el.querySelectorAll('.qty-btn')[0].addEventListener('click', () => updateQty(item.variantId, -1));
    el.querySelectorAll('.qty-btn')[1].addEventListener('click', () => updateQty(item.variantId, +1));
    body.appendChild(el);
  });

  // PREDICTIVE UPSELL MODULE (Context-Aware)
  if (state.products && state.products.length > 0) {
    const cartProductIds = new Set(state.cart.map(i => i.productId));
    
    // Trova vendors e collections attualmente nel carrello
    const cartVendors = new Set();
    const cartCollections = new Set();
    
    state.cart.forEach(cartItem => {
      const fullProd = state.products.find(p => p.id === cartItem.productId);
      if (fullProd) {
        if (fullProd.vendor) cartVendors.add(fullProd.vendor);
        if (fullProd.collections?.edges) {
          fullProd.collections.edges.forEach(e => cartCollections.add(e.node.id));
        }
      }
    });

    // Filtra prodotti disponibili per l'upsell
    let availableUpsells = state.products.filter(p => !cartProductIds.has(p.id));
    
    if (availableUpsells.length > 0) {
      const missingForFreeShipping = 50 - total;
      
      let rec = null;
      let upsellMessage = '';
      let upsellIcon = 'sparkles';
      
      if (missingForFreeShipping > 0 && missingForFreeShipping <= 40) {
        // Cerca un prodotto che costa più o meno quanto manca
        const thresholdCandidates = availableUpsells.filter(p => {
          const pPrice = parseFloat(p.variants?.edges[0]?.node?.price?.amount || 0);
          return pPrice >= missingForFreeShipping && pPrice <= missingForFreeShipping + 15;
        });
        
        if (thresholdCandidates.length > 0) {
          rec = thresholdCandidates[Math.floor(Math.random() * thresholdCandidates.length)];
        } else {
          // Fallback al più economico che fa scattare la soglia
          const sorted = [...availableUpsells].sort((a, b) => parseFloat(a.variants?.edges[0]?.node?.price?.amount || 0) - parseFloat(b.variants?.edges[0]?.node?.price?.amount || 0));
          rec = sorted.find(p => parseFloat(p.variants?.edges[0]?.node?.price?.amount || 0) >= missingForFreeShipping) || sorted[0];
        }
        
        upsellMessage = `Ti mancano solo <b>${fmt(missingForFreeShipping, state.cart[0]?.price?.currencyCode || 'EUR')}</b> per la spedizione gratuita! Aggiungi questo:`;
        upsellIcon = 'truck';
      } else {
        // Upsell contestuale normale se ha già la spedizione gratis o il carrello è vuoto
        let smartUpsells = availableUpsells.filter(p => {
          if (cartVendors.has(p.vendor)) return true;
          if (p.collections?.edges?.some(e => cartCollections.has(e.node.id))) return true;
          return false;
        });
        if (smartUpsells.length === 0) smartUpsells = availableUpsells;
        rec = smartUpsells[Math.floor(Math.random() * smartUpsells.length)];
        const isSmartMatch = smartUpsells !== availableUpsells;
        const perc = isSmartMatch ? Math.floor(Math.random() * (95 - 82) + 82) : Math.floor(Math.random() * (75 - 60) + 60);
        upsellMessage = `Comprato dal ${perc}% dei clienti insieme a questi articoli`;
      }
      
      const variant = rec?.variants?.edges[0]?.node;
      
      if (rec && variant) {
        const upsellEl = document.createElement('div');
        upsellEl.className = 'cart-upsell';
        if (upsellIcon === 'truck') upsellEl.style.borderColor = 'var(--gold)'; // Evidenzia il banner spedizione
        
        upsellEl.innerHTML = `
          <div class="cart-upsell-header" ${upsellIcon === 'truck' ? 'style="color:var(--gold)"' : ''}>
            <i data-lucide="${upsellIcon}"></i>
            <span>${upsellMessage}</span>
          </div>
          <div class="cart-upsell-body">
            <img src="${rec.images?.edges[0]?.node?.url || ''}" alt="${rec.title}" loading="lazy" decoding="async">
            <div class="cart-upsell-info">
              <p class="cart-upsell-title">${rec.title}</p>
              <p class="cart-upsell-price">${fmt(variant.price.amount, variant.price.currencyCode)}</p>
            </div>
            <button class="icon-btn cart-upsell-add" aria-label="Aggiungi all'ordine"><i data-lucide="plus"></i></button>
          </div>
        `;
        
        upsellEl.querySelector('.cart-upsell-add').addEventListener('click', () => {
          addToCart(rec, variant.id);
          toast("Aggiunto all'ordine!");
        });
        
        body.appendChild(upsellEl);
        refreshIcons(upsellEl);
      }
    }
  }

  if (tot) tot.textContent = fmt(total, state.cart[0]?.price?.currencyCode || 'EUR');
}

export async function checkout() {
  track('checkout_start', { items: state.cart.length });
  haptic(60);
  const btn = $('checkout-btn');
  btn.textContent = '⏳ Preparazione...'; btn.disabled = true;
  try {
    const url = await shopify.createCheckoutUrl(state.cart);
    window.location.href = url;
  } catch { 
    toast('Errore checkout. Riprova.', true); 
    btn.innerHTML = '<i data-lucide="credit-card"></i> Checkout';
    btn.disabled = false;
    refreshIcons(btn);
  }
}
