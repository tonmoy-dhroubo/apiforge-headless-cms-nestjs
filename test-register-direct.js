const http = require('http');

const data = JSON.stringify({
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123!@#'
});

const options = {
  hostname: 'localhost',
  port: 7081,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 30000
};

console.log('Sending request to auth service...');
const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', body);
    try {
      const parsed = JSON.parse(body);
      console.log('Parsed:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Could not parse as JSON');
    }
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
