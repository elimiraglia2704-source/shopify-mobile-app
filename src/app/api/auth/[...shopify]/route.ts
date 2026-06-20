import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';

// Load env variables (ensure they exist in .env.example)
const API_KEY = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '';
const API_SECRET = process.env.NEXT_PUBLIC_SHOPIFY_API_SECRET || '';
const SCOPES = process.env.NEXT_PUBLIC_SHOPIFY_SCOPES || 'read_products,write_products';
const HOST = process.env.NEXT_PUBLIC_SHOPIFY_HOST || '';

// Helper to generate nonce for state
function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Helper to verify HMAC from Shopify
function verifyHmac(query: URLSearchParams): boolean {
  const hmac = query.get('hmac') ?? '';
  const map = new Map<string, string>();
  query.forEach((value, key) => {
    if (key !== 'hmac' && key !== 'signature' && key !== 'host') {
      map.set(key, value);
    }
  });
  const message = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const digest = crypto
    .createHmac('sha256', API_SECRET)
    .update(message)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

/**
 * Route handler for Shopify OAuth flow.
 * URL pattern: /api/auth/[...shopify]
 * Supports three actions via query param `shop` and `code`:
 *   - install:   GET with `shop` – redirects merchant to Shopify install screen.
 *   - callback:  GET with `shop`, `code`, `hmac`, `state` – verifies HMAC and exchanges code for access token.
 *   - token:    POST (optional) – can be used for server‑to‑server calls.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const hmac = searchParams.get('hmac');

  // STEP 1 – INSTALL REDIRECT
  if (shop && !code) {
    // Generate a nonce to protect CSRF
    const nonce = generateNonce();
    // Store nonce in a cookie (httpOnly, sameSite)
    const redirectUrl = new URL(`https://${shop}/admin/oauth/authorize`);
    redirectUrl.searchParams.set('client_id', API_KEY);
    redirectUrl.searchParams.set('scope', SCOPES);
    redirectUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`);
    redirectUrl.searchParams.set('state', nonce);
    redirectUrl.searchParams.set('grant_options[]', 'per-user');

    const response = NextResponse.redirect(redirectUrl.toString());
    response.cookies.set('shopify_oauth_nonce', nonce, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
    return response;
  }

  // STEP 2 – CALLBACK (exchange code for token)
  if (shop && code && hmac && state) {
    // Verify state/nonce
    const storedNonce = request.cookies.get('shopify_oauth_nonce')?.value;
    if (!storedNonce || storedNonce !== state) {
      return new NextResponse('Invalid OAuth state', { status: 400 });
    }
    // Verify request signature
    if (!verifyHmac(searchParams)) {
      return new NextResponse('Invalid HMAC', { status: 400 });
    }
    // Exchange code for permanent access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: API_KEY,
        client_secret: API_SECRET,
        code,
      }),
    });
    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      return new NextResponse(`Token exchange failed: ${err}`, { status: 500 });
    }
    const data = await tokenResponse.json();
    // Store token securely – for demo we set a httpOnly cookie (replace with DB in prod)
    const resp = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);
    resp.cookies.set('shopify_access_token', data.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    resp.cookies.set('shopify_shop', shop, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
    return resp;
  }

  // Fallback – no recognized params
  return new NextResponse('Invalid OAuth request', { status: 400 });
}

// Optional POST handler for server‑to‑server calls (e.g., webhooks verification)
export async function POST(request: NextRequest) {
  return new NextResponse('POST not implemented for OAuth route', { status: 405 });
}
