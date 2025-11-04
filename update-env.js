// Script to update .env.local and .env with DATABASE_URL
const fs = require('fs');
const path = require('path');

const dbUrl = 'postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres';

// Update .env.local (for Next.js)
const envLocalPath = path.join(__dirname, '.env.local');
let contentLocal = '';
if (fs.existsSync(envLocalPath)) {
  contentLocal = fs.readFileSync(envLocalPath, 'utf8');
}

if (contentLocal.includes('DATABASE_URL=')) {
  contentLocal = contentLocal.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${dbUrl}"`);
} else {
  contentLocal += `\nDATABASE_URL="${dbUrl}"\n`;
}

fs.writeFileSync(envLocalPath, contentLocal);
console.log('✅ DATABASE_URL updated in .env.local');

// Update .env (for Prisma)
const envPath = path.join(__dirname, '.env');
let content = '';
if (fs.existsSync(envPath)) {
  content = fs.readFileSync(envPath, 'utf8');
}

if (content.includes('DATABASE_URL=')) {
  content = content.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${dbUrl}"`);
} else {
  content += `\nDATABASE_URL="${dbUrl}"\n`;
}

fs.writeFileSync(envPath, content);
console.log('✅ DATABASE_URL updated in .env');

console.log('\n📊 Now you can run: npm run db:push');
