// Test database connection from Next.js environment
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!', result);
    
    // Try to find a user
    const user = await prisma.user.findFirst();
    console.log('✅ Found user:', user ? user.email : 'No users found');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.message.includes("Can't reach database")) {
      console.error('\n💡 This is a DNS/network issue. The database is accessible via Supabase MCP but not from your local machine.');
      console.error('💡 Options:');
      console.error('   1. Use the test user: test@example.com / TestPassword123!');
      console.error('   2. Sign up through the app (if DB connection works)');
      console.error('   3. Create users via Supabase dashboard');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

