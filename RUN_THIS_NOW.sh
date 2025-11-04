#!/bin/bash
# Run this script to complete setup

cd "/Users/Apple/New Math Discovery Documentation/webapp"

# Fix connection string format (corrected username)
DB_URL="postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"

# Update .env.local
if grep -q "DATABASE_URL=" .env.local; then
  sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env.local
else
  echo "DATABASE_URL=\"$DB_URL\"" >> .env.local
fi

echo "✅ DATABASE_URL set"
echo ""
echo "📊 Pushing database schema..."

npm run db:push

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Start server: npm run dev"
echo ""

