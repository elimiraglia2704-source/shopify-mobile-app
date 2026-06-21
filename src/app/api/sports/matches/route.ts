import { NextResponse } from 'next/server';

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
  'Japan': 'Giappone'
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

let cachedData: EspnScoreboardData | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 10000; // 10 seconds cache

async function getEspnScoreboard(): Promise<EspnScoreboardData | null> {
  const now = Date.now();
  if (cachedData && (now - lastFetchTime < CACHE_TTL)) {
    return cachedData;
  }
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      cachedData = await res.json() as EspnScoreboardData;
      lastFetchTime = now;
      return cachedData;
    }
  } catch (err) {
    console.error("Errore fetch ESPN Scoreboard:", err);
  }
  return cachedData; // fallback to stale cache if request fails
}

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

export async function GET() {
  const upcomingMatches = [
    { id: 'm1', home: 'Spagna', away: 'Arabia Saudita', info: 'Mondiale 2026', startTime: '2026-06-21T16:00:00Z' },
    { id: 'm2', home: 'Belgio', away: 'Iran', info: 'Mondiale 2026', startTime: '2026-06-21T19:00:00Z' },
    { id: 'm3', home: 'Uruguay', away: 'Capo Verde', info: 'Mondiale 2026', startTime: '2026-06-21T22:00:00Z' },
    { id: 'm4', home: 'Nuova Zelanda', away: 'Egitto', info: 'Mondiale 2026', startTime: '2026-06-22T01:00:00Z' },
    { id: 'm5', home: 'Argentina', away: 'Austria', info: 'Mondiale 2026', startTime: '2026-06-22T17:00:00Z' },
    { id: 'm6', home: 'Francia', away: 'Iraq', info: 'Mondiale 2026', startTime: '2026-06-22T21:00:00Z' },
    { id: 'm7', home: 'Norvegia', away: 'Senegal', info: 'Mondiale 2026', startTime: '2026-06-23T00:00:00Z' }
  ];

  const espnData = await getEspnScoreboard();
  const now = new Date();

  const matchesWithLive = upcomingMatches.map(match => {
    let liveInfo = null;

    if (espnData && espnData.events) {
      // Try to find the match in the ESPN events
      const event = espnData.events.find((e: EspnEvent) => {
        const comp = e.competitions?.[0];
        if (!comp) return false;
        const homeName = comp.competitors?.find((c: EspnCompetitor) => c.homeAway === 'home')?.team?.displayName;
        const awayName = comp.competitors?.find((c: EspnCompetitor) => c.homeAway === 'away')?.team?.displayName;

        if (!homeName || !awayName) return false;

        const mappedHome = teamNameMap[homeName] || homeName;
        const mappedAway = teamNameMap[awayName] || awayName;

        return (mappedHome.toLowerCase() === match.home.toLowerCase() && mappedAway.toLowerCase() === match.away.toLowerCase()) ||
               (mappedHome.toLowerCase() === match.away.toLowerCase() && mappedAway.toLowerCase() === match.home.toLowerCase());
      });

      if (event) {
        const comp = event.competitions?.[0];
        if (comp) {
          const homeCompetitor = comp.competitors?.find((c: EspnCompetitor) => c.homeAway === 'home');
          const awayCompetitor = comp.competitors?.find((c: EspnCompetitor) => c.homeAway === 'away');

          const homeScore = parseInt(homeCompetitor?.score || '0', 10);
          const awayScore = parseInt(awayCompetitor?.score || '0', 10);

          const espnHomeDisplayName = homeCompetitor?.team?.displayName || '';
          const isHomeMapped = (teamNameMap[espnHomeDisplayName] || espnHomeDisplayName).toLowerCase() === match.home.toLowerCase();

          // Map scores to home/away as defined in our match (e.g. Spain is home in match, but might be away in ESPN)
          const finalHomeScore = isHomeMapped ? homeScore : awayScore;
          const finalAwayScore = isHomeMapped ? awayScore : homeScore;

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

          // Calculate elapsedMins
          const startTime = new Date(match.startTime);
          const elapsedMs = now.getTime() - startTime.getTime();
          const elapsedMins = Math.max(0, Math.floor(elapsedMs / 60000));

          liveInfo = {
            status,
            label,
            homeScore: finalHomeScore,
            awayScore: finalAwayScore,
            elapsedMins
          };
        }
      }
    }

    if (!liveInfo) {
      // Fallback to local simulator
      liveInfo = getMockLiveScore(match.id, match.startTime, now);
    }

    return {
      ...match,
      ...liveInfo
    };
  });

  return NextResponse.json({ matches: matchesWithLive });
}

