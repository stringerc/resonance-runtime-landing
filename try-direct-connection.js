/**
 * Try direct connection (port 5432) instead of pooler
 * Prisma works better with direct connections
 */

const fs = require('fs');
const path = require('path');

const newPassword = 'Hnzpf3Ywz3KvptsS';

// Direct connection (port 5432) - Prisma prefers this
const directUrl = `postgresql://postgres:${newPassword}@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres?sslmode=require`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Update DATABASE_URL
const regex = /^DATABASE_URL=.*$/m;
if (regex.test(envContent)) {
  envContent = envContent.replace(regex, `DATABASE_URL="${directUrl}"`);
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated to DIRECT connection (port 5432)');
  console.log('   Prisma works better with direct connections');
  console.log('\n📝 Next step: Restart Next.js server');
  console.log('   If DNS still fails, we may need to use IP address');
} else {
  envContent += `\nDATABASE_URL="${directUrl}"\n`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Added DATABASE_URL');
}

