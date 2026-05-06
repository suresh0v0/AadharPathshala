import https from 'https';

const options = {
  hostname: 'api.sambanova.ai',
  port: 443,
  path: '/v1/models',
  method: 'GET',
  headers: {
    'Origin': 'https://example.com'
  }
};

const req = https.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', (e) => {
  console.error('ERROR:', e.message);
});
req.end();
