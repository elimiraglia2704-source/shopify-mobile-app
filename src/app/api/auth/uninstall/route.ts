import { NextResponse } from 'next/server';
import { deleteShopifyToken } from '@/lib/shopify'; // you may need to implement this helper

// Shopify will call this endpoint when the merchant uninstalls the app.
export async function POST(request: Request) {
  const url = new URL(request.url);
  const { shop } = Object.fromEntries(url.searchParams.entries());

  // Optionally clean up stored tokens (if you persist them server‑side)
  await deleteShopifyToken(shop as string);

  // Clear cookies set during install
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('shopify_shop');
  response.cookies.delete('shopify_token');
  response.cookies.delete('shopify_host');
  return response;
}
