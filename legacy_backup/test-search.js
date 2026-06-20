const q = `
  query searchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          title
        }
      }
    }
  }
`;
fetch('https://elisee.shop/api/2024-04/graphql.json', { 
  method: 'POST', 
  headers: { 
    'Content-Type': 'application/json', 
    'X-Shopify-Storefront-Access-Token': 'fd3d51862812c1f0c530dc83ac3f6685' 
  }, 
  body: JSON.stringify({ query: q, variables: { query: 'Italia', first: 250 } }) 
})
.then(r => r.json())
.then(d => {
  const titles = d.data.products.edges.map(e => e.node.title);
  const italia = titles.filter(t => t.toLowerCase().includes('italia'));
  console.log("Totale risultati Italia senza filtro:", titles.length);
  console.log("Di cui con 'Italia' nel titolo:", italia.length);
});

fetch('https://elisee.shop/api/2024-04/graphql.json', { 
  method: 'POST', 
  headers: { 
    'Content-Type': 'application/json', 
    'X-Shopify-Storefront-Access-Token': 'fd3d51862812c1f0c530dc83ac3f6685' 
  }, 
  body: JSON.stringify({ query: q, variables: { query: '*Italia* OR title:*Italia*', first: 250 } }) 
})
.then(r => r.json())
.then(d => {
  const titles = d.data.products.edges.map(e => e.node.title);
  const italia = titles.filter(t => t.toLowerCase().includes('italia'));
  console.log("Risultati query combinata:", titles.length);
  console.log("Di cui con 'Italia' nel titolo:", italia.length);
})
.catch(console.error);
