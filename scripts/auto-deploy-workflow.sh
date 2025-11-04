#!/bin/bash
# Automated Deployment Workflow
# Coordinates build, fix, deploy, and verify

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_DIR}"

echo "🚀 Automated Deployment Workflow"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MAX_RETRIES=${MAX_RETRIES:-3}
VERCEL_TOKEN=${VERCEL_TOKEN:-}
AUTO_FIX=${AUTO_FIX:-true}

# Step 1: Pre-flight checks
echo "📋 Step 1: Pre-flight Checks"
echo "----------------------------"

# Check Vercel token
if [ -z "$VERCEL_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  VERCEL_TOKEN not set${NC}"
  echo "   Set it with: export VERCEL_TOKEN=your_token"
  echo "   Or add to .env file"
  exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Pre-flight checks passed${NC}"
echo ""

# Step 2: Run auto-fix
if [ "$AUTO_FIX" = "true" ]; then
  echo "🔧 Step 2: Running Auto-Fix"
  echo "---------------------------"
  
  if node "${SCRIPT_DIR}/auto-fix-common-errors.js"; then
    echo -e "${GREEN}✅ Auto-fix completed${NC}"
  else
    echo -e "${YELLOW}⚠️  Auto-fix found issues (may need manual review)${NC}"
  fi
  echo ""
fi

# Step 3: Local build test
echo "🏗️  Step 3: Local Build Test"
echo "----------------------------"

if npm run build; then
  echo -e "${GREEN}✅ Local build successful${NC}"
else
  echo -e "${RED}❌ Local build failed${NC}"
  echo "   Fix errors before deploying"
  exit 1
fi
echo ""

# Step 4: Commit and push
echo "📤 Step 4: Commit and Push"
echo "--------------------------"

# Check if there are changes
if git diff --quiet && git diff --cached --quiet; then
  echo "ℹ️  No changes to commit"
else
  echo "📝 Committing changes..."
  git add -A
  git commit -m "Auto-fix: Build errors and deployment fixes" || true
  git push origin main
  echo -e "${GREEN}✅ Changes pushed${NC}"
fi
echo ""

# Step 5: Wait for deployment
echo "⏳ Step 5: Waiting for Vercel Deployment"
echo "---------------------------------------"
echo "   (This may take 2-3 minutes)"
echo ""

sleep 10

# Step 6: Verify deployment
echo "🔍 Step 6: Verifying Deployment"
echo "-----------------------------"

if node "${SCRIPT_DIR}/auto-deploy-verify.js" --fix; then
  echo ""
  echo -e "${GREEN}✅✅✅ DEPLOYMENT SUCCESSFUL! ✅✅✅${NC}"
  echo ""
  echo "🌐 Your application should be live at:"
  echo "   https://resonance-runtime-landing.vercel.app"
  echo ""
  exit 0
else
  echo ""
  echo -e "${RED}❌ Deployment failed or could not be verified${NC}"
  echo ""
  echo "🔍 Next steps:"
  echo "   1. Check Vercel dashboard for build logs"
  echo "   2. Review error messages above"
  echo "   3. Run: node scripts/auto-fix-common-errors.js"
  echo "   4. Fix manually if auto-fix didn't work"
  echo ""
  exit 1
fi

