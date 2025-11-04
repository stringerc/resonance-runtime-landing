/**
 * Helper script to base64 encode files for GitHub upload
 */

const fs = require('fs');
const path = require('path');

const files = [
  { path: 'package.json', content: fs.readFileSync('package.json', 'utf8') },
  { path: 'next.config.js', content: fs.readFileSync('next.config.js', 'utf8') },
  { path: 'tsconfig.json', content: fs.readFileSync('tsconfig.json', 'utf8') },
  { path: 'tailwind.config.js', content: fs.readFileSync('tailwind.config.js', 'utf8') },
  { path: 'postcss.config.js', content: fs.readFileSync('postcss.config.js', 'utf8') },
  { path: 'middleware.ts', content: fs.readFileSync('middleware.ts', 'utf8') },
];

const encoded = {};
files.forEach(file => {
  encoded[file.path] = Buffer.from(file.content).toString('base64');
});

console.log(JSON.stringify(encoded, null, 2));

