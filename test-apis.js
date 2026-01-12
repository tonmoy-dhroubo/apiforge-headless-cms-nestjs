const http = require('http');
const fs = require('fs');

const GATEWAY_URL = 'http://localhost:7080';
const LOG_FILE = 'api-test-results.log';

function makeRequest(method, url, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const dataString = data ? JSON.stringify(data) : '';
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        ...headers
      }
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(dataString);
    }
    req.end();
  });
}

function waitForService(url, maxAttempts = 60, delay = 2000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      log(`   Attempt ${attempts}/${maxAttempts}...`);
      const req = http.get(url, (res) => {
        log(`   Service is ready! Status: ${res.statusCode}`);
        resolve(true);
      });
      req.on('error', (err) => {
        if (attempts >= maxAttempts) {
          reject(new Error(`Service at ${url} not available after ${maxAttempts} attempts. Error: ${err.message}`));
        } else {
          setTimeout(check, delay);
        }
      });
      req.setTimeout(3000, () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          reject(new Error(`Service at ${url} not available after ${maxAttempts} attempts (timeout)`));
        } else {
          setTimeout(check, delay);
        }
      });
    };
    check();
  });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage);
}

async function testAuth() {
  log('\n=== Testing Auth Service ===');
  
  try {
    log('1. Testing POST /api/auth/register');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!@#'
    };
    const registerRes = await makeRequest('POST', `${GATEWAY_URL}/api/auth/register`, registerData);
    log(`   Status: ${registerRes.status}`);
    log(`   Response: ${JSON.stringify(registerRes.data, null, 2)}`);
    
    log('\n2. Testing POST /api/auth/login');
    const loginData = {
      username: 'testuser',
      password: 'Test123!@#'
    };
    const loginRes = await makeRequest('POST', `${GATEWAY_URL}/api/auth/login`, loginData);
    log(`   Status: ${loginRes.status}`);
    log(`   Response: ${JSON.stringify(loginRes.data, null, 2)}`);
    
    log('\n3. Testing GET /api/auth/users');
    const usersRes = await makeRequest('GET', `${GATEWAY_URL}/api/auth/users`);
    log(`   Status: ${usersRes.status}`);
    log(`   Response: ${JSON.stringify(usersRes.data, null, 2)}`);
    
    return loginRes.data?.data?.token || null;
  } catch (error) {
    log(`   ERROR: ${error.message}`);
    return null;
  }
}

async function testContentType() {
  log('\n=== Testing Content-Type Service ===');
  
  try {
    log('1. Testing POST /api/content-types');
    const contentTypeData = {
      name: 'Blog Post',
      pluralName: 'Blog Posts',
      apiId: 'blog-post',
      description: 'A blog post content type',
      fields: [
        { name: 'title', fieldName: 'title', type: 'string', required: true },
        { name: 'content', fieldName: 'content', type: 'text', required: true },
        { name: 'author', fieldName: 'author', type: 'string', required: false },
        { name: 'published', fieldName: 'published', type: 'boolean', required: false }
      ]
    };
    const createRes = await makeRequest('POST', `${GATEWAY_URL}/api/content-types`, contentTypeData);
    log(`   Status: ${createRes.status}`);
    log(`   Response: ${JSON.stringify(createRes.data, null, 2)}`);
    
    log('\n2. Testing GET /api/content-types');
    const getAllRes = await makeRequest('GET', `${GATEWAY_URL}/api/content-types`);
    log(`   Status: ${getAllRes.status}`);
    log(`   Response: ${JSON.stringify(getAllRes.data, null, 2)}`);
    
    log('\n3. Testing GET /api/content-types/api-id/blog-post');
    const getByIdRes = await makeRequest('GET', `${GATEWAY_URL}/api/content-types/api-id/blog-post`);
    log(`   Status: ${getByIdRes.status}`);
    log(`   Response: ${JSON.stringify(getByIdRes.data, null, 2)}`);
    
    return 'blog-post';
  } catch (error) {
    log(`   ERROR: ${error.message}`);
    return null;
  }
}

