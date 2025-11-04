# Instructions for Aider - Execute These Commands

## 🎯 Your Task

Execute the automated deployment workflow for this Next.js application. Follow the steps below in order and report results after each step.

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

### STEP 7: Commit and Push (if build succeeded)
```
git add -A
git status
git commit -m "Auto-fix: Build errors and deployment fixes"
git push origin main
```
**Report**: 
- ✅ "Changes committed and pushed" OR
- ❌ "Git error: [error message]"

### STEP 8: Wait for Vercel Deployment
```
echo "Waiting 30 seconds for Vercel to start building..."
sleep 30
```
**Report**: "Waiting complete"

### STEP 9: Verify Deployment
```
node scripts/auto-deploy-verify.js --fix
```
**Report**:
- ✅ "Deployment successful: [URL]" OR
- ❌ "Deployment failed: [error message]"

## 🚨 Error Handling

If any step fails:

1. **Extract the exact error message**
2. **Report it clearly**
3. **Wait for further instructions**

Common errors to watch for:
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
Next Steps: [if needed]
```

## 🔄 If Build Fails

If Step 6 (build) fails:

1. Extract the exact error message
2. Report it
3. Run: `npm run deploy:fix`
4. Test again: `npm run build`
5. If succeeds, proceed to Step 7
6. If still fails, report error for research

## 💡 Tips

- Run commands one at a time
- Report results after each step
- Don't skip error messages
- If unsure, ask for clarification
- Wait for user confirmation before destructive operations

