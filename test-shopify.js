const domain = 'eliseeshop.myshopify.com';
const token = 'fd3d51862812c1f0c530dc83ac3f6685';

async function test() {
  try {
    const query = `{ products(first: 5) { edges { node { title } } } }`;
    const res = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
      body: JSON.stringify({ query })
    });
    const text = await res.text();
    console.log("HTTP Status:", res.status);
    console.log("Response:", text);
  } catch(e) {
    console.error("Fetch failed:", e);
  }
}
test();
