// Update with simple username format (postgres instead of postgres.kwhnrlzibgfedtxpkbgb)
const fs = require('fs');
const path = require('path');

// Use simple 'postgres' username as shown in user's original connection string
const dbUrl = 'postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres';

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

console.log('✅ Updated connection string with simple username format');
console.log('Username: postgres (as in your original connection string)');
console.log('Port: 5432 (direct connection)');
console.log('\nTry running: npm run db:push');
console.log('\nIf this still fails, the password might need to be reset in Supabase dashboard.');

