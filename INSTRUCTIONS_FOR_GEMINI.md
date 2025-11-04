# Instructions for Gemini - Execute These Commands

## 🎯 Your Task

Execute the automated deployment workflow for this Next.js application. You can both research solutions AND execute commands.

## 📋 Execution Steps

### STEP 1: Navigate to Project Directory
```
cd "/Users/Apple/New Math Discovery Documentation/webapp"
pwd
```
**Report**: Current directory location

### STEP 2: Check Vercel Token
```
echo $VERCEL_TOKEN
```
**Report**: 
- If token exists: "✅ VERCEL_TOKEN is set"
- If empty: "⚠️ VERCEL_TOKEN not set - ask user for token"

### STEP 3: Set Vercel Token (if needed)
If token is empty, ask the user:
"Please provide your Vercel token. You can get it from: https://vercel.com/account/tokens"

Then set it:
```
export VERCEL_TOKEN=[token_from_user]
```

### STEP 4: Make Scripts Executable
```
chmod +x scripts/*.sh scripts/*.js
ls -la scripts/auto-*
```
**Report**: Scripts are now executable

### STEP 5: Run Auto-Fix for Common Errors
```
node scripts/auto-fix-common-errors.js
```
**Report**: 
- "✅ Auto-fix completed" or
- "⚠️ Auto-fix found issues: [list]"

### STEP 6: Test Local Build
```
npm run build
```
**Report**:
- ✅ "Build succeeded" OR
- ❌ "Build failed: [paste exact error message]"

### STEP 7: If Build Fails - Research and Fix

**If Step 6 fails, do this:**

1. **Research the error:**
   - Look up the exact error message
   - Find Next.js 14 specific solutions
   - Check TypeScript strict mode requirements

2. **Apply the fix:**
   - Make the necessary code changes
   - Test the fix: `npm run build`
   - If succeeds, proceed to Step 8

3. **Report:**
   - "✅ Researched and fixed: [fix description]"

### STEP 8: Commit and Push (if build succeeded)
```
git add -A
git status
git commit -m "Auto-fix: Build errors and deployment fixes"
git push origin main
```
**Report**: 
- ✅ "Changes committed and pushed" OR
- ❌ "Git error: [error message]"

### STEP 9: Wait for Vercel Deployment
```
echo "Waiting 30 seconds for Vercel to start building..."
sleep 30
```
**Report**: "Waiting complete"

### STEP 10: Verify Deployment
```
node scripts/auto-deploy-verify.js --fix
```
**Report**:
- ✅ "Deployment successful: [URL]" OR
- ❌ "Deployment failed: [error message]"

## 🔍 Gemini's Unique Advantage

Since you can BOTH research AND execute:

**If you encounter an error:**
1. Research the error immediately
2. Find the best solution
3. Apply the fix
4. Continue execution
5. Report what you fixed

**Example:**
```
Build failed with: "Type error: Property 'x' does not exist"

Researching... Found: Need to add type definition

Applying fix... Done.

Testing... Build succeeded.

Continuing to commit...
```

## 🚨 Error Handling

If any step fails:

1. **Research the error** (you can do this!)
2. **Find the solution**
3. **Apply the fix**
4. **Continue execution**
5. **Report what you fixed**

Common errors to research and fix:
- "Cannot find name"
- "Module not found"
- "Type error"
- "Command exited with 1"

## ✅ Success Criteria

The deployment is successful when you see:
- ✅ "✓ Compiled successfully"
- ✅ "✓ Linting and checking validity of types"
- ✅ "readyState: READY"
- ✅ Deployment URL in output

## 📊 Final Report Format

After completing all steps, provide:

```
DEPLOYMENT STATUS REPORT
========================
Build Status: ✅/❌
Deployment Status: ✅/❌
Deployment URL: [if successful]
Errors Encountered: [if any]
Fixes Applied: [list any fixes you made]
Next Steps: [if needed]
```

## 💡 Tips

- Use your research capability when errors occur
- Apply fixes immediately when you find them
- Report what you fixed so we can learn
- Don't skip error messages
- Wait for user confirmation before destructive operations

## 🔄 Research + Execute Pattern

When you encounter errors, follow this pattern:

1. **Extract error**: Copy exact error message
2. **Research**: Look up Next.js 14 solutions
3. **Understand**: Identify root cause
4. **Fix**: Apply code changes
5. **Verify**: Test with `npm run build`
6. **Continue**: Proceed to next step
7. **Report**: Document what you fixed

This is your advantage - you can research AND execute in one workflow!

