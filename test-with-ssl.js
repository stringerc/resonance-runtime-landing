// Test connection with SSL requirement
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres?sslmode=require';

console.log('Testing connection with SSL requirement...');
console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@'));
console.log('');

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // For Supabase self-signed certs
  }
});

client.connect()
  .then(() => {
    console.log('✅ Connection successful with SSL!');
    return client.query('SELECT NOW()');
  })
  .then((result) => {
    console.log('✅ Database query successful:', result.rows[0]);
    client.end();
    console.log('\n✅ The connection works! Updating .env files...');
    
    // Update .env files
    const fs = require('fs');
    const path = require('path');
    
    const dbUrl = 'postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres?sslmode=require';
    
    const envPath = path.join(__dirname, '.env');
    let content = fs.readFileSync(envPath, 'utf8');
    content = content.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${dbUrl}"`);
    fs.writeFileSync(envPath, content);
    
    const envLocalPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envLocalPath)) {
      let contentLocal = fs.readFileSync(envLocalPath, 'utf8');
      contentLocal = contentLocal.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${dbUrl}"`);
      fs.writeFileSync(envLocalPath, contentLocal);
    }
    
    console.log('✅ Updated .env and .env.local with SSL connection string');
    console.log('\nNow try: npm run db:push');
  })
  .catch((err) => {
    console.log('❌ Connection failed:', err.message);
    console.log('\nError details:', err.code);
    client.end();
    process.exit(1);
  });

