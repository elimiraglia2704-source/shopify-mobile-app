import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const creds = await request.json();
    if (creds.username === 'Eliseo2704' && creds.password === 'Iemmello9') {
      return NextResponse.json({ success: true, token: 'admin_token_secure_xyz123' });
    } else {
      return NextResponse.json({ success: false, error: 'Credenziali errate' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }
}
