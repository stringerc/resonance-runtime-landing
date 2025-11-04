# Quick Start: Delegation Guide

## 🎯 TL;DR: Who Does What

- **Cursor (Auto/Me)**: Creates instructions, coordinates, analyzes ❌ Cannot execute commands
- **Gemini**: Can research AND execute commands ✅ Best for errors needing research
- **Aider**: Can execute commands ✅ Best for straightforward execution

## 🚀 Quick Start: Choose Your Tool

### **Option 1: Use Gemini** (Recommended for Complex Errors)

**Copy this to Gemini:**
```
Execute the deployment workflow for Next.js app:

cd "/Users/Apple/New Math Discovery Documentation/webapp"
echo $VERCEL_TOKEN (if empty, ask user for it)
chmod +x scripts/*.sh scripts/*.js
node scripts/auto-fix-common-errors.js
npm run build

If build fails, research the error and fix it automatically.

If build succeeds:
git add -A
git commit -m "Auto-fix: Deployment fixes"
git push origin main
sleep 30
node scripts/auto-deploy-verify.js --fix

Report final status.
```

**Why Gemini?** Can research errors and fix them automatically.

### **Option 2: Use Aider** (Recommended for Simple Execution)

**Copy this to Aider:**
```
Execute: npm run deploy:auto

If it fails:
npm run deploy:fix
npm run build
git add -A && git commit -m "Fix" && git push
sleep 30
npm run deploy:verify --fix

Report status.
```

**Why Aider?** Fast, straightforward execution.

## 📋 What Happens Next

1. **Gemini/Aider executes** the commands
2. **Reports results** (success or errors)
3. **If errors**: 
   - Gemini: Researches and fixes automatically
   - Aider: Reports error, then you can ask Gemini to research
4. **You share results** back to me (Auto) for analysis
5. **I provide** new instructions if needed

## ✅ Success Checklist

After delegation, verify:
- [ ] Gemini/Aider executed commands
- [ ] Build succeeded (locally and on Vercel)
- [ ] Deployment URL accessible
- [ ] No errors in execution

## 📚 Detailed Guides

- **`COMMAND_EXECUTION_DELEGATION.md`** - Complete strategy
- **`INSTRUCTIONS_FOR_GEMINI.md`** - Detailed Gemini instructions
- **`INSTRUCTIONS_FOR_AIDER.md`** - Detailed Aider instructions

