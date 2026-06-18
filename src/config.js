/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║           ELISEE MOBILE APP — FILE DI CONFIGURAZIONE     ║
 * ║                                                          ║
 * ║  Modifica questo file per personalizzare l'app:          ║
 * ║  • Logo, favicon, icona                                  ║
 * ║  • Immagini hero / banner                                ║
 * ║  • Nome app e colori                                     ║
 * ║  • Link social                                           ║
 * ╚══════════════════════════════════════════════════════════╝
 */

const ELISEE_CONFIG = {

  // ──────────────────────────────────────────────────────────
  // IDENTITÀ APP
  // ──────────────────────────────────────────────────────────
  app: {
    /** Nome visualizzato nel <title> del browser */
    name: 'Elisee Mobile',

    /** Descrizione SEO */
    description: 'Abbigliamento premium Elisee. Scopri la collezione.',

    /** Colore barra del browser mobile (theme-color) */
    themeColor: '#0a0010',
  },

  // ──────────────────────────────────────────────────────────
  // LOGO & ICONE
  // ──────────────────────────────────────────────────────────
  logo: {
    /**
     * Logo principale (header + side menu).
     * Può essere:
     *   - Un file locale: 'logo.png'
     *   - Un URL esterno: 'https://elisee.shop/cdn/shop/files/tuo-logo.png'
     */
    src: 'logo.png',

    /**
     * Favicon (icona tab del browser).
     * Shopify CDN favicon reale di elisee.shop:
     */
    favicon: 'https://elisee.shop/cdn/shop/files/1000136210_9a27c80a-85ed-485e-8129-c9fb00d76d88.png?crop=center&height=32&v=1774487396&width=32',

    /**
     * Icona Apple Touch (home screen iPhone/iPad).
     * Usa lo stesso logo ad alta risoluzione.
     */
    appleTouchIcon: 'logo.png',

    /** Testo alternativo del logo */
    alt: 'Elisee',
  },

  // ──────────────────────────────────────────────────────────
  // HERO HOME SCREEN
  // ──────────────────────────────────────────────────────────
  hero: {
    /**
     * Immagine principale della home.
     * Immagine reale dal sito elisee.shop (Open Graph image):
     */
    image: 'https://elisee.shop/cdn/shop/files/file_00000000834c61fbb3c77bed2d057f01_78b76f91-811d-485e-8af2-5a44f3483e8f.png?v=1757546803',

    /** Titolo grande sopra il hero */
    title: 'Scegli Elisee',

    /** Sottotitolo */
    subtitle: 'Stile. Qualità. Esclusività.',

    /** Testo del pulsante call-to-action */
    ctaText: 'Scopri la Collezione',
  },

  // ──────────────────────────────────────────────────────────
  // BANNER BENVENUTO (striscia in cima alla home)
  // ──────────────────────────────────────────────────────────
  welcomeStrip: {
    /** Testo della striscia benvenuto */
    text: 'BENVENUTO SU ELISEE',

    /** Mostra/nascondi la striscia */
    visible: true,
  },

  // ──────────────────────────────────────────────────────────
  // BANNER ELICLUB
  // ──────────────────────────────────────────────────────────
  eliclub: {
    title:    'EliClub',
    subtitle: 'Unisciti al club esclusivo e ottieni vantaggi riservati ai soci Elisee.',
    ctaText:  'Scopri EliClub',
  },

  // ──────────────────────────────────────────────────────────
  // COLORI PRINCIPALI
  // (cambiano il tema visivo dell'intera app)
  // ──────────────────────────────────────────────────────────
  colors: {
    /** Sfondo principale */
    bg:           '#0a0010',

    /** Viola accento */
    purple:       '#9b59d0',
    purpleLight:  '#c9a8f0',
    purpleDark:   '#6a2fa0',

    /** Oro / prezzo */
    gold:         '#d4af37',
    goldLight:    '#e8cc6a',

    /** Testo principale */
    text:         '#f0e8ff',
  },

  // ──────────────────────────────────────────────────────────
  // SOCIAL LINKS
  // ──────────────────────────────────────────────────────────
  social: {
    instagram: 'https://www.instagram.com/elisee.brand',
    tiktok:    'https://www.tiktok.com/@elisee.brand',
  },

  // ──────────────────────────────────────────────────────────
  // CONTATTI
  // ──────────────────────────────────────────────────────────
  contacts: {
    email:    'info@elisee.shop',
    instagram: '@elisee.brand',
    location:  'Italia',
    website:   'https://elisee.shop',
  },

  // ──────────────────────────────────────────────────────────
  // CODICI SCONTO
  // (aggiungine/modificane qui senza toccare app.js)
  // ──────────────────────────────────────────────────────────
  discountCodes: {
    'ELISEE10': 0.10,   // 10% di sconto
    'ELISEE20': 0.20,   // 20% di sconto
    'ELICLUB':  0.15,   // 15% riservato EliClub
    'VIP20':    0.20,   // 20% VIP
  },

};

export default ELISEE_CONFIG;
