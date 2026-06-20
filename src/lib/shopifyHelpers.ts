import crypto from 'crypto';
import { URLSearchParams } from 'url';
// No external type imports needed

/**
 * Delete a stored Shopify access token for a given shop.
 * This implementation assumes tokens are stored in a simple in‑memory map or
 * a cookie store. Replace the placeholder logic with your actual persistence
 * mechanism (e.g., Redis, database, or encrypted cookies).
 */
export async function deleteShopifyToken(shop: string): Promise<void> {
  // Placeholder: remove token from a hypothetical token store
  // TODO: integrate with real token storage solution
  console.log(`[Shopify] Deleting token for shop: ${shop}`);
  // Example using a simple JSON file (not recommended for production)
  // const tokenPath = path.join(process.cwd(), 'tokens.json');
  // const tokens = JSON.parse(await fs.promises.readFile(tokenPath, 'utf8'));
  // delete tokens[shop];
  // await fs.promises.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
}

/**
 * Verify Shopify HMAC signature of a request query string.
 * Accepts the raw query string (e.g., url.searchParams.toString())
 * Returns true if the signature matches, false otherwise.
 */
export function verifyHmac(queryString: string): boolean {
  const params = new URLSearchParams(queryString);
  const hmac = params.get('hmac');
  if (!hmac) return false;
  // Remove hmac from the params before building the message
  params.delete('hmac');
  // Sort params alphabetically and concatenate key=value pairs
  const sorted = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  const message = sorted.map(([k, v]) => `${k}=${v}`).join('&');
  const secret = process.env.SHOPIFY_API_SECRET || '';
  const digest = crypto.createHmac('sha256', secret).update(message).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

/**
 * Generate the Shopify OAuth installation URL.
 * Uses environment variables SHOPIFY_API_KEY, SHOPIFY_API_SCOPES, SHOPIFY_APP_URL.
 */
export async function getShopifyAccessToken(shop: string, code: string): Promise<string> {
  const url = `https://${shop}/admin/oauth/access_token`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });
  const data = await response.json();
  return data.access_token;
}

export function getShopifyAuthUrl(shop: string): string {
  const clientId = process.env.SHOPIFY_API_KEY;
  const scopes = process.env.SHOPIFY_API_SCOPES?.split(',').join(',') || '';
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/callback`;
  const params = new URLSearchParams({
    client_id: clientId || '',
    scope: scopes,
    redirect_uri: redirectUri,
    state: crypto.randomBytes(12).toString('hex'),
    'grant_options[]': 'per-user',
  });
  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}
