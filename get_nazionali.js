const domain = 'elisee.shop';
const token = 'fd3d51862812c1f0c530dc83ac3f6685';

async function test() {
  const query = `{
    collections(first: 1, query: "title:'COVER NAZIONALI'") {
      edges {
        node {
          products(first: 250) {
            edges {
              node {
                title
              }
            }
          }
        }
      }
    }
  }`;
  const res = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  const products = data.data.collections.edges[0].node.products.edges.map(e => e.node.title);
  
  const countries = new Set();
  products.forEach(title => {
    // Es. "Cover Messico Home 2026..." -> "Messico"
    // "Cover iPhone rigida Arabia Saudita Goalkeeper 2026" -> "Arabia Saudita"
    let match = title.match(/Cover (?:iPhone rigida )?([a-zA-Z\s]+) (?:Home|Away|Goalkeeper|Third)/i);
    if (match) {
      countries.add(match[1].trim());
    }
  });
  console.log("Nazioni:", Array.from(countries));
}
test();
