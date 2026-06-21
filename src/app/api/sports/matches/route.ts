import { NextResponse } from 'next/server';

export async function GET() {
  // Let's use the upcoming matches from the live calendar
  const upcomingMatches = [
    { id: 'm1', home: 'Spagna', away: 'Arabia Saudita', info: 'Mondiale 2026', startTime: '2026-06-21T16:00:00Z' },
    { id: 'm2', home: 'Belgio', away: 'Iran', info: 'Mondiale 2026', startTime: '2026-06-21T19:00:00Z' },
    { id: 'm3', home: 'Uruguay', away: 'Capo Verde', info: 'Mondiale 2026', startTime: '2026-06-21T22:00:00Z' },
    { id: 'm4', home: 'Nuova Zelanda', away: 'Egitto', info: 'Mondiale 2026', startTime: '2026-06-22T01:00:00Z' },
    { id: 'm5', home: 'Argentina', away: 'Austria', info: 'Mondiale 2026', startTime: '2026-06-22T17:00:00Z' },
    { id: 'm6', home: 'Francia', away: 'Iraq', info: 'Mondiale 2026', startTime: '2026-06-22T21:00:00Z' },
    { id: 'm7', home: 'Norvegia', away: 'Senegal', info: 'Mondiale 2026', startTime: '2026-06-23T00:00:00Z' }
  ];

  return NextResponse.json({ matches: upcomingMatches });
}
