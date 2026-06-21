import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, bets } = await request.json();

    if (!email || !bets || Object.keys(bets).length === 0) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (SUPABASE_URL && SUPABASE_KEY) {
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
      console.log('Nessun DB configurato. Schedina ricevuta in memoria:', { email, bets });
    }

    return NextResponse.json({ success: true, message: 'Schedina registrata con successo!' });
  } catch (error) {
    console.error('Submit Bet Error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
