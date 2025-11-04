/**
 * Update DATABASE_URL with new password
 * Run with: node update-password.js
 */

const fs = require('fs');
const path = require('path');

const newPassword = 'Hnzpf3Ywz3KvptsS';

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Try pooler connection first (DNS resolves)
const poolerUrl = `postgresql://postgres.kwhnrlzibgfedtxpkbgb:${newPassword}@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require`;

// Update DATABASE_URL
const regex = /^DATABASE_URL=.*$/m;
if (regex.test(envContent)) {
  envContent = envContent.replace(regex, `DATABASE_URL="${poolerUrl}"`);
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated DATABASE_URL in .env.local');
  console.log('   Using Supavisor pooler (DNS resolves)');
  console.log('   Password updated to new password');
} else {
  // Add it if it doesn't exist
  envContent += `\nDATABASE_URL="${poolerUrl}"\n`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Added DATABASE_URL to .env.local');
}

console.log('\n📝 Next steps:');
console.log('   1. Restart Next.js server (Ctrl+C then npm run dev)');
console.log('   2. Test: http://localhost:3000/api/test-db');
console.log('   3. Update your user password hash in database');

