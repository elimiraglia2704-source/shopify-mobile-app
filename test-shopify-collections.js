const domain = 'elisee.shop';
const token = 'fd3d51862812c1f0c530dc83ac3f6685';

async function query(gql) {
  const res = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query: gql })
  });
  const json = await res.json();
  return json.data;
}

async function run() {
  try {
    console.log("=== COLLEGAMENTO A SHOPIFY ===");
    const collectionsGql = `{
      collections(first: 50) {
        edges {
          node {
            id
            title
            handle
            products(first: 20) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }`;
    const data = await query(collectionsGql);
    const collections = data.collections.edges.map(e => e.node);
    
    console.log(`Trovate ${collections.length} collezioni:`);
    collections.forEach(col => {
      console.log(`- Collezione: "${col.title}" (handle: ${col.handle}, ID: ${col.id})`);
      const prodTitles = col.products.edges.map(pe => pe.node.title);
      console.log(`  Prodotti (${prodTitles.length}): ${prodTitles.join(', ')}`);
    });
  } catch (err) {
    console.error("Errore:", err);
  }
}
run();
