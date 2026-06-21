import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const teamNameMap: Record<string, string> = {
  'Spain': 'Spagna',
  'Saudi Arabia': 'Arabia Saudita',
  'Belgium': 'Belgio',
  'Iran': 'Iran',
  'Uruguay': 'Uruguay',
  'Cape Verde': 'Capo Verde',
  'New Zealand': 'Nuova Zelanda',
  'Egypt': 'Egitto',
  'Argentina': 'Argentina',
  'Austria': 'Austria',
  'France': 'Francia',
  'Iraq': 'Iraq',
  'Norway': 'Norvegia',
  'Senegal': 'Senegal',
  'Tunisia': 'Tunisia',
  'Japan': 'Giappone',
  'Uzbekistan': 'Uzbekistan',
  'Portugal': 'Portogallo',
  'Ghana': 'Ghana',
  'England': 'Inghilterra',
  'Croatia': 'Croazia',
  'Panama': 'Panama',
  'Congo DR': 'Repubblica Democratica del Congo',
  'Colombia': 'Colombia',
  'Jordan': 'Giordania',
  'Algeria': 'Algeria'
};

interface EspnCompetitor {
  homeAway: 'home' | 'away';
  score?: string;
  team?: {
    displayName?: string;
  };
}

interface EspnCompetition {
  competitors?: EspnCompetitor[];
  status?: {
    clock?: number;
    displayClock?: string;
    type?: {
      name?: string;
      state?: string;
      completed?: boolean;
      detail?: string;
      shortDetail?: string;
    };
  };
}

interface EspnEvent {
  id: string;
  date: string;
  name: string;
  competitions?: EspnCompetition[];
}

interface EspnScoreboardData {
  events?: EspnEvent[];
}

// Memory caching per evitare di saturare l'API di ESPN ad ogni richiesta client
interface CacheEntry {
  data: EspnScoreboardData;
  timestamp: number;
}
const dateCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 15000; // 15 secondi di cache per data

async function fetchEspnScoreboard(dateStr: string): Promise<EspnScoreboardData | null> {
  const now = Date.now();
  const cached = dateCache[dateStr];
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json() as EspnScoreboardData;
      dateCache[dateStr] = { data, timestamp: now };
      return data;
    }
  } catch (err) {
    console.error(`Errore fetch ESPN per data ${dateStr}:`, err);
  }
  return cached ? cached.data : null;
}

