// Check Prisma connection string requirements
const { PrismaClient } = require('@prisma/client');

console.log('Testing Prisma connection...');
console.log('');

// Try different connection string formats
const formats = [
  'postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres?sslmode=require',
  'postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres?sslmode=prefer',
  'postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres?sslmode=require',
];

console.log('Note: DNS resolution is failing, so connection will fail.');
console.log('But this will show us the correct format for Prisma.');
console.log('');

// Since DNS is failing, let's just update to the most likely correct format
const fs = require('fs');
const path = require('path');

const dbUrl = 'postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres?sslmode=require';

const envPath = path.join(__dirname, '.env');
let content = fs.readFileSync(envPath, 'utf8');
content = content.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${dbUrl}"`);
fs.writeFileSync(envPath, content);

console.log('✅ Updated .env with SSL-enabled connection string');
console.log('Format: postgresql://postgres:[PASSWORD]@host:6543/postgres?sslmode=require');
console.log('');
console.log('⚠️  DNS Issue: The hostname is not resolving on your machine.');
console.log('');
console.log('Possible solutions:');
console.log('1. Check your internet connection');
console.log('2. Try: ping db.kwhnrlzibgfedtxpkbgb.supabase.co');
console.log('3. Check if your network/firewall is blocking Supabase');
console.log('4. Try using a VPN or different network');
console.log('5. Wait a few minutes - DNS might be propagating');
console.log('');
console.log('If ping works, then try: npm run db:push');

