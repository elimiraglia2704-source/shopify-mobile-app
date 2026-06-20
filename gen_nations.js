const domain = 'elisee.shop';
const token = 'fd3d51862812c1f0c530dc83ac3f6685';

async function test() {
  const query = `{
    collections(first: 250) {
      edges {
        node {
          title
          image {
            url
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
  const collections = data.data.collections.edges.map(e => e.node);
  
  const targetNames = ['Polonia', 'Danimarca', 'Irlanda', 'Messico', 'USA', 'Brasile', 'Francia', 'Italia'];
  
  targetNames.forEach(name => {
    const coll = collections.find(c => c.title.toLowerCase() === name.toLowerCase());
    if (coll) {
      console.log(`Found collection for ${name}: ${coll.image?.url}`);
    } else {
      console.log(`NO collection for ${name}`);
    }
  });
}
test();
