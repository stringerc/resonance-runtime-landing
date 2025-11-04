#!/bin/bash
# Quick setup script with the provided connection string

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

# Fixed connection string - corrected username format
DB_URL="postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"

echo "🔧 Setting up database connection..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local not found"
  exit 1
fi

# Update or add DATABASE_URL
if grep -q "DATABASE_URL=" .env.local; then
  # Replace existing
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env.local
  else
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env.local
  fi
  echo "✅ DATABASE_URL updated in .env.local"
else
  # Add new
  echo "DATABASE_URL=\"$DB_URL\"" >> .env.local
  echo "✅ DATABASE_URL added to .env.local"
fi

echo ""
echo "📊 Pushing database schema..."
echo ""

if npm run db:push; then
  echo ""
  echo "✅ Database setup complete!"
  echo ""
  echo "🚀 Next step: Start development server"
  echo "   Run: npm run dev"
  echo ""
  echo "Then visit: http://localhost:3000"
  echo ""
else
  echo ""
  echo "❌ Database push failed"
  echo ""
  echo "Please check:"
  echo "  1. Database password is correct"
  echo "  2. Network connection to Supabase"
  echo "  3. Database is accessible"
  exit 1
fi

