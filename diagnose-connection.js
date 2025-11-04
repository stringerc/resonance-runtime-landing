// Diagnose connection issues
const dns = require('dns').promises;

const hostname = 'db.kwhnrlzibgfedtxpkbgb.supabase.co';

console.log('🔍 Diagnosing connection issue...');
console.log('Hostname:', hostname);
console.log('');

// Test DNS resolution
dns.resolve4(hostname)
  .then((addresses) => {
    console.log('✅ DNS resolution successful!');
    console.log('IP addresses:', addresses);
    console.log('');
    console.log('The hostname is valid. The issue might be:');
    console.log('1. Database is paused (free tier Supabase can pause)');
    console.log('2. Password is incorrect');
    console.log('3. Need to resume database in Supabase dashboard');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb');
    console.log('2. Check if database shows "Paused" status');
    console.log('3. Click "Resume" or "Restore" if needed');
  })
  .catch((err) => {
    console.log('❌ DNS resolution failed:', err.message);
    console.log('');
    console.log('This could mean:');
    console.log('1. Network/DNS issue on your machine');
    console.log('2. Database project was deleted or moved');
    console.log('3. Regional DNS issue');
    console.log('');
    console.log('Try:');
    console.log('1. Check internet connection');
    console.log('2. Try: ping db.kwhnrlzibgfedtxpkbgb.supabase.co');
    console.log('3. Check Supabase dashboard to verify project exists');
  });

