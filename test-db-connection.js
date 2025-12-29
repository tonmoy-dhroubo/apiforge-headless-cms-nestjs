const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_zTGZnwE5qDQ6@ep-lingering-rain-ahbp23u9-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('✓ Connected successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✓ Query successful:', result.rows[0]);
    
    // Check if tables exist
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

