/**
 * Generate password hash for user account
 */

const bcrypt = require('bcryptjs');

// Your original password (for signing in to the webapp)
const userPassword = process.argv[2] || '697AXCcy!CGR4!J';

bcrypt.hash(userPassword, 10).then(hash => {
  console.log('Password hash for user account:');
  console.log(hash);
  console.log('\nUse this to update the user account password in the database.');
});

