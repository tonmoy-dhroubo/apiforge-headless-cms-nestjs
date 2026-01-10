const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const contents = fs.readFileSync(envPath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
    const [key, ...rest] = trimmed.split('=');
    const value = rest.join('=').replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required in the environment or .env file.');
}

async function testConnection() {
  const sslServerName = process.env.DATABASE_SSL_SERVERNAME;
  const url = new URL(connectionString);
  const client = new Client({
    host: url.hostname,
    port: parseInt(url.port, 10) || 5432,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: {
      rejectUnauthorized: false,
      ...(sslServerName ? { servername: sslServerName } : {})
    },
    family: 4
  });

  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('✓ Connected successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✓ Query successful:', result.rows[0]);
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\nExisting tables:');
    tables.rows.forEach(row => console.log('  -', row.table_name));
    
    await client.end();
    console.log('\n✓ Connection closed successfully');
  } catch (error) {
    console.error('✗ Database connection error:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    if (error.stack) {
      console.error('  Stack:', error.stack);
    }
    process.exit(1);
  }
}

testConnection();
