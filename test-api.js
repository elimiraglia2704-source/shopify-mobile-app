const query = `
  query getProducts {
    products(first: 5) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

async function test() {
  const response = await fetch("https://eliseebrand.myshopify.com/api/2024-04/graphql.json", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': 'fd3d51862812c1f0c530dc83ac3f6685'
    },
    body: JSON.stringify({ query })
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
