# Automated Deployment System Guide

## 🚀 Quick Start

### One-Command Deployment
```bash
# 1. Set your Vercel token
export VERCEL_TOKEN=your_vercel_token_here

# 2. Run automated workflow
npm run deploy:auto
```

This will:
1. ✅ Auto-fix common errors
2. ✅ Test build locally
3. ✅ Commit and push changes
4. ✅ Monitor Vercel deployment
5. ✅ Auto-fix and re-deploy if errors found
6. ✅ Verify deployment success

## 📋 Prerequisites

### 1. Get Vercel Token
1. Go to: https://vercel.com/account/tokens
2. Create a new token
3. Copy the token

### 2. Set Environment Variable
```bash
# Temporary (current session)
export VERCEL_TOKEN=your_token_here

# Permanent (add to ~/.zshrc or ~/.bashrc)
echo 'export VERCEL_TOKEN=your_token_here' >> ~/.zshrc
source ~/.zshrc
```

### 3. Optional: Set Team ID (if using Vercel teams)
```bash
export VERCEL_TEAM_ID=your_team_id
```

## 🔧 Available Scripts

### `npm run deploy:auto`
Complete automated workflow - fixes, builds, deploys, verifies.

### `npm run deploy:verify`
Monitor deployment status and check for errors.

### `npm run deploy:fix`
Auto-fix common TypeScript/build errors (dry-run by default).

## 📖 Script Details

### `scripts/auto-deploy-workflow.sh`
**Main orchestration script**

**What it does:**
1. Pre-flight checks (verifies token, Node.js, etc.)
2. Runs auto-fix for common errors
3. Tests build locally
4. Commits and pushes changes
5. Waits for Vercel deployment
6. Verifies deployment success

**Usage:**
```bash
./scripts/auto-deploy-workflow.sh

# With environment variables
VERCEL_TOKEN=xxx MAX_RETRIES=5 AUTO_FIX=true ./scripts/auto-deploy-workflow.sh
```

**Options:**
- `MAX_RETRIES`: Number of retry attempts (default: 3)
- `AUTO_FIX`: Enable auto-fix (default: true)
- `VERCEL_TOKEN`: Vercel API token (required)

### `scripts/auto-deploy-verify.js`
**Deployment monitoring and verification**

**What it does:**
1. Fetches latest deployment from Vercel API
2. Monitors deployment status
3. Parses build logs for errors
4. Attempts automated fixes
5. Re-deploys if fixes applied

**Usage:**
```bash
# Monitor deployment
node scripts/auto-deploy-verify.js

# Auto-fix and re-deploy on errors
node scripts/auto-deploy-verify.js --fix

# Custom retry count
node scripts/auto-deploy-verify.js --fix --retry-count=5
```

**Error Detection:**
- zxcvbn configuration errors
- Missing imports
- TypeScript type errors
- Environment variable issues
- Route handler export errors

### `scripts/auto-fix-common-errors.js`
**Automated error fixing**

**What it fixes:**
- Missing imports (hashPassword, authOptions, CheckoutButton, etc.)
- Type errors (optional chaining for nullable properties)
- Route handler exports
- Common Next.js patterns

**Usage:**
```bash
# Dry run (preview fixes)
node scripts/auto-fix-common-errors.js --dry-run

# Apply fixes
node scripts/auto-fix-common-errors.js
```

## 🔍 How It Works

### Error Detection
The system uses pattern matching to identify common errors:
- Regex patterns match error messages
- Error types mapped to fix functions
- Automatic categorization for targeted fixes

### Auto-Fix Process
1. **Scan**: Find all TypeScript/TSX files
2. **Analyze**: Check for known error patterns
3. **Fix**: Apply automated fixes
4. **Verify**: Test build locally
5. **Deploy**: Commit and push if successful

### Deployment Monitoring
1. **Poll**: Check deployment status every 5 seconds
2. **Parse**: Extract build logs and errors
3. **Fix**: Apply automated fixes if errors found
4. **Retry**: Re-deploy up to MAX_RETRIES times
5. **Verify**: Confirm deployment success

## 🛠️ Manual Override

If automation doesn't work, you can:

### 1. Check Build Status Manually
```bash
# Using Vercel CLI (if installed)
vercel ls

# Or check dashboard
open https://vercel.com/your-team/resonance-runtime-landing
```

### 2. Run Fixes Manually
```bash
# Fix common errors
npm run deploy:fix

# Test build
npm run build

# Commit and push
git add -A
git commit -m "Fix: Description"
git push origin main
```

### 3. Verify Deployment
```bash
# Check deployment status
npm run deploy:verify

# Or use Vercel API directly
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v6/deployments
```

## 📊 Success Indicators

✅ **Build Successful:**
- "✓ Compiled successfully"
- "✓ Linting and checking validity of types"
- Exit code 0

✅ **Deployment Ready:**
- `readyState: "READY"`
- Deployment URL accessible
- No errors in logs

## 🚨 Troubleshooting

### Issue: "VERCEL_TOKEN not set"
**Solution:**
```bash
export VERCEL_TOKEN=your_token
# Or add to .env file (don't commit)
```

### Issue: "No deployments found"
**Solution:**
- Check project name matches in script
- Verify token has correct permissions
- Check if team ID is needed

### Issue: "Auto-fix didn't work"
**Solution:**
- Review error messages manually
- Check build logs in Vercel dashboard
- Apply fixes manually if needed

### Issue: "Build keeps failing"
**Solution:**
1. Run: `npm run deploy:fix --dry-run` to see what would be fixed
2. Review changes before applying
3. Test locally: `npm run build`
4. Check for new error patterns not covered

## 🔄 Integration with Other Tools

### With Gemini
Ask Gemini to research specific errors:
```
"Next.js 14 TypeScript error: [paste error message]
What's the best fix for this?"
```

Then use auto-fix or apply manually.

### With Aider
Aider can:
- Run the automation scripts
- Make manual fixes if auto-fix fails
- Commit and push changes

### With Auto (Claude)
I can:
- Review auto-fix results
- Suggest improvements
- Create new fix patterns
- Coordinate all tools

## 📈 Future Enhancements

Potential improvements:
- [ ] GitHub Actions integration
- [ ] Slack/Discord notifications
- [ ] Automatic rollback on failure
- [ ] Performance monitoring
- [ ] Health check endpoints
- [ ] Automated testing before deploy

## 🎯 Best Practices

1. **Always test locally first:**
   ```bash
   npm run build
   ```

2. **Review auto-fixes:**
   ```bash
   npm run deploy:fix --dry-run
   ```

3. **Monitor deployments:**
   ```bash
   npm run deploy:verify
   ```

4. **Keep Vercel token secure:**
   - Never commit to git
   - Use environment variables
   - Rotate regularly

## 📚 References

- [Vercel API Docs](https://vercel.com/docs/rest-api)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)

