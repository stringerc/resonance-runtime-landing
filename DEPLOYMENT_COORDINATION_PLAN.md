# Comprehensive Deployment Coordination Plan
## Using Gemini, Aider CLI, Auto (Claude), and Automated Scripts

## 🚀 AUTOMATION AVAILABLE

**NEW: Fully Automated Deployment System**

Run this single command to:
- Auto-fix common errors
- Build locally
- Commit and push
- Monitor deployment
- Auto-fix and re-deploy if needed
- Verify success

```bash
# Set Vercel token first
export VERCEL_TOKEN=your_token_here

# Run automated workflow
npm run deploy:auto

# Or manually:
./scripts/auto-deploy-workflow.sh
```

## Tool Roles & Strengths

## Tool Roles & Strengths

### **Auto (Claude) - Coordination & Strategy**
- Code review and architecture decisions
- TypeScript/Next.js expertise
- Complex reasoning and problem-solving
- Creating comprehensive plans

### **Gemini - Research & Validation**
- Fact-checking Next.js 14 best practices
- Researching TypeScript strict mode patterns
- Verifying library usage (zxcvbn, NextAuth, etc.)
- Checking deployment best practices

### **Aider CLI - Execution & Deployment**
- Running terminal commands
- Checking deployment status
- Making code edits via CLI
- Git operations and pushes
- Testing builds locally

### **Automated Scripts - Full Automation** ⭐ NEW
- **`auto-deploy-workflow.sh`**: Complete automated workflow
- **`auto-deploy-verify.js`**: Monitor and verify deployments via Vercel API
- **`auto-fix-common-errors.js`**: Auto-fix common TypeScript/build errors
- Can run independently or be triggered by other tools

## Current Status

✅ **Fixed Issues:**
- Removed nested webapp directory
- Fixed all TypeScript type errors
- Added missing imports
- Fixed environment variable checks
- Fixed zxcvbn configuration

⏳ **Pending:**
- Final build verification
- Deployment confirmation
- Post-deployment testing

## ⚠️ IMPORTANT: Auto Cannot Execute Commands

**Auto (Claude) CANNOT run terminal commands.**
- ✅ Creates scripts and instructions
- ✅ Analyzes errors
- ✅ Coordinates tools
- ❌ CANNOT execute `npm`, `git`, `node`, or shell commands

**Solution**: Provide instructions below to Aider for execution.

## Phase 1: Immediate Fix & Verification

### Step 1: Commit Current Fix (DELEGATE TO AIDER)

**Copy this to Aider:**
```
Execute these commands:
1. cd "/Users/Apple/New Math Discovery Documentation/webapp"
2. git add lib/auth/password.ts
3. git commit -m "Fix zxcvbn configuration: use setOptions instead of passing options"
4. git push origin main
5. Report: "✅ Committed and pushed" or any errors
```

### Step 2: Monitor Build (DELEGATE TO AIDER)

**Copy this to Aider:**
```
Monitor Vercel deployment:
1. Wait 30 seconds: sleep 30
2. Check deployment status using one of:
   - vercel ls (if Vercel CLI installed)
   - Or check Vercel dashboard manually
3. Report: "✅ Building" or "✅ Deployed" or "❌ Failed: [error]"
```

### Step 3: Verify Build Success (DELEGATE TO AIDER)

**Copy this to Aider:**
```
Verify build completed successfully:
1. Check latest deployment status
2. Look for these indicators:
   - "✓ Compiled successfully"
   - "✓ Linting and checking validity of types"
   - Exit code 0
3. Report findings
```

## Phase 2: If Build Fails - Research & Fix

### Step 2.1: Research Error (Gemini)
**Query Gemini:**
```
"What is the correct way to configure @zxcvbn-ts/core in Next.js 14 with TypeScript strict mode? 
I'm getting a type error when using zxcvbnOptions.setOptions(). 
Show me the proper import and configuration pattern."
```

### Step 2.2: Alternative zxcvbn Configuration (Research)
**Query Gemini:**
```
"@zxcvbn-ts/core version 2.0.1 - show me example code for password validation 
in a Next.js TypeScript project. Include proper type definitions and configuration."
```

### Step 2.3: Fix Implementation (Aider)
Based on Gemini's research, Aider should:
1. Update `lib/auth/password.ts` with correct configuration
2. Test locally: `npm run build`
3. If successful, commit and push

## Phase 3: Comprehensive Code Review

### Step 3.1: TypeScript Strict Mode Check (Aider)
```bash
cd webapp
npx tsc --noEmit --strict
```

