const https = require('https');

const token = 'fd3d51862812c1f0c530dc83ac3f6685';
const data = JSON.stringify({ query: '{ products(first: 1) { edges { node { title } } } }' });

const options = {
  hostname: '23.227.38.74',
  port: 443,
  path: '/api/2024-04/graphql.json',
  method: 'POST',
  headers: {
    'Host': 'eliseebrand.myshopify.com',
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
