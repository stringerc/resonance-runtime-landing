#!/bin/bash
# Deploy Resonance Platform to Vercel via GitHub

set -e

echo "🚀 Deploying Resonance Platform to Vercel..."
echo ""

# Check if we're in the webapp directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from webapp directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/stringerc/resonance-runtime-landing.git
fi

# Add all files
echo "📝 Staging files..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Deploy Next.js Resonance Platform with authentication, payments, and database" || echo "No changes to commit"

# Push to GitHub (this will trigger Vercel deployment)
echo "🚀 Pushing to GitHub (this will trigger Vercel deployment)..."
git push -u origin main --force

echo ""
echo "✅ Code pushed to GitHub!"
echo "📋 Vercel will automatically deploy in a few minutes"
echo "🌐 Check deployment status at: https://vercel.com/christopher-stringers-projects/resonance-runtime-landing"
echo "🌐 Live site: https://resonance.syncscript.app"