### Step 3.2: Check All Imports (Aider)
```bash
# Verify all imports resolve
npx next build 2>&1 | grep -E "Cannot find|Module not found|import"
```

### Step 3.3: Verify Environment Variables (Aider)
```bash
# Check which env vars are required
grep -r "process.env\." webapp/lib webapp/app --include="*.ts" --include="*.tsx" | \
  grep -v "NEXT_PUBLIC" | \
  sort | uniq
```

## Phase 4: Post-Deployment Verification

### Step 4.1: Check Deployment Status (Aider)
```bash
# Get latest deployment URL
vercel ls --limit 1

# Or check Vercel dashboard
# URL format: https://resonance-runtime-landing.vercel.app
```

### Step 4.2: Test Key Endpoints (Aider)
```bash
# Test homepage
curl -I https://YOUR_DEPLOYMENT_URL/

# Test API route (should return 401 if not authenticated)
curl -I https://YOUR_DEPLOYMENT_URL/api/checkout/create

# Test auth route
curl -I https://YOUR_DEPLOYMENT_URL/api/auth/signin
```

### Step 4.3: Verify Database Connection (Aider)
```bash
# Test database connection endpoint
curl https://YOUR_DEPLOYMENT_URL/api/test-db
```

## Phase 5: Final Checklist

### ✅ Pre-Deployment Checklist
- [ ] All TypeScript errors resolved
- [ ] All imports verified
- [ ] Environment variables properly checked
- [ ] No non-null assertions (`!`) without checks
- [ ] All route handlers properly typed
- [ ] Client/server components correctly separated

### ✅ Post-Deployment Checklist
- [ ] Build succeeds on Vercel
- [ ] Homepage loads
- [ ] Sign-in page accessible
- [ ] Dashboard accessible (after auth)
- [ ] API routes return proper responses
- [ ] Database connection works
- [ ] No console errors in browser

## Common Issues & Solutions

### Issue 1: zxcvbn Type Error
**Solution:** Use `zxcvbnOptions.setOptions()` before calling `zxcvbn()`, or check if newer API requires different pattern.

### Issue 2: Missing Environment Variables
**Solution:** Ensure all required env vars are set in Vercel dashboard:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`
- `UPSTASH_REDIS_REST_URL` (optional)
- `UPSTASH_REDIS_REST_TOKEN` (optional)

### Issue 3: Type Errors in Route Handlers
**Solution:** Ensure route handlers only export HTTP methods (GET, POST, etc.), not configuration objects.

### Issue 4: Import Resolution Errors
**Solution:** Verify `tsconfig.json` paths are correct:
```json
"paths": {
  "@/*": ["./*"]
}
```

## Aider Commands Reference

### Check Build Status
```bash
# Local build test
cd webapp && npm run build

# Check for TypeScript errors
cd webapp && npx tsc --noEmit

# Check for linting errors
cd webapp && npm run lint
```

### Git Operations
```bash
cd webapp
git status
git add .
git commit -m "DESCRIPTION"
git push origin main
```

### Deployment Verification
```bash
# If Vercel CLI is installed
vercel ls
vercel inspect [deployment-url]

# Check deployment logs
vercel logs [deployment-url]
```

## Gemini Research Queries

1. **Next.js 14 TypeScript Strict Mode:**
   - "Next.js 14 TypeScript strict mode best practices for route handlers"
   - "Next.js 14 server components vs client components best practices"

2. **Library Configuration:**
   - "@zxcvbn-ts/core v2.0.1 configuration in Next.js 14"
   - "NextAuth v4 TypeScript type definitions for custom session"

3. **Deployment:**
   - "Vercel deployment troubleshooting Next.js 14 TypeScript errors"
   - "Common Vercel build failures and solutions"

## Coordination Workflow

1. **Auto creates plan** → This document
2. **Aider executes fixes** → Runs commands, makes edits
3. **Gemini researches** → Provides fact-based solutions
4. **Auto reviews** → Validates fixes, suggests improvements
5. **Aider deploys** → Commits, pushes, verifies deployment

## Success Criteria

✅ Build succeeds on Vercel
✅ No TypeScript errors
✅ No runtime errors
✅ All pages accessible
✅ Database connection works
✅ Authentication flow works
✅ Checkout flow works (if tested)

## Next Steps

1. **Aider:** Run Step 1 (commit current fix)
2. **Aider:** Monitor build (Step 2)
3. **If fails:** Gemini researches, Aider fixes, repeat
4. **If succeeds:** Aider verifies deployment (Step 4)
5. **Auto:** Reviews final status and provides summary

