/**
 * Simple script to update DATABASE_URL in .env.local
 * Run with: node update-env-simple.js "YOUR_CONNECTION_STRING"
 */

const fs = require('fs');
const path = require('path');

const connectionString = process.argv[2];

if (!connectionString) {
  console.log('❌ Usage: node update-env-simple.js "YOUR_CONNECTION_STRING"');
  console.log('\nExample:');
  console.log('node update-env-simple.js "postgresql://postgres:password@host:5432/db"');
  process.exit(1);
}

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Replace DATABASE_URL line
const regex = /^DATABASE_URL=.*$/m;
if (regex.test(envContent)) {
  envContent = envContent.replace(regex, `DATABASE_URL="${connectionString}"`);
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated DATABASE_URL in .env.local');
  console.log(`   New value: ${connectionString.substring(0, 50)}...`);
} else {
  // Add it if it doesn't exist
  envContent += `\nDATABASE_URL="${connectionString}"\n`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Added DATABASE_URL to .env.local');
}

console.log('\n📝 Next step: Restart your Next.js server (Ctrl+C then npm run dev)');

