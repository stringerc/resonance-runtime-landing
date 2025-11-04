// Fix connection string with correct format from Supabase MCP
const fs = require('fs');
const path = require('path');

// Correct format based on Supabase MCP response:
// postgres://postgres:[PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres
const dbUrl = 'postgres://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres';

console.log('🔧 Updating connection string with correct format from Supabase...');
console.log('Format: postgres://postgres:[PASSWORD]@host:6543/postgres');
console.log('');

const envPath = path.join(__dirname, '.env');
let content = fs.readFileSync(envPath, 'utf8');
content = content.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${dbUrl}"`);
fs.writeFileSync(envPath, content);
console.log('✅ Updated .env');

const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  let contentLocal = fs.readFileSync(envLocalPath, 'utf8');
  contentLocal = contentLocal.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${dbUrl}"`);
  fs.writeFileSync(envLocalPath, contentLocal);
  console.log('✅ Updated .env.local');
}

console.log('');
console.log('📊 Database Status (from Supabase MCP):');
console.log('   ✅ Status: ACTIVE_HEALTHY');
console.log('   ✅ Read-only: false');
console.log('   ✅ DB Service: healthy');
console.log('   ✅ Pooler Service: healthy');
console.log('');
console.log('🚀 Now try: npm run db:push');