// Simulatore di ripiego per generare punteggi dinamici live se ESPN non ha match
function getMockLiveScore(matchId: string, startTimeStr: string, now: Date) {
  const startTime = new Date(startTimeStr);
  const elapsedMs = now.getTime() - startTime.getTime();
  const elapsedMins = Math.floor(elapsedMs / 60000);

  let hash = 0;
  for (let i = 0; i < matchId.length; i++) {
    hash = matchId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const homeMax = (hash % 3) + (hash % 2 === 0 ? 1 : 0);
  const awayMax = ((hash >> 2) % 3);

  const homeGoalTimes = [15, 42, 65, 82].slice(0, homeMax);
  const awayGoalTimes = [28, 55, 78].slice(0, awayMax);

  if (elapsedMins < 0) return { status: 'scheduled' as const, label: 'Non Iniziata', homeScore: 0, awayScore: 0, elapsedMins };
  if (elapsedMins >= 105) return { status: 'finished' as const, label: 'FT', homeScore: homeMax, awayScore: awayMax, elapsedMins };

  let displayMin = '';
  let activeMin = 0;
  if (elapsedMins <= 45) {
    activeMin = elapsedMins;
    displayMin = `${elapsedMins}'`;
  } else if (elapsedMins > 45 && elapsedMins <= 60) {
    activeMin = 45;
    displayMin = 'HT';
  } else {
    activeMin = Math.min(90, elapsedMins - 15);
    displayMin = `${activeMin}'`;
  }

  const currentHomeScore = homeGoalTimes.filter(t => t <= activeMin).length;
  const currentAwayScore = awayGoalTimes.filter(t => t <= activeMin).length;

  return { status: 'live' as const, label: displayMin, homeScore: currentHomeScore, awayScore: currentAwayScore, elapsedMins };
}

function getMatchId(home: string, away: string, espnId: string): string {
  const h = home.toLowerCase();
  const a = away.toLowerCase();
  if ((h === 'spagna' && a === 'arabia saudita') || (h === 'arabia saudita' && a === 'spagna')) return 'm1';
  if ((h === 'belgio' && a === 'iran') || (h === 'iran' && a === 'belgio')) return 'm2';
  if ((h === 'uruguay' && a === 'capo verde') || (h === 'capo verde' && a === 'uruguay')) return 'm3';
  if ((h === 'nuova zelanda' && a === 'egitto') || (h === 'egitto' && a === 'nuova zelanda')) return 'm4';
  if ((h === 'argentina' && a === 'austria') || (h === 'austria' && a === 'argentina')) return 'm5';
  if ((h === 'francia' && a === 'iraq') || (h === 'iraq' && a === 'francia')) return 'm6';
  if ((h === 'norvegia' && a === 'senegal') || (h === 'senegal' && a === 'norvegia')) return 'm7';
  return `m_${espnId}`;
}

export async function GET() {
  const now = new Date();
  
  // Genera le date da ieri fino a 4 giorni futuri (totale 5 giorni scansionati)
  const datesToScan: string[] = [];
  const startDay = new Date();
  startDay.setDate(startDay.getDate() - 1); // partiamo da ieri

  for (let i = 0; i < 5; i++) {
    const d = new Date(startDay);
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    datesToScan.push(`${yyyy}${mm}${dd}`);
  }

  const mappedMatches: any[] = [];
  const processedEventIds = new Set<string>();

  // Esegue il fetch sequenziale dei dati ESPN per ciascun giorno
  for (const dateStr of datesToScan) {
    const espnData = await fetchEspnScoreboard(dateStr);
    if (espnData && espnData.events) {
      espnData.events.forEach((event: EspnEvent) => {
        if (processedEventIds.has(event.id)) return;
        processedEventIds.add(event.id);

        const comp = event.competitions?.[0];
        if (!comp) return;

        const homeCompetitor = comp.competitors?.find((c: EspnCompetitor) => c.homeAway === 'home');
        const awayCompetitor = comp.competitors?.find((c: EspnCompetitor) => c.homeAway === 'away');

        const rawHomeName = homeCompetitor?.team?.displayName || '';
        const rawAwayName = awayCompetitor?.team?.displayName || '';

        const homeName = teamNameMap[rawHomeName] || rawHomeName;
        const awayName = teamNameMap[rawAwayName] || rawAwayName;

        const homeScore = parseInt(homeCompetitor?.score || '0', 10);
        const awayScore = parseInt(awayCompetitor?.score || '0', 10);

        const statusObj = comp.status;
        const completed = statusObj?.type?.completed;
        const isScheduled = statusObj?.type?.name === 'STATUS_SCHEDULED' || statusObj?.type?.state === 'pre';

        let status: 'scheduled' | 'live' | 'finished' = 'live';
        let label = statusObj?.displayClock || '';

        if (completed) {
          status = 'finished';
          label = 'FT';
        } else if (isScheduled) {
          status = 'scheduled';
          label = 'Non Iniziata';
        } else {
          status = 'live';
          if (statusObj?.type?.name === 'STATUS_HALFTIME' || statusObj?.type?.detail === 'Halftime' || statusObj?.type?.shortDetail === 'HT') {
            label = 'HT';
          }
        }

        // Calcola minuti trascorsi con fallback sul clock reale di ESPN
        const startTime = new Date(event.date);
        const elapsedMs = now.getTime() - startTime.getTime();
        const fallbackElapsedMins = Math.max(0, Math.floor(elapsedMs / 60000));
        
        // Se il match è in corso e ESPN ha un clock, usa quello!
        const elapsedMins = (status === 'live' && statusObj?.clock !== undefined) 
          ? Math.floor(statusObj.clock) 
          : fallbackElapsedMins;

        const id = getMatchId(homeName, awayName, event.id);

        mappedMatches.push({
          id,
          home: homeName,
          away: awayName,
          info: 'Mondiale 2026',
          startTime: event.date,
          status,
          label: label || (status === 'live' ? `${elapsedMins}'` : 'Non Iniziata'),
          homeScore,
          awayScore,
          elapsedMins
        });
      });
    }
  }

  // Fallback statico originale per garantire retrocompatibilità ed avere sempre almeno 7 match
  const fallbackMatches = [
    { id: 'm1', home: 'Spagna', away: 'Arabia Saudita', info: 'Mondiale 2026', startTime: '2026-06-21T16:00:00Z' },
    { id: 'm2', home: 'Belgio', away: 'Iran', info: 'Mondiale 2026', startTime: '2026-06-21T19:00:00Z' },
    { id: 'm3', home: 'Uruguay', away: 'Capo Verde', info: 'Mondiale 2026', startTime: '2026-06-21T22:00:00Z' },
    { id: 'm4', home: 'Nuova Zelanda', away: 'Egitto', info: 'Mondiale 2026', startTime: '2026-06-22T01:00:00Z' },
    { id: 'm5', home: 'Argentina', away: 'Austria', info: 'Mondiale 2026', startTime: '2026-06-22T17:00:00Z' },
    { id: 'm6', home: 'Francia', away: 'Iraq', info: 'Mondiale 2026', startTime: '2026-06-22T21:00:00Z' },
    { id: 'm7', home: 'Norvegia', away: 'Senegal', info: 'Mondiale 2026', startTime: '2026-06-23T00:00:00Z' }
  ];

  // Aggiunge elementi dal fallback solo se non sono già presenti (per ID) e finché non arriviamo ad almeno 7 match
  const finalMatches = [...mappedMatches];
  for (const fb of fallbackMatches) {
    if (finalMatches.length >= 7) break;
    const exists = finalMatches.some(m => m.id === fb.id);
    if (!exists) {
      const liveInfo = getMockLiveScore(fb.id, fb.startTime, now);
      finalMatches.push({
        ...fb,
        ...liveInfo
      });
    }
  }

  // Ordina per data di inizio per visualizzazione ordinata
  finalMatches.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return NextResponse.json({ matches: finalMatches });
}
