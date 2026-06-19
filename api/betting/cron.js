import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Autenticazione di sicurezza per il cron job (Vercel lo chiama con un header specifico)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Non autorizzato' });
  }

  try {
    // 1. Recupera i risultati reali (Logica Mock o Provider)
    // Qui andrà inserita l'integrazione con API-Football per scaricare i risultati finali delle partite.
    // Per ora, simuliamo che abbiamo un array di risultati: ["1", "X", "1", "2", "1", "1", "X"]
    // (L'implementazione finale richiederà di scansionare l'ID delle partite e vedere se sono finite)
    const realResults = process.env.MOCK_REAL_RESULTS ? JSON.parse(process.env.MOCK_REAL_RESULTS) : null;
    
    if (!realResults) {
      return res.status(200).json({ message: 'Nessun risultato reale disponibile al momento per valutare le schedine.' });
    }

    // 2. Recupera tutte le schedine attive dal Database
    let activeBetIds = [];
    try {
      activeBetIds = await kv.lrange('active_bets', 0, -1);
    } catch(e) {
      return res.status(500).json({ error: 'Errore connessione KV Database' });
    }

    if (!activeBetIds || activeBetIds.length === 0) {
      return res.status(200).json({ message: 'Nessuna schedina in attesa di valutazione.' });
    }

    const winners = [];

    // 3. Valuta ogni schedina
    for (const betId of activeBetIds) {
      const betData = await kv.get(betId);
      if (!betData || betData.status !== 'pending') continue;

      let isWinner = true;
      for (let i = 0; i < 7; i++) {
        if (betData.predictions[i] !== realResults[i]) {
          isWinner = false;
          break;
        }
      }

      if (isWinner) {
        winners.push(betData);
        betData.status = 'won';
        await kv.set(betId, betData); // Aggiorna DB
        // Genera Sconto su Shopify
        await generateShopifyDiscount(betData.email, betData.name);
      } else {
        betData.status = 'lost';
        await kv.set(betId, betData); // Aggiorna DB
      }
      
      // Rimuovi dalla coda delle scommesse attive
      await kv.lrem('active_bets', 0, betId);
    }

    return res.status(200).json({ 
      success: true, 
      evaluated: activeBetIds.length,
      winners: winners.length 
    });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return res.status(500).json({ error: 'Errore interno durante il cron job' });
  }
}

// ----------------------------------------------------------------------
// FUNZIONE PER GENERARE SCONTO SU SHOPIFY TRAMITE ADMIN API
// ----------------------------------------------------------------------
async function generateShopifyDiscount(customerEmail, customerName) {
  const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // es. eliseeshop.myshopify.com

  if (!SHOPIFY_TOKEN || !SHOP_DOMAIN) {
    console.warn(`Vincitore trovato (${customerEmail}) ma credenziali Shopify Admin mancanti. Buono non generato automaticamente.`);
    return;
  }

  const codeString = `LUDO-WIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  try {
    // 1. Crea la Price Rule (Regola Sconto: Es. -10€ su prodotti da 1 a 35€)
    const priceRulePayload = {
      price_rule: {
        title: codeString,
        target_type: "line_item",
        target_selection: "all",
        allocation_method: "across",
        value_type: "fixed_amount",
        value: "-10.0", // Cambia con l'importo desiderato
        customer_selection: "prerequisite",
        prerequisite_customer_ids: [], // Potremmo cercare il Customer ID via email, per ora lasciamo aperto se ha il codice
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Valido 30 giorni
        usage_limit: 1
      }
    };

    const ruleRes = await fetch(`https://${SHOP_DOMAIN}/admin/api/2024-04/price_rules.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_TOKEN
      },
      body: JSON.stringify(priceRulePayload)
    });

    if (!ruleRes.ok) throw new Error("Errore creazione Price Rule");
    const ruleData = await ruleRes.json();
    const priceRuleId = ruleData.price_rule.id;

    // 2. Crea il Discount Code vero e proprio associato alla Price Rule
    const discountPayload = {
      discount_code: {
        code: codeString
      }
    };

    const codeRes = await fetch(`https://${SHOP_DOMAIN}/admin/api/2024-04/price_rules/${priceRuleId}/discount_codes.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_TOKEN
      },
      body: JSON.stringify(discountPayload)
    });

    if (!codeRes.ok) throw new Error("Errore creazione Discount Code");

    // NOTA: Qui si potrebbe integrare un sistema di invio email automatica (es. Resend o SendGrid)
    // per avvisare 'customerEmail' che ha vinto 'codeString'.
    console.log(`VITTORIA! Sconto ${codeString} generato per ${customerEmail}`);

  } catch (err) {
    console.error("Errore Shopify Discount API:", err);
  }
}
