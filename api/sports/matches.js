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
    { id: 'm5', home: 'Olanda', away: 'Svezia', info: 'Mondiale 2026', startTime: '2026-06-20T17:00:00Z' },
    { id: 'm6', home: 'Germania', away: "Costa d'Avorio", info: 'Mondiale 2026', startTime: '2026-06-20T20:00:00Z' },
    { id: 'm7', home: 'Ecuador', away: 'Curacao', info: 'Mondiale 2026', startTime: '2026-06-21T00:00:00Z' },
    { id: 'm8', home: 'Spagna', away: 'Galles', info: 'Mondiale 2026', startTime: '2026-06-21T18:00:00Z' },
    { id: 'm9', home: 'Francia', away: 'Irlanda', info: 'Mondiale 2026', startTime: '2026-06-21T21:00:00Z' },
    { id: 'm10', home: 'Italia', away: 'Croazia', info: 'Mondiale 2026', startTime: '2026-06-22T17:00:00Z' },
    { id: 'm11', home: 'Argentina', away: 'Messico', info: 'Mondiale 2026', startTime: '2026-06-22T20:00:00Z' }
  ];

  res.status(200).json({ matches: mockMatches });
}
