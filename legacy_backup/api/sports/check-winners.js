export default async function handler(req, res) {
  // Configurazione CORS per Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // endpoint di sicurezza: richiamabile solo con un CRON_SECRET o pubblicamente per test.
  // In produzione puoi proteggerlo usando req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({ 
        message: 'Cron job simulato: nessun database configurato.', 
        info: 'Quando configurerai Supabase, questo endpoint processerà tutte le schedine pendenti.' 
      });
    }

    // 1. Scarica tutte le schedine in stato PENDING
    const betsRes = await fetch(`${SUPABASE_URL}/rest/v1/user_bets?status=eq.PENDING`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!betsRes.ok) throw new Error('Errore lettura schedine');
    const pendingBets = await betsRes.json();

    if (pendingBets.length === 0) {
      return res.status(200).json({ message: 'Nessuna schedina pendente.' });
    }

    // 2. Simulazione o Recupero Risultati Reali
    // Qui andrebbe un fetch a un'API sportiva vera che restituisce gli score dei match passati.
    // Simuliamo che i risultati delle prime partite siano 1, X, 2 in modo casuale o programmato.
    const mockRealResults = {
      'm1': '1', 'm2': 'X', 'm3': '2', 'm4': '1', 'm5': '1', 'm6': '2', 'm7': 'X'
    };

    let processedCount = 0;
    let winnersCount = 0;

    // 3. Controllo incrociato
    for (const betData of pendingBets) {
      let isWinner = true;
      const userBets = betData.bets;

      for (const [matchId, prediction] of Object.entries(userBets)) {
        const realResult = mockRealResults[matchId];
        // Se un risultato non è ancora disponibile, la schedina resta in PENDING (esce dal loop)
        if (!realResult) {
          isWinner = null; 
          break; 
        }
        if (prediction !== realResult) {
          isWinner = false;
        }
      }

      if (isWinner === true) {
        // Aggiorna stato a VINTA
        await updateBetStatus(betData.id, 'WON', SUPABASE_URL, SUPABASE_KEY);
        // Qui potremmo inviare un'email usando Resend API con il codice sconto!
        winnersCount++;
        processedCount++;
      } else if (isWinner === false) {
        // Aggiorna stato a PERSA
        await updateBetStatus(betData.id, 'LOST', SUPABASE_URL, SUPABASE_KEY);
        processedCount++;
      }
    }

    return res.status(200).json({ 
      success: true, 
      processed: processedCount, 
      winners: winnersCount 
    });

  } catch (error) {
    console.error('Check Winners Error:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

async function updateBetStatus(id, newStatus, url, key) {
  await fetch(`${url}/rest/v1/user_bets?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus })
  });
}
