// Fix connection string with SSL requirement
const fs = require('fs');
const path = require('path');

// Try with SSL requirement and simpler username format
const dbUrl1 = 'postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres?sslmode=require';
const dbUrl2 = 'postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres?sslmode=require';

const envPath = path.join(__dirname, '.env');

// Try format 1 first (simple postgres username)
let content = fs.readFileSync(envPath, 'utf8');
content = content.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${dbUrl1}"`);
fs.writeFileSync(envPath, content);

console.log('✅ Updated connection string with SSL requirement');
console.log('Using username: postgres (simple format)');
console.log('Added: ?sslmode=require');
console.log('\nTry running: npm run db:push');
console.log('\nIf this fails, we\'ll try the other username format.');

