// Test with URL-encoded password
const password = encodeURIComponent('SuperDuper1991Chris');
const connectionString = `postgresql://postgres.kwhnrlzibgfedtxpkbgb:${password}@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require`;

process.env.DATABASE_URL = connectionString;

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'],
});

async function testConnection() {
  try {
    console.log('Testing with URL-encoded password...');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connection successful!', result);
    
    const user = await prisma.user.findFirst({
      where: { email: 'stringer.c.a@gmail.com' }
    });
    
    if (user) {
      console.log('✅ Found user:', user.email);
    }
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
    
    // Try with the original connection string format
    console.log('\nTrying original connection string...');
    process.env.DATABASE_URL = "postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres?sslmode=require";
    
    try {
      const result2 = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Original connection works!');
    } catch (error2) {
      console.error('❌ Original also failed:', error2.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

