#!/bin/bash
echo "🚀 Automated Setup Script"
echo "========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it first."
    exit 1
fi

echo "✅ Environment file ready"
echo ""
echo "📋 Next steps:"
echo "1. Authorize Stripe connection: https://connect.composio.dev/link/lk_fSUtwqyeV8Zw"
echo "2. Get Supabase database password and update DATABASE_URL"
echo "3. Install dependencies: npm install"
echo "4. Run database migrations: npm run db:generate && npm run db:push"
echo "5. Create Stripe products (will be automated after Stripe connection)"
echo "6. Set up Upstash Redis (free tier)"
echo "7. Run: npm run dev"
