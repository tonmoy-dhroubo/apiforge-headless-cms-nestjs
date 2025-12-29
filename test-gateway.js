const http = require('http');

const data = JSON.stringify({
  username: 'testuser2',
  email: 'test2@example.com',
  password: 'Test123!@#'
});

const options = {
  hostname: 'localhost',
  port: 8080, // Through gateway
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 30000
};

console.log('Testing through gateway...');
const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.on('timeout', () => {
  console.error('Request timeout!');
  req.destroy();
});

req.write(data);
req.end();

