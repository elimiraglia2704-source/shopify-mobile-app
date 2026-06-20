
const domain = 'eliseebrand.myshopify.com';
const token = 'fd3d51862812c1f0c530dc83ac3f6685';
const apiVersion = '2024-04';

async function queryStorefront(query, variables = {}) {
  const response = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

async function run() {
  const email = `test-${Date.now()}@test.com`;
  const password = "Password123!";
  
  console.log("1. Creating customer:", email);
  const createMutation = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer { id email }
          customerUserErrors { message }
        }
      }
    `;
  const createRes = await queryStorefront(createMutation, { input: { email, password, firstName: "Test", lastName: "User" } });
  console.log("Create result:", JSON.stringify(createRes, null, 2));

  console.log("2. Attempting login immediately...");
  const loginMutation = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken { accessToken expiresAt }
          customerUserErrors { message code }
        }
      }
    `;
  const loginRes = await queryStorefront(loginMutation, { input: { email, password } });
  console.log("Login result:", JSON.stringify(loginRes, null, 2));
}

run().catch(console.error);
