const http = require('http');

const requestBody = JSON.stringify({
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
    'Content-Length': requestBody.length
  },
  timeout: 30000
};

console.log('Sending request to auth service...');
const req = http.request(options, (response) => {
  console.log(`Status: ${response.statusCode}`);
  console.log(`Headers:`, response.headers);
  
  let responseBody = '';
  response.on('data', (chunk) => {
    responseBody += chunk;
  });
  
  response.on('end', () => {
    console.log('Response:', responseBody);
    try {
      const parsed = JSON.parse(responseBody);
      console.log('Parsed:', JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.log('Response was not valid JSON:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Auth request failed:', error.message);
});

req.on('timeout', () => {
  console.error(
    `Auth request to ${options.path} timed out after ${options.timeout}ms.`,
  );
  req.destroy();
});

req.write(requestBody);
req.end();
