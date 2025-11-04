#!/usr/bin/env node
/**
 * Comprehensive Network & Database Connection Diagnostics
 * Runs without shell commands - pure Node.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;

const execAsync = promisify(exec);

async function diagnose() {
  console.log('🔍 Comprehensive Network & Database Diagnostics\n');
  console.log('='.repeat(60));
  
  const results = {
    dns: {},
    env: {},
    network: {},
    database: {}
  };
  
  // 1. Check DNS Resolution
  console.log('\n1. DNS Resolution Tests\n');
  const hosts = [
    'db.kwhnrlzibgfedtxpkbgb.supabase.co',
    'aws-1-us-east-2.pooler.supabase.com'
  ];
  
  for (const host of hosts) {
    try {
      const addresses = await dns.resolve4(host);
      results.dns[host] = { success: true, addresses };
      console.log(`✅ ${host} resolves to: ${addresses.join(', ')}`);
    } catch (error) {
      results.dns[host] = { success: false, error: error.message };
      console.log(`❌ ${host} failed: ${error.message}`);
    }
  }
  
  // 2. Check Environment Variables
  console.log('\n2. Environment Variables\n');
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"]+)"?/);
    if (dbUrlMatch) {
      const dbUrl = dbUrlMatch[1];
      // Mask password
      const masked = dbUrl.replace(/:([^:@]+)@/, ':***@');
      results.env.databaseUrl = masked;
      console.log(`✅ DATABASE_URL found: ${masked}`);
      
      // Extract components
      const urlMatch = dbUrl.match(/postgresql?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (urlMatch) {
        const [, user, pass, host, port, db] = urlMatch;
        results.env.components = { user, host, port, db };
        console.log(`   Host: ${host}`);
        console.log(`   Port: ${port}`);
        console.log(`   User: ${user}`);
        console.log(`   Database: ${db}`);
      }
    } else {
      console.log('❌ DATABASE_URL not found in .env.local');
    }
  } else {
    console.log('❌ .env.local file not found');
  }
  
  // 3. Network Connectivity Tests
  console.log('\n3. Network Connectivity\n');
  
  // Test if we can reach Supabase
  try {
    const { stdout } = await execAsync('curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://supabase.com');
    results.network.supabase = { success: stdout === '200', status: stdout };
    console.log(`✅ Can reach supabase.com: HTTP ${stdout}`);
  } catch (error) {
    results.network.supabase = { success: false, error: error.message };
    console.log(`❌ Cannot reach supabase.com: ${error.message}`);
  }
  
  // 4. Database Connection Test
  console.log('\n4. Database Connection Test\n');
  
  try {
    // Load environment variables
    require('dotenv').config({ path: envPath });
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: ['error'],
    });
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    results.database.connection = { success: true };
    console.log('✅ Database connection successful!');
    
    // Test query
    const userCount = await prisma.user.count();
    results.database.userCount = userCount;
    console.log(`✅ Found ${userCount} user(s) in database`);
    
    await prisma.$disconnect();
  } catch (error) {
    results.database.connection = { 
      success: false, 
      error: error.message,
      code: error.code
    };
    console.log(`❌ Database connection failed: ${error.message}`);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n💡 This is a DNS/network issue. The database server is not reachable.');
      console.log('💡 Solutions:');
      console.log('   1. Flush DNS cache: sudo dscacheutil -flushcache');
      console.log('   2. Use Supabase dashboard connection string');
      console.log('   3. Deploy to production (Vercel/Netlify)');
    }
  }
  
  // 5. Recommendations
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Recommendations\n');
  
  if (!results.dns['db.kwhnrlzibgfedtxpkbgb.supabase.co']?.success) {
    console.log('🔧 DNS Resolution Failed:');
    console.log('   → Try: sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder');
    console.log('   → Or use Supabase dashboard connection string');
  }
  
  if (results.dns['aws-1-us-east-2.pooler.supabase.com']?.success) {
    console.log('✅ Pooler DNS works! Try using pooler connection string');
  }
  
  if (!results.database.connection?.success) {
    console.log('🔧 Database Connection Failed:');
    console.log('   → Get connection string from Supabase dashboard');
    console.log('   → Or deploy to production where DNS will work');
  }
  
  // Save results
  const resultsPath = path.join(__dirname, 'diagnosis-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full results saved to: ${resultsPath}`);
  
  return results;
}

// Run diagnostics
diagnose().catch(console.error);

