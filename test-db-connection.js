// Test database connection directly
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres';

console.log('Testing database connection...');
console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@'));
console.log('');

const client = new Client({
  connectionString: connectionString,
  ssl: false // Try without SSL first
});

client.connect()
  .then(() => {
    console.log('✅ Connection successful!');
    return client.query('SELECT NOW()');
  })
  .then((result) => {
    console.log('✅ Database query successful:', result.rows[0]);
    client.end();
    console.log('\nThe connection string is correct. Prisma should work now.');
  })
  .catch((err) => {
    console.log('❌ Connection failed:', err.message);
    console.log('\nPossible issues:');
    console.log('1. Password is incorrect');
    console.log('2. Username format is wrong');
    console.log('3. Network/firewall blocking connection');
    console.log('\nNext steps:');
    console.log('1. Verify password in Supabase dashboard');
    console.log('2. Get the exact connection string from dashboard');
    console.log('3. Check if database is paused/sleeping');
    client.end();
    process.exit(1);
  });

