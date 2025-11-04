/**
 * Fix pooler connection string with correct format
 */

const fs = require('fs');
const path = require('path');

const newPassword = 'Hnzpf3Ywz3KvptsS';

// Try different connection string formats
const formats = [
  // Format 1: With pooler session mode
  `postgresql://postgres.kwhnrlzibgfedtxpkbgb:${newPassword}@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`,
  
  // Format 2: Direct pooler (transaction mode)
  `postgresql://postgres.kwhnrlzibgfedtxpkbgb:${newPassword}@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require`,
  
  // Format 3: Simple postgres user
  `postgresql://postgres:${newPassword}@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require`,
];

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Use format 1 (with pgbouncer=true)
const connectionString = formats[0];

// Update DATABASE_URL
const regex = /^DATABASE_URL=.*$/m;
if (regex.test(envContent)) {
  envContent = envContent.replace(regex, `DATABASE_URL="${connectionString}"`);
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated DATABASE_URL with pooler session mode');
  console.log('   Added: &pgbouncer=true');
  console.log('\n📝 Next step: Restart Next.js server');
} else {
  envContent += `\nDATABASE_URL="${connectionString}"\n`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Added DATABASE_URL');
}

console.log('\n💡 If this still fails, try the direct connection on port 5432');

