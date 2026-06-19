export default async function handler(req, res) {
  // Configurazione CORS per Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    const { email, bets } = req.body;

    if (!email || !bets || Object.keys(bets).length === 0) {
      return res.status(400).json({ error: 'Dati mancanti' });
    }

    // Qui configureremo Supabase (o un altro DB) 
    // Quando inserirai SUPABASE_URL e SUPABASE_KEY in Vercel, le schedine si salveranno.
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (SUPABASE_URL && SUPABASE_KEY) {
      // Inserimento a Database tramite API REST di Supabase
      const response = await fetch(`${SUPABASE_URL}/rest/v1/user_bets`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_email: email,
          bets: bets,
          status: 'PENDING',
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Errore durante il salvataggio nel database');
      }
    } else {
      // Fallback temporaneo se il database non è ancora stato collegato su Vercel
      console.log('Nessun DB configurato. Schedina ricevuta in memoria:', { email, bets });
    }

    // Risposta positiva all'app
    return res.status(200).json({ success: true, message: 'Schedina registrata con successo!' });

  } catch (error) {
    console.error('Submit Bet Error:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
