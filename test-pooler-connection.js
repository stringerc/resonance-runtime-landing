// Test the new Supavisor pooler connection
process.env.DATABASE_URL = "postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require";

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Testing Supavisor pooler connection...');
    console.log('Host: aws-1-us-east-2.pooler.supabase.com');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!', result);
    
    // Try to find a user
    const user = await prisma.user.findFirst({
      where: { email: 'stringer.c.a@gmail.com' }
    });
    
    if (user) {
      console.log('✅ Found your user account:', user.email);
    } else {
      console.log('⚠️ User not found');
    }
    
    console.log('\n🎉 Connection works! Restart your Next.js server now.');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

