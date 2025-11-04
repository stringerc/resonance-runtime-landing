// Quick test script to check sign-in functionality
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testSignIn() {
  try {
    // Check if test user exists
    const testEmail = 'test@example.com';
    const testPassword = 'TestPassword123!';
    
    let user = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (!user) {
      // Create test user
      const passwordHash = await bcrypt.hash(testPassword, 10);
      user = await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash,
          name: 'Test User',
        }
      });
      console.log('✅ Test user created:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
    } else {
      console.log('✅ Test user already exists');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
    }
    
    // Verify password works
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);
    console.log(`\n✅ Password verification: ${isValid ? 'PASS' : 'FAIL'}`);
    
    console.log('\n📝 You can now sign in with:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testSignIn();

