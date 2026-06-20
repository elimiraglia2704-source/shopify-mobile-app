export const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'elisee.shop';
export const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_TOKEN || 'fd3d51862812c1f0c530dc83ac3f6685';
export const API_VERSION = '2024-04';

export async function queryStorefront(query: string, variables: any = {}) {
  const endpoint = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    // In Next.js 15, we can use next.revalidate or standard cache
    next: { revalidate: 3600 } // Cache results for 1 hour by default
  });

  if (!response.ok) {
    throw new Error(`Shopify API Error: ${response.status}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: any) => e.message).join(', '));
  }

  return json.data;
}

export async function getProducts(limit = 250, afterCursor: string | null = null) {
  const query = `
    query getProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const variables: any = { first: limit };
    if (afterCursor) variables.after = afterCursor;
    const data = await queryStorefront(query, variables);
    return { 
      products: data.products.edges.map((edge: any) => edge.node), 
      pageInfo: data.products.pageInfo 
    };
  } catch (error) {
    console.error("Shopify getProducts failed:", error);
    return { products: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }
}

export async function getCollections() {
  const query = `
    query getCollections {
      collections(first: 250) {
        edges {
          node {
            id
            title
            handle
            description
          }
        }
      }
    }
  `;
  try {
    const data = await queryStorefront(query);
    return data.collections.edges.map((edge: any) => edge.node);
  } catch (error) {
    console.error("Shopify getCollections failed:", error);
    return [];
  }
}
