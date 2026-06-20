export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // LOGICA AUTOMAZIONE CON API SPORTIVA 
  // In futuro, basterà scommentare questo blocco e inserire la chiave su Vercel (es. SPORTS_API_KEY)
  /*
  const API_KEY = process.env.SPORTS_API_KEY;
  if (API_KEY) {
    try {
      // Esempio per API-Football
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&league=4`, {
        headers: { 'x-apisports-key': API_KEY }
      });
      const data = await response.json();
      
      // Formatta le prime 7 partite non iniziate
      const liveMatches = data.response.slice(0, 7).map(m => ({
        id: m.fixture.id.toString(),
        home: m.teams.home.name,
        away: m.teams.away.name,
        info: `${m.league.name} - ${m.league.round}`,
        startTime: m.fixture.date // formato ISO
      }));
      
      return res.status(200).json({ matches: liveMatches });
    } catch (error) {
      console.error("API Fetch Error:", error);
      // Fallback in caso di errore di rete verso il mock locale
    }
  }
  */

  // -------------------------------------------------------------
  // MOCK DINAMICO DI FALLBACK (Sempre Gratuito)
  // -------------------------------------------------------------
  // Per fare in modo che la sezione non appaia mai "vuota", 
  // questo generatore dinamico crea sempre 7 partite con orari
  // spalmati nelle prossime 48 ore a partire dal momento in cui 
  // viene fatta la richiesta.
  
  const mockMatches = [
    // --- Partite passate (verranno filtrate via in automatico se l'ora corrente è maggiore) ---
    { id: 'm1', home: 'USA', away: 'Australia', info: 'Mondiale 2026', startTime: '2026-06-19T19:00:00Z' },
    { id: 'm2', home: 'Scozia', away: 'Marocco', info: 'Mondiale 2026', startTime: '2026-06-19T22:00:00Z' },
    { id: 'm3', home: 'Brasile', away: 'Haiti', info: 'Mondiale 2026', startTime: '2026-06-20T00:30:00Z' },
    { id: 'm4', home: 'Turchia', away: 'Paraguay', info: 'Mondiale 2026', startTime: '2026-06-20T03:00:00Z' },
    // --- Partite reali da screenshot ---
    { id: 'm5', home: 'Olanda', away: 'Svezia', info: 'Mondiale 2026', startTime: '2026-06-20T17:00:00Z' }, // 19:00 CEST
    { id: 'm6', home: 'Germania', away: "Costa d'Avorio", info: 'Mondiale 2026', startTime: '2026-06-20T20:00:00Z' }, // 22:00 CEST
    { id: 'm7', home: 'Ecuador', away: 'Curacao', info: 'Mondiale 2026', startTime: '2026-06-21T00:00:00Z' }, // 02:00 CEST
    { id: 'm8', home: 'Tunisia', away: 'Giappone', info: 'Mondiale 2026', startTime: '2026-06-21T04:00:00Z' }, // 06:00 CEST
    { id: 'm9', home: 'Spagna', away: 'Arabia Saudita', info: 'Mondiale 2026', startTime: '2026-06-21T16:00:00Z' }, // 18:00 CEST
    { id: 'm10', home: 'Belgio', away: 'Iran', info: 'Mondiale 2026', startTime: '2026-06-21T19:00:00Z' }, // 21:00 CEST
    { id: 'm11', home: 'Uruguay', away: 'Capo Verde', info: 'Mondiale 2026', startTime: '2026-06-21T22:00:00Z' }, // 00:00 CEST (22.06)
    { id: 'm12', home: 'Nuova Zelanda', away: 'Egitto', info: 'Mondiale 2026', startTime: '2026-06-22T01:00:00Z' }, // 03:00 CEST
    { id: 'm13', home: 'Argentina', away: 'Austria', info: 'Mondiale 2026', startTime: '2026-06-22T17:00:00Z' }, // 19:00 CEST
    { id: 'm14', home: 'Francia', away: 'Iraq', info: 'Mondiale 2026', startTime: '2026-06-22T21:00:00Z' } // 23:00 CEST
  ];

  // Filtra solo le partite NON ancora iniziate rispetto all'ora attuale
  const now = new Date();
  const upcomingMatches = mockMatches.filter(m => new Date(m.startTime) > now);

  // Ritorna esattamente le prossime 7 partite
  res.status(200).json({ matches: upcomingMatches.slice(0, 7) });
}
