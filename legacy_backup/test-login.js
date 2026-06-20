
const domain = 'eliseebrand.myshopify.com';
const token = 'fd3d51862812c1f0c530dc83ac3f6685';
const apiVersion = '2024-04';

const query = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        message
      }
    }
  }
`;

fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token
  },
  body: JSON.stringify({
    query,
    variables: { input: { email: 'eliseomiraglia2704@gmail.com', password: 'Password123!' } }
  })
}).then(r => r.json()).then(json => {
  console.log(JSON.stringify(json, null, 2));
}).catch(console.error);
