#!/bin/bash
# Finish Setup Script - Complete remaining manual steps
# This script guides you through getting the database password and pushing the schema

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Finishing Setup - Remaining Steps"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local not found. Please run auto-setup.sh first."
  exit 1
fi

# Step 1: Check DATABASE_URL
echo "📋 Step 1: Database Connection"
echo "------------------------------"

if grep -q "DATABASE_URL=" .env.local && ! grep -q "DATABASE_URL=\"\"" .env.local && ! grep -q "YOUR-PASSWORD" .env.local && ! grep -q "\[PASSWORD\]" .env.local; then
  echo "✅ DATABASE_URL appears to be configured"
  DB_URL=$(grep "DATABASE_URL=" .env.local | cut -d'=' -f2- | tr -d '"')
  # Check if it's a valid postgres URL
  if [[ "$DB_URL" == postgresql://* ]]; then
    echo "✅ Valid PostgreSQL connection string found"
  else
    echo "⚠️  DATABASE_URL format may be incorrect"
  fi
else
  echo "⚠️  DATABASE_URL not configured"
  echo ""
  echo "📋 To get your database connection string:"
  echo ""
  echo "   1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database"
  echo "   2. Find 'Connection string' section"
  echo "   3. Select 'URI' tab"
  echo "   4. Copy the connection string"
  echo "   5. It should look like:"
  echo "      postgresql://postgres.kwhnrlzibgfedtxpkbgb:[PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"
  echo ""
  echo "   ⚠️  Use port 5432 (direct connection), not 6543 (PgBouncer)"
  echo ""
  read -p "Paste your DATABASE_URL here (or press Enter to skip): " DB_URL_INPUT
  
  if [ -n "$DB_URL_INPUT" ]; then
    # Update .env.local
    if grep -q "DATABASE_URL=" .env.local; then
      # Replace existing
      if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL_INPUT\"|" .env.local
      else
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL_INPUT\"|" .env.local
      fi
    else
      # Add new
      echo "DATABASE_URL=\"$DB_URL_INPUT\"" >> .env.local
    fi
    echo "✅ DATABASE_URL updated"
  else
    echo "⏭️  Skipped. Please configure DATABASE_URL manually in .env.local"
    echo ""
    echo "After configuring, run: npm run db:push"
    exit 0
  fi
fi

echo ""

# Step 2: Push database schema
echo "📋 Step 2: Push Database Schema"
echo "-------------------------------"

# Verify DATABASE_URL is set in environment
export $(grep -v '^#' .env.local | grep DATABASE_URL | xargs)

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in environment"
  echo "   Please make sure .env.local contains DATABASE_URL"
  exit 1
fi

echo "📊 Pushing Prisma schema to database..."
echo ""

if npm run db:push; then
  echo ""
  echo "✅ Database schema pushed successfully!"
  echo ""
else
  echo ""
  echo "❌ Database push failed"
  echo ""
  echo "Common issues:"
  echo "  - Invalid DATABASE_URL"
  echo "  - Database password incorrect"
  echo "  - Network connectivity issues"
  echo ""
  echo "Please check:"
  echo "  1. DATABASE_URL is correct in .env.local"
  echo "  2. Database password is correct"
  echo "  3. You have network access to Supabase"
  exit 1
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📊 Summary:"
echo "   ✅ Database connection configured"
echo "   ✅ Database schema pushed"
echo ""
echo "🚀 Next Steps:"
echo "   1. (Optional) Set up Stripe webhook: ./scripts/setup-stripe-webhook.sh"
echo "   2. (Optional) Set up Redis: Sign up at https://upstash.com"
echo "   3. Start development server: npm run dev"
echo ""
echo "🧪 Test the platform:"
echo "   - Visit: http://localhost:3000"
echo "   - Sign up: http://localhost:3000/auth/signup"
echo "   - Pricing: http://localhost:3000/resonance/pricing"
echo ""

