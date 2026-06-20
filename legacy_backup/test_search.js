const domain = 'elisee.shop';
const token = 'fd3d51862812c1f0c530dc83ac3f6685';

async function test() {
  const query = `
      query searchProducts($first: Int!, $query: String!) {
        products(first: $first, query: $query) {
          edges {
            node {
              id
              title
              description
              vendor
              availableForSale
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              options {
                name
                values
              }
              collections(first: 5) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
  const variables = { first: 5, query: "Brasile" };
  const res = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query, variables })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
