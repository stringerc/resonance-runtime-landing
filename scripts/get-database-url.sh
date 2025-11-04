#!/bin/bash
# Helper script to get Supabase database connection string

echo "🔗 Supabase Database Connection String"
echo "========================================"
echo ""
echo "Project: Landing Page (kwhnrlzibgfedtxpkbgb)"
echo "Host: db.kwhnrlzibgfedtxpkbgb.supabase.co"
echo ""
echo "📋 To get your connection string:"
echo ""
echo "Option 1: Via Supabase Dashboard (Recommended)"
echo "   1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database"
echo "   2. Find 'Connection string' section"
echo "   3. Select 'URI' tab"
echo "   4. Copy the connection string"
echo "   5. It will look like:"
echo "      postgresql://postgres.kwhnrlzibgfedtxpkbgb:[PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"
echo ""
echo "Option 2: Via Database Password"
echo "   1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database"
echo "   2. Find 'Database password' section"
echo "   3. Click 'Reset database password' (if needed)"
echo "   4. Copy the password"
echo "   5. Use this format:"
echo "      postgresql://postgres.kwhnrlzibgfedtxpkbgb:[PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"
echo ""
echo "⚠️  Note: Use port 5432 (direct connection) not 6543 (PgBouncer)"
echo ""
read -p "Paste your DATABASE_URL here (or press Enter to skip): " DB_URL

if [ -n "$DB_URL" ]; then
  # Update .env.local
  if [ -f ".env.local" ]; then
    # Check if DATABASE_URL already exists
    if grep -q "DATABASE_URL=" .env.local; then
      # Replace existing DATABASE_URL
      if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env.local
      else
        # Linux
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env.local
      fi
    else
      # Add DATABASE_URL
      echo "DATABASE_URL=\"$DB_URL\"" >> .env.local
    fi
    echo ""
    echo "✅ DATABASE_URL updated in .env.local"
  else
    echo ""
    echo "❌ .env.local not found. Please run auto-setup.sh first."
  fi
else
  echo ""
  echo "⏭️  Skipped. You can update .env.local manually."
fi

