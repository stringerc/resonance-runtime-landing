#!/usr/bin/env node
/**
 * Automated Deployment Verification & Fix Script
 * 
 * This script:
 * 1. Monitors Vercel deployment status
 * 2. Parses build logs for errors
 * 3. Attempts automated fixes for common issues
 * 4. Re-deploys if needed
 * 5. Verifies deployment success
 * 
 * Usage:
 *   node scripts/auto-deploy-verify.js [--fix] [--retry-count=3]
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const PROJECT_NAME = 'resonance-runtime-landing';
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3', 10);
const RETRY_DELAY = 30000; // 30 seconds

// Common error patterns and their fixes
const ERROR_PATTERNS = {
  'zxcvbn': {
    pattern: /zxcvbn|@zxcvbn-ts/,
    fix: 'fix-zxcvbn-config',
    description: 'Fix zxcvbn configuration'
  },
  'missing import': {
    pattern: /Cannot find name|Module not found|is not defined/,
    fix: 'fix-missing-imports',
    description: 'Fix missing imports'
  },
  'type error': {
    pattern: /Type error|Property.*does not exist|is not assignable/,
    fix: 'fix-type-errors',
    description: 'Fix TypeScript type errors'
  },
  'env var': {
    pattern: /is not set|process\.env\./,
    fix: 'check-env-vars',
    description: 'Check environment variables'
  },
  'route export': {
    pattern: /Route.*does not match|not a valid Route export/,
    fix: 'fix-route-exports',
    description: 'Fix route handler exports'
  }
};

/**
 * Make HTTP request to Vercel API
 */
function vercelRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.vercel.com${endpoint}`);
    
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * Get latest deployment for project
 */
async function getLatestDeployment() {
  try {
    const query = { limit: '1' };
    if (VERCEL_TEAM_ID) {
      query.teamId = VERCEL_TEAM_ID;
    }
    
    const response = await vercelRequest(`/v6/deployments`, {
      query
    });

    if (response.status !== 200) {
      throw new Error(`API error: ${response.status}`);
    }

    const deployments = response.data.deployments || [];
    const projectDeployments = deployments.filter(d => 
      d.name === PROJECT_NAME || d.url?.includes(PROJECT_NAME)
    );

    if (projectDeployments.length === 0) {
      throw new Error('No deployments found');
    }

    return projectDeployments[0];
  } catch (error) {
    console.error('❌ Error fetching deployment:', error.message);
    return null;
  }
}

/**
 * Get deployment status
 */
async function getDeploymentStatus(deploymentId) {
  try {
    const response = await vercelRequest(`/v13/deployments/${deploymentId}`);
    
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching deployment status:', error.message);
    return null;
  }
}

/**
 * Get build logs
 */
async function getBuildLogs(deploymentId) {
  try {
    const response = await vercelRequest(`/v2/deployments/${deploymentId}/events`, {
      query: { direction: 'forward', follow: 'false' }
    });
    
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching build logs:', error.message);
    return null;
  }
}

/**
 * Parse build logs for errors
 */
function parseErrors(logs) {
  const errors = [];
  const logText = typeof logs === 'string' ? logs : JSON.stringify(logs);
  
  for (const [errorType, config] of Object.entries(ERROR_PATTERNS)) {
    if (config.pattern.test(logText)) {
      errors.push({
        type: errorType,
        fix: config.fix,
        description: config.description
      });
    }
  }
  
  return errors;
}

/**
 * Fix zxcvbn configuration
 */
function fixZxcvbnConfig() {
  const filePath = path.join(__dirname, '..', 'lib', 'auth', 'password.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already fixed
  if (content.includes('zxcvbnOptions.setOptions')) {
    console.log('✅ zxcvbn already configured correctly');
    return true;
  }
  
  // Apply fix
  content = content.replace(
    /const options = \{[\s\S]*?\};/,
    `zxcvbnOptions.setOptions({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
});`
  );
  
  content = content.replace(/zxcvbn\(password, options\)/, 'zxcvbn(password)');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed zxcvbn configuration');
  return true;
}

/**
 * Fix missing imports
 */
function fixMissingImports() {
  // Check for common missing imports
  const filesToCheck = [
    'lib/auth/mfa.ts',
    'lib/auth/config.ts',
    'app/api/**/*.ts'
  ];
  
  // This would need more sophisticated analysis
  // For now, just verify known imports
  console.log('⚠️  Missing import fixes require manual review');
  return false;
}

/**
 * Check environment variables
 */
function checkEnvVars() {
  const required = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXTAUTH_SECRET',
    'DATABASE_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log(`❌ Missing environment variables: ${missing.join(', ')}`);
    console.log('   Set these in Vercel project settings');
    return false;
  }
  
  console.log('✅ All required environment variables present');
  return true;
}

/**
 * Apply automated fix
 */
function applyFix(fixType) {
  console.log(`\n🔧 Applying fix: ${fixType}`);
  
  switch (fixType) {
    case 'fix-zxcvbn-config':
      return fixZxcvbnConfig();
    case 'fix-missing-imports':
      return fixMissingImports();
    case 'check-env-vars':
      return checkEnvVars();
    default:
      console.log(`⚠️  No automated fix available for: ${fixType}`);
      return false;
  }
}

/**
 * Commit and push changes
 */
function commitAndPush(message) {
  try {
    const projectDir = path.join(__dirname, '..');
    process.chdir(projectDir);
    
    execSync('git add -A', { stdio: 'inherit' });
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('✅ Changes committed and pushed');
    return true;
  } catch (error) {
    console.error('❌ Error committing changes:', error.message);
    return false;
  }
}

/**
 * Wait for deployment to complete
 */
async function waitForDeployment(deploymentId, maxWait = 300000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    const status = await getDeploymentStatus(deploymentId);
    
    if (!status) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }
    
    if (status.readyState === 'READY') {
      console.log('✅ Deployment completed successfully!');
      return { success: true, deployment: status };
    }
    
    if (status.readyState === 'ERROR' || status.readyState === 'CANCELED') {
      console.log('❌ Deployment failed');
      return { success: false, deployment: status };
    }
    
    // Still building
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  return { success: false, error: 'Timeout waiting for deployment' };
}

/**
 * Main deployment verification function
 */
async function verifyDeployment(retryCount = 0) {
  console.log(`\n🔍 Checking deployment status (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
  
  const deployment = await getLatestDeployment();
  if (!deployment) {
    console.log('❌ Could not fetch deployment');
    return false;
  }
  
  console.log(`📦 Deployment: ${deployment.url || deployment.id}`);
  console.log(`   State: ${deployment.readyState}`);
  console.log(`   Status: ${deployment.status || 'unknown'}`);
  
  // Wait for deployment to complete
  const result = await waitForDeployment(deployment.id);
  
  if (result.success) {
    console.log('\n✅ Deployment successful!');
    console.log(`   URL: ${deployment.url || 'N/A'}`);
    return true;
  }
  
  // Deployment failed - analyze errors
  console.log('\n❌ Deployment failed. Analyzing errors...');
  
  const logs = await getBuildLogs(deployment.id);
  const errors = parseErrors(logs);
  
  if (errors.length === 0) {
    console.log('⚠️  No recognized error patterns found');
    console.log('   Manual review required');
    return false;
  }
  
  console.log(`\n🔍 Found ${errors.length} error(s):`);
  errors.forEach(err => {
    console.log(`   - ${err.description} (${err.type})`);
  });
  
  // Attempt automated fixes
  if (process.argv.includes('--fix')) {
    console.log('\n🔧 Attempting automated fixes...');
    
    let fixed = false;
    for (const error of errors) {
      if (applyFix(error.fix)) {
        fixed = true;
      }
    }
    
    if (fixed && retryCount < MAX_RETRIES) {
      console.log('\n📤 Committing fixes and re-deploying...');
      const commitMsg = `Auto-fix: ${errors.map(e => e.description).join(', ')}`;
      
      if (commitAndPush(commitMsg)) {
        console.log(`\n⏳ Waiting ${RETRY_DELAY / 1000}s before checking new deployment...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        
        return verifyDeployment(retryCount + 1);
      }
    }
  }
  
  console.log('\n❌ Deployment failed and could not be auto-fixed');
  console.log('   Manual intervention required');
  return false;
}

// Main execution
if (require.main === module) {
  if (!VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN environment variable not set');
    console.error('   Get your token from: https://vercel.com/account/tokens');
    process.exit(1);
  }
  
  const fixMode = process.argv.includes('--fix');
  const retryCount = parseInt(process.argv.find(arg => arg.startsWith('--retry-count='))?.split('=')[1] || '0', 10);
  
  verifyDeployment(retryCount)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { verifyDeployment, getLatestDeployment, parseErrors };