async function testContent(apiId) {
  log('\n=== Testing Content Service ===');
  
  if (!apiId) {
    log('   SKIPPED: No API ID available');
    return null;
  }
  
  try {
    log(`1. Testing POST /api/content/${apiId}`);
    const contentData = {
      title: 'My First Blog Post',
      content: 'This is the content of my first blog post. It contains some interesting information.',
      author: 'John Doe',
      published: true
    };
    const createRes = await makeRequest('POST', `${GATEWAY_URL}/api/content/${apiId}`, contentData);
    log(`   Status: ${createRes.status}`);
    log(`   Response: ${JSON.stringify(createRes.data, null, 2)}`);
    const contentId = createRes.data?.data?.id;
    
    log(`\n2. Testing GET /api/content/${apiId}`);
    const getAllRes = await makeRequest('GET', `${GATEWAY_URL}/api/content/${apiId}`);
    log(`   Status: ${getAllRes.status}`);
    log(`   Response: ${JSON.stringify(getAllRes.data, null, 2)}`);
    
    if (contentId) {
      log(`\n3. Testing GET /api/content/${apiId}/${contentId}`);
      const getOneRes = await makeRequest('GET', `${GATEWAY_URL}/api/content/${apiId}/${contentId}`);
      log(`   Status: ${getOneRes.status}`);
      log(`   Response: ${JSON.stringify(getOneRes.data, null, 2)}`);
      
      log(`\n4. Testing PUT /api/content/${apiId}/${contentId}`);
      const updateData = {
        title: 'My Updated Blog Post',
        content: 'This is the updated content.',
        author: 'Jane Doe',
        published: true
      };
      const updateRes = await makeRequest('PUT', `${GATEWAY_URL}/api/content/${apiId}/${contentId}`, updateData);
      log(`   Status: ${updateRes.status}`);
      log(`   Response: ${JSON.stringify(updateRes.data, null, 2)}`);
      
      log(`\n5. Testing POST /api/content/${apiId}/search`);
      const searchData = {
        filters: {
          published: true
        }
      };
      const searchRes = await makeRequest('POST', `${GATEWAY_URL}/api/content/${apiId}/search`, searchData);
      log(`   Status: ${searchRes.status}`);
      log(`   Response: ${JSON.stringify(searchRes.data, null, 2)}`);
      
      log(`\n6. Testing DELETE /api/content/${apiId}/${contentId}`);
      const deleteRes = await makeRequest('DELETE', `${GATEWAY_URL}/api/content/${apiId}/${contentId}`);
      log(`   Status: ${deleteRes.status}`);
      log(`   Response: ${JSON.stringify(deleteRes.data, null, 2)}`);
    }
    
    return contentId;
  } catch (error) {
    log(`   ERROR: ${error.message}`);
    return null;
  }
}

async function testMedia() {
  log('\n=== Testing Media Service ===');
  
  try {
    log('1. Testing GET /api/media');
    const getAllRes = await makeRequest('GET', `${GATEWAY_URL}/api/media`);
    log(`   Status: ${getAllRes.status}`);
    log(`   Response: ${JSON.stringify(getAllRes.data, null, 2)}`);
    
    log('\n2. Testing POST /api/media/upload - SKIPPED (requires file upload)');
    log('   Note: File upload requires multipart/form-data handling');
    
    return true;
  } catch (error) {
    log(`   ERROR: ${error.message}`);
    return false;
  }
}

async function testPermissions() {
  log('\n=== Testing Permission Service ===');
  
  try {
    log('1. Testing POST /api/permissions/api');
    const apiPermissionData = {
      contentTypeApiId: 'blog-post',
      endpoint: '/api/content/blog-post',
      method: 'GET',
      allowedRoles: ['admin', 'user']
    };
    const apiPermRes = await makeRequest('POST', `${GATEWAY_URL}/api/permissions/api`, apiPermissionData);
    log(`   Status: ${apiPermRes.status}`);
    log(`   Response: ${JSON.stringify(apiPermRes.data, null, 2)}`);
    
    log('\n2. Testing POST /api/permissions/content');
    const contentPermissionData = {
      contentTypeApiId: 'blog-post',
      action: 'read',
      allowedRoles: ['admin']
    };
    const contentPermRes = await makeRequest('POST', `${GATEWAY_URL}/api/permissions/content`, contentPermissionData);
    log(`   Status: ${contentPermRes.status}`);
    log(`   Response: ${JSON.stringify(contentPermRes.data, null, 2)}`);
    
    log('\n3. Testing POST /api/permissions/api/check');
    const checkData = {
      contentTypeApiId: 'blog-post',
      endpoint: '/api/content/blog-post',
      method: 'GET',
      userRoles: ['user']
    };
    const checkRes = await makeRequest('POST', `${GATEWAY_URL}/api/permissions/api/check`, checkData);
    log(`   Status: ${checkRes.status}`);
    log(`   Response: ${JSON.stringify(checkRes.data, null, 2)}`);
    
    return true;
  } catch (error) {
    log(`   ERROR: ${error.message}`);
    return false;
  }
}

async function runTests() {
  fs.writeFileSync(LOG_FILE, '');
  log('=== API Test Results ===');
  log(`Started at: ${new Date().toISOString()}\n`);
  
  try {
    log('Waiting for Gateway service to be ready...');
    await waitForService(GATEWAY_URL, 30, 2000);
    log('Gateway is ready!\n');
    
    const token = await testAuth();
    const apiId = await testContentType();
    await testContent(apiId);
    await testMedia();
    await testPermissions();
    
    log('\n=== Test Summary ===');
    log(`Completed at: ${new Date().toISOString()}`);
    log(`Results logged to: ${LOG_FILE}`);
  } catch (error) {
    log(`\nFATAL ERROR: ${error.message}`);
    log(`Stack: ${error.stack}`);
  }
}

runTests().catch(console.error);
