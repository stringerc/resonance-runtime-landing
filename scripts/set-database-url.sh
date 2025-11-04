#!/bin/bash
# Set Database URL - Non-interactive version
# Usage: ./scripts/set-database-url.sh "postgresql://postgres.kwhnrlzibgfedtxpkbgb:[PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

if [ -z "$1" ]; then
  echo "Usage: $0 \"DATABASE_URL\""
  echo ""
  echo "Example:"
  echo "  $0 \"postgresql://postgres.kwhnrlzibgfedtxpkbgb:[PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres\""
  echo ""
  echo "Get your connection string from:"
  echo "  https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database"
  exit 1
fi

DB_URL="$1"

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
echo "📊 Next step: Push database schema"
echo "   Run: npm run db:push"
echo ""

