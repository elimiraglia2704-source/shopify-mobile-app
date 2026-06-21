import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return handleCheckWinners(request);
}

export async function GET(request: Request) {
  return handleCheckWinners(request);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    }
  });
}

async function handleCheckWinners(request: Request) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ 
        message: 'Cron job simulato: nessun database configurato.', 
        info: 'Quando configurerai Supabase, questo endpoint processerà tutte le schedine pendenti.' 
      });
    }

    // 1. Scarica tutte le schedine in stato PENDING
    const betsRes = await fetch(`${SUPABASE_URL}/rest/v1/user_bets?status=eq.PENDING`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!betsRes.ok) throw new Error('Errore lettura schedine');
    const pendingBets = await betsRes.json();

    if (pendingBets.length === 0) {
      return NextResponse.json({ message: 'Nessuna schedina pendente.' });
    }

    const mockRealResults: Record<string, string> = {
      'm1': '1', 'm2': 'X', 'm3': '2', 'm4': '1', 'm5': '1', 'm6': '2', 'm7': 'X'
    };

    let processedCount = 0;
    let winnersCount = 0;

    for (const betData of pendingBets) {
      let isWinner: boolean | null = true;
      const userBets = betData.bets;

      for (const [matchId, prediction] of Object.entries(userBets)) {
        const realResult = mockRealResults[matchId];
        if (!realResult) {
          isWinner = null; 
          break; 
        }
        if (prediction !== realResult) {
          isWinner = false;
        }
      }

      if (isWinner === true) {
        await updateBetStatus(betData.id, 'WON', SUPABASE_URL, SUPABASE_KEY);
        winnersCount++;
        processedCount++;
      } else if (isWinner === false) {
        await updateBetStatus(betData.id, 'LOST', SUPABASE_URL, SUPABASE_KEY);
        processedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: processedCount, 
      winners: winnersCount 
    });

  } catch (error) {
    console.error('Check Winners Error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

async function updateBetStatus(id: string | number, newStatus: string, url: string, key: string) {
  await fetch(`${url}/rest/v1/user_bets?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus })
  });
}
