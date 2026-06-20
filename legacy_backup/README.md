# Aura - Shopify Premium Mobile Experience 🚀

Una Web Application mobile-first progettata per connettersi istantaneamente al tuo account **Shopify** ed offrire un'interfaccia fluida, reattiva e dal design ultra-premium, simile a un'applicazione nativa per smartphone.

L'applicazione include un sistema di fallback intelligente: se non viene collegata a un account Shopify reale, carica dei **Mockup Data** pre-configurati ad alta definizione per dimostrare immediatamente il design e le funzionalità.

---

## Caratteristiche Principali ✨

*   **UI Mobile Premium**: Ottimizzata per la navigazione mobile, dotata di un frame prototipo stile iPhone quando aperta su desktop.
*   **Architettura SPA**: Nessun ricaricamento di pagina, transizioni fluide a 60fps tra le viste.
*   **Carrello Locale**: Stato del carrello persistente salvato localmente tramite `localStorage`.
*   **Interfaccia Shopify Storefront**: Integrazione nativa tramite le **API Storefront (GraphQL)** per sincronizzare prodotti, collezioni e varianti.
*   **Reindirizzamento Checkout**: Quando fai clic su "Procedi al Checkout", viene generata una sessione reale e sicura sul dominio del tuo negozio Shopify.

---

## Come Avviare l'Applicazione Localmente 💻

Poiché l'applicazione fa uso di moduli JavaScript ES6 (`type="module"`), è necessario eseguirla tramite un server web locale (anche molto semplice) anziché fare doppio clic sul file `index.html` (il protocollo `file://` blocca le importazioni di moduli JS per motivi di sicurezza CORS).

### Opzione 1: Utilizzare VS Code (Live Server)
Se usi Visual Studio Code, installa l'estensione **Live Server**, clicca con il tasto destro su `index.html` e seleziona **Open with Live Server**.

### Opzione 2: Utilizzare Python (se installato sul PC)
Apri un terminale nella cartella del progetto ed esegui:
```bash
python -m http.server 8000
```
Quindi apri il browser all'indirizzo: `http://localhost:8000`

### Opzione 3: Utilizzare Node.js (npx)
Esegui nel terminale:
```bash
npx serve
```

---

## Come Collegare il Tuo Negozio Shopify 🛒

Per connettere i prodotti e il checkout del tuo negozio reale, avrai bisogno di recuperare il **Dominio del Negozio** e lo **Storefront Access Token** dalle impostazioni di Shopify Admin:

### 1. Crea un'App Personalizzata su Shopify
1. Accedi al tuo pannello **Shopify Admin** (`nome-negozio.myshopify.com`).
2. Naviga su **Impostazioni** (in basso a sinistra) > **App e canali di vendita**.
3. Fai clic su **Sviluppa app** (in alto a destra).
4. Clicca su **Crea un'app** e inserisci un nome (es. "Aura Mobile App").

### 2. Configura le autorizzazioni dell'API Storefront
1. Entra nella scheda **Configurazione** dell'app appena creata.
2. Cerca la sezione **Integrazione dell'API Storefront** e clicca su **Configura**.
3. Seleziona i permessi necessari (si consiglia di spuntare tutti quelli relativi a prodotti, collezioni e carrello: `unauthenticated_read_product_listings`, `unauthenticated_read_product_tags`, `unauthenticated_write_checkouts`, ecc.).
4. Fai clic su **Salva** in alto a destra.

### 3. Installa l'App e Ottieni il Token
1. Vai nella scheda **Credenziali API** dell'app.
2. Clicca su **Installa app** e conferma.
3. Nella sezione **Token di accesso all'API Storefront**, copia la chiave generata (inizia solitamente con `shpca_`).

### 4. Connetti l'Applicazione
1. Avvia l'applicazione Aura nel browser.
2. Vai alla scheda **Impostazioni** (icona in basso a destra nella bottom bar dell'app).
3. Disattiva la spunta **Modalità Demo (Mockup)**.
4. Inserisci il dominio del tuo negozio (es. `il-tuo-negozio.myshopify.com`) e incolla lo **Storefront API Access Token**.
5. Fai clic su **Connetti e Salva**. 
6. L'indicatore diventerà verde segnalando l'avvenuta connessione. L'app caricherà immediatamente il catalogo reale del tuo negozio!
