const bcrypt = require('bcryptjs');

const password = '697AXCcy!CGR4!J';

bcrypt.hash(password, 10).then(hash => {
  console.log(hash);
});

