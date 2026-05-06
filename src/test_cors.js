const http = require('https');
const options = {
  hostname: 'api.sambanova.ai',
  port: 443,
  path: '/v1/chat/completions',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'POST'
  }
};
const req = http.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
});
req.on('error', (e) => {
  console.error(e);
});
req.end();
