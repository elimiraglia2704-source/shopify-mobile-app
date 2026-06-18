const https = require('https');

const domain = 'eliseebrand.myshopify.com';
const token = 'fd3d51862812c1f0c530dc83ac3f6685';
const apiVersion = '2024-04';

const query = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        message
      }
    }
  }
`;

const postData = JSON.stringify({
  query,
  variables: {
    input: {
      firstName: "Test",
      lastName: "Test",
      email: "test_new123@example.com",
      password: "password123!"
    }
  }
});

const options = {
  hostname: domain,
  path: `/api/${apiVersion}/graphql.json`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
