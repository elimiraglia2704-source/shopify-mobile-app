import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const shopDomain  = payload.shopDomain  || 'eliseebrand.myshopify.com';
    const accessToken = payload.accessToken || 'fd3d51862812c1f0c530dc83ac3f6685';
    const apiVersion  = payload.apiVersion  || '2024-04';
    const graphql     = payload.query       || '';
    const variables   = payload.variables   || {};

    const shopifyResponse = await fetch(`https://${shopDomain}/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': accessToken,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: graphql, variables }),
    });

    const data = await shopifyResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Proxy error:', error.message);
    return NextResponse.json({ error: 'Proxy request failed', detail: error.message }, { status: 502 });
  }
}
