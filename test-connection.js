// Test connection string formats
const dbUrl1 = 'postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres';
const dbUrl2 = 'postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres';

console.log('Testing connection string formats...');
console.log('\nFormat 1 (postgres):');
console.log(dbUrl1.replace(/:[^:@]+@/, ':****@'));
console.log('\nFormat 2 (postgres.kwhnrlzibgfedtxpkbgb):');
console.log(dbUrl2.replace(/:[^:@]+@/, ':****@'));

const fs = require('fs');
const path = require('path');

// Try format 1 first
const envPath = path.join(__dirname, '.env');
let content = fs.readFileSync(envPath, 'utf8');
content = content.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${dbUrl1}"`);
fs.writeFileSync(envPath, content);

console.log('\n✅ Updated .env with format 1 (postgres)');
console.log('\nTry running: npm run db:push');
console.log('\nIf that fails, we\'ll try format 2 or check IP restrictions.');

