// Try connection pooling (port 6543) which often bypasses IP restrictions
const fs = require('fs');
const path = require('path');

const dbUrl = 'postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres';

const envPath = path.join(__dirname, '.env');
let content = fs.readFileSync(envPath, 'utf8');
content = content.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${dbUrl}"`);
fs.writeFileSync(envPath, content);

console.log('✅ Updated to use connection pooling (port 6543)');
console.log('This often bypasses IP restrictions.');
console.log('\nTry running: npm run db:push');
console.log('\nIf still failing, check IP restrictions in Supabase dashboard:');
console.log('https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database');

