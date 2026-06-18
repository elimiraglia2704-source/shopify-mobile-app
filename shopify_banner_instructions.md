# Integrazione Web App Elisee su Shopify

Ecco il codice del banner mobile da incollare nel tuo negozio Shopify. Il banner apparirà **solo sui dispositivi mobili**, mostrerà l'estetica premium di Elisee e inviterà gli utenti a passare alla Web App.

Inoltre, è intelligente: non si mostrerà a chi sta già usando l'app (standalone mode) e ricorderà se l'utente lo ha chiuso, in modo da non risultare fastidioso.

### Istruzioni:
1. Accedi a Shopify > **Negozio Online** > **Temi**.
2. Clicca sui tre puntini (`...`) accanto al tuo tema principale e seleziona **Modifica codice**.
3. Apri il file **`theme.liquid`** (di solito si trova sotto la cartella "Layout").
4. Scorri fino alla fine del file, trova il tag di chiusura **`</body>`**.
5. Incolla il codice sottostante **esattamente prima** di `</body>`.
6. **ATTENZIONE**: Nel codice qui sotto, ricordati di sostituire `INSERISCI_QUI_URL_DELLA_TUA_WEB_APP` con l'URL reale in cui è ospitata la Web App.
7. Salva.

### Codice da incollare:

```html
<!-- ========================================== -->
<!-- ELISEE MOBILE APP BANNER                   -->
<!-- ========================================== -->
<style>
  #elisee-app-banner {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: rgba(10, 0, 16, 0.95); /* var(--bg) con trasparenza */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid rgba(155, 89, 208, 0.3); /* var(--purple) */
    z-index: 999999;
    padding: 14px 16px 20px 16px; /* Padding extra sotto per iPhone */
    box-shadow: 0 -4px 30px rgba(0,0,0,0.8);
    font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #ffffff;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateY(100%);
  }
  #elisee-app-banner.show {
    display: flex;
    transform: translateY(0);
  }
  .elisee-banner-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 12px;
  }
  .elisee-banner-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0f0020, #160030);
    border: 1px solid rgba(155, 89, 208, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: inset 0 0 10px rgba(155, 89, 208, 0.2);
  }
  .elisee-banner-icon svg {
    width: 22px;
    height: 22px;
    color: #d4af37; /* var(--gold) */
  }
  .elisee-banner-text {
    flex: 1;
  }
  .elisee-banner-title {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 3px 0;
    color: #ffffff;
    line-height: 1.1;
  }
  .elisee-banner-subtitle {
    font-size: 12px;
    margin: 0;
    color: #a899c0; /* var(--text-muted) */
  }
  .elisee-banner-btn {
    background: linear-gradient(135deg, #6a2fa0 0%, #9b59d0 100%);
    color: #ffffff !important;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 18px;
    border-radius: 8px;
    white-space: nowrap;
    border: none;
    box-shadow: 0 4px 15px rgba(155, 89, 208, 0.4);
  }
  .elisee-banner-close {
    background: none;
    border: none;
    color: #a899c0;
    font-size: 24px;
    padding: 0 0 0 8px;
    cursor: pointer;
    line-height: 1;
  }
</style>

<div id="elisee-app-banner">
  <div class="elisee-banner-content">
    <div class="elisee-banner-icon">
      <!-- Icona Corona Premium SVG -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.518l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
    </div>
    <div class="elisee-banner-text">
      <p class="elisee-banner-title">Esplora Elisee App</p>
      <p class="elisee-banner-subtitle">Esperienza VIP esclusiva.</p>
    </div>
    <!-- Link verso l'App su Netlify -->
    <a href="https://shopify-mobile-app-omega.vercel.app" class="elisee-banner-btn">Apri</a>
    <button class="elisee-banner-close" id="elisee-banner-close" aria-label="Chiudi">&times;</button>
  </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function() {
  // 1. Mostra solo su dispositivi mobili (es. smartphone)
  if (window.innerWidth > 768) return;

  // 2. Non mostrare se l'utente è già all'interno della PWA
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) return;

  // 3. Non mostrare se l'utente lo ha chiuso nelle ultime 24 ore
  var bannerClosedAt = localStorage.getItem('elisee_app_banner_closed_time');
  if (bannerClosedAt) {
    var now = new Date().getTime();
    var hours24 = 24 * 60 * 60 * 1000;
    if (now - parseInt(bannerClosedAt) < hours24) return;
  }

  // 4. Mostra il banner
  var banner = document.getElementById('elisee-app-banner');
  if (banner) {
    // Timeout per non farlo apparire istantaneamente al caricamento
    setTimeout(function() {
      banner.style.display = 'flex';
      void banner.offsetWidth; // Trigger reflow
      banner.classList.add('show');
    }, 1500);
    
    // Gestione chiusura
    document.getElementById('elisee-banner-close').addEventListener('click', function() {
      banner.classList.remove('show');
      setTimeout(function() { banner.style.display = 'none'; }, 400);
      // Salva il timestamp della chiusura
      localStorage.setItem('elisee_app_banner_closed_time', new Date().getTime().toString());
    });
  }
});
</script>
<!-- ========================================== -->
<!-- FINE ELISEE MOBILE APP BANNER              -->
<!-- ========================================== -->
```
