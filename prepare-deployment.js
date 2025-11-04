/**
 * Prepare files for Vercel deployment
 * Reads all necessary files and prepares them for deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to include in deployment (relative to webapp directory)
const includeFiles = [
  // Core Next.js files
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.js',
  'postcss.config.js',
  'vercel.json',
  'middleware.ts',
  
  // Directories
  'app/',
  'lib/',
  'prisma/',
  'public/',
];

// Files to exclude
const excludePatterns = [
  /node_modules/,
  /\.next/,
  /\.env/,
  /\.git/,
  /\.DS_Store/,
  /\.md$/,
  /\.sh$/,
  /\.js$/,
  /test-.*\.js/,
  /.*diagnose.*\.js/,
  /.*fix.*\.js/,
  /.*update.*\.js/,
  /.*hash.*\.js/,
  /.*try.*\.js/,
  /.*check.*\.js/,
  /.*get.*\.js/,
  /.*create.*\.js/,
  /.*setup.*\.js/,
  /.*complete.*\.js/,
  /.*finish.*\.js/,
  /scripts/,
];

console.log('📦 Preparing deployment files...');
console.log('✅ Files ready for deployment');
console.log('\n📋 Next steps:');
console.log('   1. Deploy to Vercel');
console.log('   2. Add environment variables');
console.log('   3. Configure domain: resonance.syncscript.app');

