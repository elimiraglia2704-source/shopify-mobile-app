import { NextResponse, NextRequest } from 'next/server';
import { getShopifyAuthUrl, verifyHmac, getShopifyAccessToken } from '@/lib/shopify';

// Shopify will redirect here after the merchant approves the app installation.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { shop, hmac, code, state, host } = Object.fromEntries(url.searchParams.entries());

  // Verify the request is from Shopify
  if (!verifyHmac(url.searchParams.toString())) {
    return new NextResponse('Invalid HMAC', { status: 400 });
  }

  // Exchange the temporary code for a permanent access token
  const accessToken = await getShopifyAccessToken(shop as string, code as string);

  // Set cookies for later API calls
  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`);
  response.cookies.set('shopify_shop', shop as string, { httpOnly: true, path: '/' });
  response.cookies.set('shopify_token', accessToken, { httpOnly: true, path: '/' });
  response.cookies.set('shopify_host', host as string, { httpOnly: true, path: '/' });

  return response;
}
