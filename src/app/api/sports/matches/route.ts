import { NextResponse } from 'next/server';

export async function GET() {
  const mockMatches = [
    { id: 'm1', home: 'USA', away: 'Australia', info: 'Mondiale 2026', startTime: '2026-06-19T19:00:00Z' },
    { id: 'm2', home: 'Scozia', away: 'Marocco', info: 'Mondiale 2026', startTime: '2026-06-19T22:00:00Z' },
    { id: 'm3', home: 'Brasile', away: 'Haiti', info: 'Mondiale 2026', startTime: '2026-06-20T00:30:00Z' },
    { id: 'm4', home: 'Turchia', away: 'Paraguay', info: 'Mondiale 2026', startTime: '2026-06-20T03:00:00Z' },
    { id: 'm5', home: 'Olanda', away: 'Svezia', info: 'Mondiale 2026', startTime: '2026-06-20T17:00:00Z' },
    { id: 'm6', home: 'Germania', away: "Costa d'Avorio", info: 'Mondiale 2026', startTime: '2026-06-20T20:00:00Z' },
    { id: 'm7', home: 'Ecuador', away: 'Curacao', info: 'Mondiale 2026', startTime: '2026-06-21T00:00:00Z' },
    { id: 'm8', home: 'Tunisia', away: 'Giappone', info: 'Mondiale 2026', startTime: '2026-06-21T04:00:00Z' },
    { id: 'm9', home: 'Spagna', away: 'Arabia Saudita', info: 'Mondiale 2026', startTime: '2026-06-21T16:00:00Z' },
    { id: 'm10', home: 'Belgio', away: 'Iran', info: 'Mondiale 2026', startTime: '2026-06-21T19:00:00Z' },
    { id: 'm11', home: 'Uruguay', away: 'Capo Verde', info: 'Mondiale 2026', startTime: '2026-06-21T22:00:00Z' },
    { id: 'm12', home: 'Nuova Zelanda', away: 'Egitto', info: 'Mondiale 2026', startTime: '2026-06-22T01:00:00Z' },
    { id: 'm13', home: 'Argentina', away: 'Austria', info: 'Mondiale 2026', startTime: '2026-06-22T17:00:00Z' },
    { id: 'm14', home: 'Francia', away: 'Iraq', info: 'Mondiale 2026', startTime: '2026-06-22T21:00:00Z' }
  ];

  // Return exactly the 7 matches shown in the screenshot for high fidelity
  // 1. Olanda - Svezia
  // 2. Germania - Costa d'Avorio
  // 3. Ecuador - Curacao
  // 4. Spagna - Galles (we can use Spagna - Arabia Saudita from list or customize it)
  // 5. Francia - Irlanda (we can use Francia - Iraq or customize it)
  // 6. Italia - Croazia
  // 7. Argentina - Messico (we can use Argentina - Austria or customize it)
  
  // Let's customize the mock list to match the screenshot exactly!
  const screenshotMatches = [
    { id: 'm5', home: 'Olanda', away: 'Svezia', info: 'Mondiale 2026', startTime: '2026-06-20T17:00:00Z' },
    { id: 'm6', home: 'Germania', away: "Costa d'Avorio", info: 'Mondiale 2026', startTime: '2026-06-20T20:00:00Z' },
    { id: 'm7', home: 'Ecuador', away: 'Curacao', info: 'Mondiale 2026', startTime: '2026-06-21T00:00:00Z' },
    { id: 'm9', home: 'Spagna', away: 'Galles', info: 'Mondiale 2026', startTime: '2026-06-21T18:00:00Z' },
    { id: 'm14', home: 'Francia', away: 'Irlanda', info: 'Mondiale 2026', startTime: '2026-06-21T21:00:00Z' },
    { id: 'm10', home: 'Italia', away: 'Croazia', info: 'Mondiale 2026', startTime: '2026-06-22T17:00:00Z' },
    { id: 'm13', home: 'Argentina', away: 'Messico', info: 'Mondiale 2026', startTime: '2026-06-22T20:00:00Z' }
  ];

  return NextResponse.json({ matches: screenshotMatches });
}
