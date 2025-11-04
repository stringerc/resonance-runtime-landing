#!/bin/bash
# Complete Setup Script for Enterprise Platform
# Automates all possible setup steps

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Enterprise Platform Complete Setup"
echo "========================================"
echo ""

# Step 1: Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local not found. Please run auto-setup.sh first."
  exit 1
fi

# Step 2: Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local || grep -q "DATABASE_URL=\"\"" .env.local || grep -q "YOUR-PASSWORD" .env.local; then
  echo "⚠️  DATABASE_URL not configured"
  echo ""
  echo "📋 To get your database password:"
  echo "   1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database"
  echo "   2. Find 'Connection string' section"
  echo "   3. Select 'URI' tab"
  echo "   4. Copy the connection string"
  echo "   5. Update .env.local with:"
  echo "      DATABASE_URL=\"[your-connection-string]\""
  echo ""
  echo "   Or if you have the password:"
  echo "      DATABASE_URL=\"postgresql://postgres.kwhnrlzibgfedtxpkbgb:[PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres\""
  echo ""
  read -p "Press Enter when DATABASE_URL is configured, or Ctrl+C to exit..."
fi

# Step 3: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 4: Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Step 5: Push schema to database
echo "🗄️  Pushing database schema..."
if npm run db:push; then
  echo "✅ Database schema pushed successfully!"
else
  echo "⚠️  Database push failed. Check DATABASE_URL in .env.local"
  exit 1
fi

# Step 6: Check Stripe webhook secret
if ! grep -q "STRIPE_WEBHOOK_SECRET=" .env.local || grep -q "STRIPE_WEBHOOK_SECRET=\"\"" .env.local; then
  echo ""
  echo "⚠️  STRIPE_WEBHOOK_SECRET not configured"
  echo ""
  echo "📋 To set up Stripe webhook:"
  echo "   For Local Development:"
  echo "   1. Install ngrok: npm install -g ngrok"
  echo "   2. Start Next.js: npm run dev"
  echo "   3. In another terminal: ngrok http 3000"
  echo "   4. Copy ngrok URL (e.g., https://abc123.ngrok.io)"
  echo ""
  echo "   Configure Webhook:"
  echo "   1. Go to: https://dashboard.stripe.com/webhooks"
  echo "   2. Click 'Add endpoint'"
  echo "   3. Endpoint URL: https://your-ngrok-url.ngrok.io/api/webhooks/stripe"
  echo "   4. Select events:"
  echo "      ✅ checkout.session.completed"
  echo "      ✅ invoice.payment_succeeded"
  echo "      ✅ invoice.payment_failed"
  echo "      ✅ customer.subscription.deleted"
  echo "      ✅ customer.subscription.updated"
  echo "   5. Click 'Add endpoint'"
  echo "   6. Copy 'Signing secret' (starts with whsec_)"
  echo "   7. Update .env.local: STRIPE_WEBHOOK_SECRET=\"whsec_...\""
  echo ""
  echo "   Note: Webhook is optional for testing, but required for production."
  read -p "Press Enter to continue, or Ctrl+C to set up webhook now..."
fi

# Step 7: Optional Redis setup
if ! grep -q "UPSTASH_REDIS_REST_URL=" .env.local || grep -q "UPSTASH_REDIS_REST_URL=\"\"" .env.local; then
  echo ""
  echo "ℹ️  Redis (optional) not configured"
  echo "   Rate limiting will work but won't persist across restarts."
  echo "   To set up: https://upstash.com (free tier)"
  echo ""
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 Next Steps:"
echo "   1. Start development server: npm run dev"
echo "   2. Visit: http://localhost:3000"
echo "   3. Test registration: http://localhost:3000/auth/signup"
echo "   4. Test pricing: http://localhost:3000/resonance/pricing"
echo ""
echo "📊 Status:"
echo "   ✅ Dependencies installed"
echo "   ✅ Prisma client generated"
echo "   ✅ Database schema pushed"
if grep -q "STRIPE_WEBHOOK_SECRET=" .env.local && ! grep -q "STRIPE_WEBHOOK_SECRET=\"\"" .env.local; then
  echo "   ✅ Stripe webhook configured"
else
  echo "   ⏳ Stripe webhook (optional)"
fi
if grep -q "UPSTASH_REDIS_REST_URL=" .env.local && ! grep -q "UPSTASH_REDIS_REST_URL=\"\"" .env.local; then
  echo "   ✅ Redis configured"
else
  echo "   ⏳ Redis (optional)"
fi
echo ""
