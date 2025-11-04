/**
 * Get NEXTAUTH_SECRET from .env.local
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '.env.local');

let nextAuthSecret = null;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/NEXTAUTH_SECRET=["']?([^"'\n]+)["']?/);
  if (match) {
    nextAuthSecret = match[1];
  }
}

// If not found, generate a new one
if (!nextAuthSecret) {
  nextAuthSecret = crypto.randomBytes(32).toString('base64');
  console.log('Generated new NEXTAUTH_SECRET');
} else {
  console.log('Found existing NEXTAUTH_SECRET');
}

console.log(nextAuthSecret);
process.exit(0);

