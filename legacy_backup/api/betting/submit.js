import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, name, predictions } = req.body;

    if (!email || !predictions || !Array.isArray(predictions) || predictions.length !== 7) {
      return res.status(400).json({ error: 'Dati schedina non validi. Compila tutti i 7 pronostici.' });
    }

    // Costruisci l'oggetto schedina
    const betData = {
      email,
      name,
      predictions, // Es: ["1", "X", "2", "1", "1", "X", "2"]
      timestamp: Date.now(),
      status: 'pending' // pending, won, lost
    };

    // Usiamo l'email come chiave per salvare la schedina nel DB KV
    // Se un utente gioca più volte, sovrascrive la precedente o potremmo usare una lista.
    // In questo caso, usiamo una chiave unica per schedina per semplicità, legata all'email.
    const betId = `bet_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    
    // Salva nel database (richiede configurazione KV su Vercel)
    // Se KV non è ancora configurato, catchiamo l'errore per non bloccare l'app
    try {
      await kv.set(betId, betData);
      
      // Aggiungiamo l'ID della scommessa a una lista di "tutte le scommesse attive" per facilitare il controllo del Cron
      await kv.lpush('active_bets', betId);
    } catch (kvError) {
      console.warn("KV Database non ancora configurato o errore di scrittura:", kvError);
      // Se fallisce (perché l'utente non ha ancora le chiavi KV), restituiamo successo simulato per la UI
      return res.status(200).json({ success: true, warning: 'Database KV non connesso, schedina simulata.' });
    }

    return res.status(200).json({ success: true, betId });
    
  } catch (error) {
    console.error("Errore salvataggio scommessa:", error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
