import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    const realResults = process.env.MOCK_REAL_RESULTS ? JSON.parse(process.env.MOCK_REAL_RESULTS) : null;
    
    if (!realResults) {
      return NextResponse.json({ message: 'Nessun risultato reale disponibile al momento per valutare le schedine.' });
    }

    let activeBetIds: string[] = [];
    try {
      activeBetIds = await kv.lrange('active_bets', 0, -1);
    } catch(e) {
      return NextResponse.json({ error: 'Errore connessione KV Database' }, { status: 500 });
    }

    if (!activeBetIds || activeBetIds.length === 0) {
      return NextResponse.json({ message: 'Nessuna schedina in attesa di valutazione.' });
    }

    const winners: any[] = [];

    for (const betId of activeBetIds) {
      const betData: any = await kv.get(betId);
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
        await kv.set(betId, betData);
        await generateShopifyDiscount(betData.email, betData.name);
      } else {
        betData.status = 'lost';
        await kv.set(betId, betData);
      }
      
      await kv.lrem('active_bets', 0, betId);
    }

    return NextResponse.json({ 
      success: true, 
      evaluated: activeBetIds.length,
      winners: winners.length 
    });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: 'Errore interno durante il cron job' }, { status: 500 });
  }
}

async function generateShopifyDiscount(customerEmail: string, customerName: string) {
  const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;

  if (!SHOPIFY_TOKEN || !SHOP_DOMAIN) {
    console.warn(`Vincitore trovato (${customerEmail}) ma credenziali Shopify Admin mancanti. Buono non generato automaticamente.`);
    return;
  }

  const codeString = `LUDO-WIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  try {
    const priceRulePayload = {
      price_rule: {
        title: codeString,
        target_type: "line_item",
        target_selection: "all",
        allocation_method: "across",
        value_type: "fixed_amount",
        value: "-10.0",
        customer_selection: "prerequisite",
        prerequisite_customer_ids: [],
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    console.log(`VITTORIA! Sconto ${codeString} generato per ${customerEmail}`);

  } catch (err) {
    console.error("Errore Shopify Discount API:", err);
  }
}
