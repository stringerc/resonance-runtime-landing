/**
 * Script to base64 encode files for GitHub upload
 */

const fs = require('fs');
const path = require('path');

function encodeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return Buffer.from(content).toString('base64');
}

// Critical files to upload
const files = [
  'app/layout.tsx',
  'app/page.tsx', 
  'app/providers.tsx',
  'app/globals.css',
];

const encoded = {};
files.forEach(file => {
  try {
    encoded[file] = encodeFile(file);
    console.log(`✅ Encoded ${file}`);
  } catch (e) {
    console.log(`❌ Failed ${file}: ${e.message}`);
  }
});

console.log('\nFiles ready for upload:');
console.log(JSON.stringify(Object.keys(encoded), null, 2));

