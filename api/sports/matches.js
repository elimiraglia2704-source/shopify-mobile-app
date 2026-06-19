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
  
  const now = new Date();
  
  const t1 = new Date(now); t1.setHours(t1.getHours() + 2);
  const t2 = new Date(now); t2.setHours(t2.getHours() + 4);
  const t3 = new Date(now); t3.setHours(t3.getHours() + 18);
  const t4 = new Date(now); t4.setHours(t4.getHours() + 21);
  const t5 = new Date(now); t5.setDate(t5.getDate() + 1); t5.setHours(18);
  const t6 = new Date(now); t6.setDate(t6.getDate() + 1); t6.setHours(21);
  const t7 = new Date(now); t7.setDate(t7.getDate() + 2); t7.setHours(18);

  const mockMatches = [
    { id: 'm1', home: 'Inghilterra', away: 'Stati Uniti', info: 'Mondiale 2026 - Gruppo A', startTime: t1.toISOString() },
    { id: 'm2', home: 'Spagna', away: 'Croazia', info: 'Mondiale 2026 - Gruppo B', startTime: t2.toISOString() },
    { id: 'm3', home: 'Svizzera', away: 'Bosnia', info: 'Mondiale 2026 - Gruppo C', startTime: t3.toISOString() },
    { id: 'm4', home: 'Olanda', away: 'Svezia', info: 'Mondiale 2026 - Gruppo D', startTime: t4.toISOString() },
    { id: 'm5', home: 'Germania', away: "Costa d'Avorio", info: 'Mondiale 2026 - Gruppo E', startTime: t5.toISOString() },
    { id: 'm6', home: 'Brasile', away: 'Haiti', info: 'Mondiale 2026 - Gruppo F', startTime: t6.toISOString() },
    { id: 'm7', home: 'Ecuador', away: 'Curaçao', info: 'Mondiale 2026 - Gruppo G', startTime: t7.toISOString() }
  ];

  res.status(200).json({ matches: mockMatches });
}
