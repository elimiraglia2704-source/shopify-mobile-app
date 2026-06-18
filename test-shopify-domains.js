const token = 'fd3d51862812c1f0c530dc83ac3f6685';
const domains = ['eliseeshop.myshopify.com', 'elisee.myshopify.com', 'elisee-brand.myshopify.com', 'elisee-shop.myshopify.com'];

async function test() {
  const query = `{ products(first: 1) { edges { node { title } } } }`;
  for (const domain of domains) {
    try {
      const res = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
        body: JSON.stringify({ query })
      });
      console.log(`[${domain}] HTTP Status: ${res.status}`);
      if (res.status === 200) {
          const text = await res.text();
          console.log(`[${domain}] Success: ${text.substring(0, 100)}`);
      }
    } catch(e) {
      console.error(`[${domain}] Fetch failed: ${e.message}`);
    }
  }
}
test();
