#!/usr/bin/env node
/**
 * Automated Fix Script for Common Build Errors
 * 
 * This script automatically fixes common TypeScript/Next.js build errors:
 * - Missing imports
 * - Type errors
 * - Environment variable issues
 * - Route handler exports
 * 
 * Usage:
 *   node scripts/auto-fix-common-errors.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DRY_RUN = process.argv.includes('--dry-run');
const PROJECT_DIR = path.join(__dirname, '..');

// Known import dependencies
const IMPORT_MAP = {
  'hashPassword': {
    from: '@/lib/auth/password',
    file: 'lib/auth/password.ts'
  },
  'verifyPassword': {
    from: '@/lib/auth/password',
    file: 'lib/auth/password.ts'
  },
  'authOptions': {
    from: '@/lib/auth/config',
    file: 'lib/auth/config.ts'
  },
  'ResonanceCheckoutButton': {
    from: '@/components/CheckoutButton',
    file: 'components/CheckoutButton.tsx'
  },
  'SyncscriptCheckoutButton': {
    from: '@/components/CheckoutButton',
    file: 'components/CheckoutButton.tsx'
  }
};

/**
 * Find all TypeScript/TSX files
 */
function findSourceFiles() {
  const files = [];
  
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (!['node_modules', '.next', 'dist', 'coverage'].includes(entry.name)) {
          walkDir(fullPath);
        }
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(PROJECT_DIR);
  return files;
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(path.join(PROJECT_DIR, filePath));
}

/**
 * Fix missing imports in a file
 */
function fixMissingImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check for each known import dependency
  for (const [symbol, config] of Object.entries(IMPORT_MAP)) {
    // Check if symbol is used but not imported
    const isUsed = new RegExp(`\\b${symbol}\\b`).test(content);
    const isImported = new RegExp(`import.*${symbol}.*from`).test(content);
    const fileExists = fs.existsSync(path.join(PROJECT_DIR, config.file));
    
    if (isUsed && !isImported && fileExists) {
      // Find the last import statement
      const importMatch = content.match(/^import.*from.*;$/gm);
      const lastImport = importMatch ? importMatch[importMatch.length - 1] : null;
      const lastImportIndex = lastImport ? content.lastIndexOf(lastImport) + lastImport.length : 0;
      
      // Add new import
      const newImport = `import { ${symbol} } from "${config.from}";\n`;
      content = content.slice(0, lastImportIndex) + '\n' + newImport + content.slice(lastImportIndex);
      modified = true;
      
      if (!DRY_RUN) {
        console.log(`  ✅ Added import: ${symbol} from ${config.from}`);
      }
    }
  }
  
  if (modified && !DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return modified;
}

/**
 * Fix route handler exports
 */
function fixRouteExports(filePath) {
  if (!filePath.includes('/api/') || !filePath.endsWith('/route.ts')) {
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if authOptions is exported (shouldn't be in route files)
  if (content.includes('export const authOptions')) {
    console.log(`  ⚠️  Found authOptions export in route file: ${filePath}`);
    console.log(`     This should be moved to lib/auth/config.ts`);
    // Don't auto-fix this - requires manual refactoring
  }
  
  // Ensure only GET/POST/etc are exported
  const hasHandler = /export\s+(const|function)\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/.test(content);
  if (!hasHandler && content.includes('export')) {
    console.log(`  ⚠️  Route file may have invalid exports: ${filePath}`);
  }
  
  return modified;
}

/**
 * Fix type errors related to null/undefined
 */
function fixTypeErrors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix: license.type?.toLowerCase() - already handled
  // Fix: session.user.id - should be handled by type definitions
  
  // Add optional chaining for common patterns
  const patterns = [
    {
      // license.type.toLowerCase() -> license.type?.toLowerCase()
      pattern: /(\w+)\.type\.toLowerCase\(\)/g,
      replacement: '$1.type?.toLowerCase()',
      description: 'Add optional chaining to type property'
    },
    {
      // license.status -> should be safe (has default in Prisma)
      // But we can add a check if needed
    }
  ];
  
  for (const { pattern, replacement, description } of patterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      if (!DRY_RUN) {
        console.log(`  ✅ ${description}`);
      }
    }
  }
  
  if (modified && !DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return modified;
}

/**
 * Main fix function
 */
function runAutoFix() {
  console.log('🔍 Scanning for common errors...\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }
  
  const files = findSourceFiles();
  let totalFixed = 0;
  
  for (const file of files) {
    const relativePath = path.relative(PROJECT_DIR, file);
    let fileModified = false;
    
    // Skip test files and config files for now
    if (relativePath.includes('__tests__') || relativePath.includes('.test.')) {
      continue;
    }
    
    try {
      // Fix missing imports
      if (fixMissingImports(file)) {
        fileModified = true;
      }
      
      // Fix route exports
      if (fixRouteExports(file)) {
        fileModified = true;
      }
      
      // Fix type errors
      if (fixTypeErrors(file)) {
        fileModified = true;
      }
      
      if (fileModified) {
        totalFixed++;
        console.log(`✅ Fixed: ${relativePath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${relativePath}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary: ${totalFixed} file(s) modified`);
  
  if (totalFixed > 0 && !DRY_RUN) {
    console.log('\n💡 Run: npm run build to verify fixes');
    console.log('💡 Then: git add -A && git commit -m "Auto-fix: Common errors"');
  }
  
  return totalFixed;
}

// Run if executed directly
if (require.main === module) {
  const fixed = runAutoFix();
  process.exit(fixed > 0 ? 0 : 1);
}

module.exports = { runAutoFix, fixMissingImports, fixTypeErrors };

