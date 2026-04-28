const https = require('https');
https.get('https://tmtemlfrtulsflzlbnad.supabase.co/rest/v1/', (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
}).on('error', e => console.error(e));
