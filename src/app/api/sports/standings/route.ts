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
  'Algeria': 'Algeria',
  'Switzerland': 'Svizzera',
  'Ivory Coast': "Costa d'Avorio",
  'Morocco': 'Marocco',
  'Canada': 'Canada',
  'Cameroon': 'Camerun',
  'South Korea': 'Corea del Sud',
  'Qatar': 'Qatar',
  'Mexico': 'Messico',
  'Ecuador': 'Ecuador',
  'Bolivia': 'Bolivia',
  'Germany': 'Germania',
  'Polonia': 'Polonia',
  'Poland': 'Polonia',
  'Brazil': 'Brasile',
  'Chile': 'Cile',
  'United States': 'USA',
  'USA': 'USA',
  'Turkey': 'Turchia',
  'Serbia': 'Serbia',
  'Italy': 'Italia',
  'Australia': 'Australia',
  'Ukraine': 'Ucraina',
  'Netherlands': 'Paesi Bassi',
  'Denmark': 'Danimarca',
  'Costa Rica': 'Costa Rica',
  'Scotland': 'Scozia',
  'Venezuela': 'Venezuela',
  'Sweden': 'Svezia'
};

const teamFlagMap: Record<string, string> = {
  'Spagna': '🇪🇸',
  'Arabia Saudita': '🇸🇦',
  'Svizzera': '🇨🇭',
  "Costa d'Avorio": '🇨🇮',
  'Belgio': '🇧🇪',
  'Iran': '🇮🇷',
  'Marocco': '🇲🇦',
  'Canada': '🇨🇦',
  'Uruguay': '🇺🇾',
  'Capo Verde': '🇨🇻',
  'Giappone': '🇯🇵',
  'Camerun': '🇨🇲',
  'Egitto': '🇪🇬',
  'Nuova Zelanda': '🇳🇿',
  'Corea del Sud': '🇰🇷',
  'Qatar': '🇶🇦',
  'Argentina': '🇦🇷',
  'Austria': '🇦🇹',
  'Messico': '🇲🇽',
  'Ecuador': '🇪🇨',
  'Francia': '🇫🇷',
  'Iraq': '🇮🇶',
  'Algeria': '🇩🇿',
  'Bolivia': '🇧🇴',
  'Germania': '🇩🇪',
  'Norvegia': '🇳🇴',
  'Senegal': '🇸🇳',
  'Polonia': '🇵🇱',
  'Brasile': '🇧🇷',
  'Portogallo': '🇵🇹',
  'Cile': '🇨🇱',
  'Croazia': '🇭🇷',
  'Inghilterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'USA': '🇺🇸',
  'Turchia': '🇹🇷',
  'Serbia': '🇷🇸',
  'Italia': '🇮🇹',
  'Australia': '🇦🇺',
  'Tunisia': '🇹🇳',
  'Ucraina': '🇺🇦',
  'Paesi Bassi': '🇳🇱',
  'Danimarca': '🇩🇰',
  'Ghana': '🇬🇭',
  'Costa Rica': '🇨🇷',
  'Scozia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Colombia': '🇨🇴',
  'Venezuela': '🇻🇪',
  'Svezia': '🇸🇪',
  'Uzbekistan': '🇺🇿',
  'Panama': '🇵🇦',
  'Repubblica Democratica del Congo': '🇨🇩',
  'Giordania': '🇯🇴'
};

interface EspnStat {
  name: string;
  value: number;
}

interface EspnEntry {
  team: {
    displayName: string;
  };
  stats: EspnStat[];
}

interface EspnGroup {
  name: string;
  standings?: {
    entries?: EspnEntry[];
  };
}

interface EspnStandingsData {
  children?: EspnGroup[];
}

let cachedStandings: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 30000; // 30 secondi di cache

export async function GET() {
  const now = Date.now();
  if (cachedStandings && (now - lastCacheTime < CACHE_TTL)) {
    return NextResponse.json({ groups: cachedStandings });
  }

  try {
    const res = await fetch('https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json() as EspnStandingsData;
      if (data.children) {
        const groups = data.children.map((group) => {
          // Traduci il nome del girone (es. Group A -> Girone A)
          const name = group.name.replace('Group', 'Girone');
          const entries = group.standings?.entries || [];
          
          const teams = entries.map((entry) => {
            const rawName = entry.team.displayName;
            const name = teamNameMap[rawName] || rawName;
            const flag = teamFlagMap[name] || '⚽';
            
            const stats = entry.stats || [];
            
            const g = stats.find(s => s.name === 'gamesPlayed')?.value ?? 0;
            const v = stats.find(s => s.name === 'wins')?.value ?? 0;
            const p = stats.find(s => s.name === 'ties')?.value ?? 0;
            const s = stats.find(s => s.name === 'losses')?.value ?? 0;
            const gf = stats.find(s => s.name === 'pointsFor')?.value ?? 0;
            const gs = stats.find(s => s.name === 'pointsAgainst')?.value ?? 0;
            const pts = stats.find(s => s.name === 'points')?.value ?? 0;
            
            return {
              name,
              flag,
              g,
              v,
              p,
              s,
              gf,
              gs,
              pts
            };
          });

          return {
            name,
            teams
          };
        });

        cachedStandings = groups;
        lastCacheTime = now;
        return NextResponse.json({ groups });
      }
    }
  } catch (err) {
    console.error("Errore fetch standings:", err);
  }

  // Fallback se ESPN non risponde o dà errore
  return NextResponse.json({ groups: [] });
}
