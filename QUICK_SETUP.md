# ⚡ Quick Setup - Copy & Paste

## Step 1: Reset Password (Dashboard)

1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database
2. Click "Reset database password"
3. Copy the new password

## Step 2: Run These Commands

Replace `[NEW_PASSWORD]` with the password you just copied:

```bash
cd "/Users/Apple/New Math Discovery Documentation/webapp"

./scripts/set-database-url.sh "postgresql://postgres.kwhnrlzibgfedtxpkbgb:[NEW_PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"

npm run db:push

npm run dev
```

Done! Visit http://localhost:3000

