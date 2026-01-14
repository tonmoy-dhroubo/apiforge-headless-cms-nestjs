const http = require('http');

const requestBody = JSON.stringify({
  username: 'testuser2',
  email: 'test2@example.com',
  password: 'Test123!@#'
});

const options = {
  hostname: 'localhost',
  port: 7080,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': requestBody.length
  },
  timeout: 30000
};

console.log('Testing through gateway...');
const req = http.request(options, (response) => {
  console.log(`Status: ${response.statusCode}`);
  
  let responseBody = '';
  response.on('data', (chunk) => {
    responseBody += chunk;
  });
  
  response.on('end', () => {
    console.log('Response:', responseBody);
  });
});

req.on('error', (error) => {
  console.error('Gateway request failed:', error.message);
});

req.on('timeout', () => {
  console.error(
    `Gateway request to ${options.path} timed out after ${options.timeout}ms.`,
  );
  req.destroy();
});

req.write(requestBody);
req.end();
