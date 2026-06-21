import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  try {
    const { email, name, predictions } = await request.json();

    if (!email || !predictions || !Array.isArray(predictions) || predictions.length !== 7) {
      return NextResponse.json({ error: 'Dati schedina non validi. Compila tutti i 7 pronostici.' }, { status: 400 });
    }

    const betData = {
      email,
      name,
      predictions,
      timestamp: Date.now(),
      status: 'pending'
    };

    const betId = `bet_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    
    try {
      await kv.set(betId, betData);
      await kv.lpush('active_bets', betId);
    } catch (kvError) {
      console.warn("KV Database non ancora configurato o errore di scrittura:", kvError);
      return NextResponse.json({ success: true, warning: 'Database KV non connesso, schedina simulata.' });
    }

    return NextResponse.json({ success: true, betId });
    
  } catch (error) {
    console.error("Errore salvataggio scommessa:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    }
  });
}
