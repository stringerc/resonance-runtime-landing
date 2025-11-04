# 🔐 Reset Database Password Guide

## Quick Solution: Reset Password in Supabase Dashboard

Since you don't remember your password, you can reset it easily:

### Step 1: Reset Password

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database

2. **Find "Database password" section:**
   - Look for "Database password" or "Reset database password"
   - Click "Reset database password" button

3. **Copy the new password:**
   - Supabase will show you the new password
   - **Copy it immediately** - you won't be able to see it again!

### Step 2: Construct Connection String

Once you have the new password, construct the connection string:

```
postgresql://postgres.kwhnrlzibgfedtxpkbgb:[NEW_PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres
```

**Important:** Use `postgres.kwhnrlzibgfedtxpkbgb` (not just `postgres`) as shown in your template.

### Step 3: Set and Push Schema

Run these commands:

```bash
cd "/Users/Apple/New Math Discovery Documentation/webapp"

# Replace [NEW_PASSWORD] with the password you just reset
./scripts/set-database-url.sh "postgresql://postgres.kwhnrlzibgfedtxpkbgb:[NEW_PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"

# Push the database schema
npm run db:push
```

## Alternative: If You Can't Find Reset Button

If you don't see a "Reset database password" button:

1. **Check different sections:**
   - Settings → Database → Database password
   - Settings → Database → Connection info
   - Project Settings → Database

2. **Or use Supabase CLI:**
   ```bash
   # Install Supabase CLI if needed
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link to your project
   supabase link --project-ref kwhnrlzibgfedtxpkbgb
   
   # This will show connection details
   ```

## ⚠️ Important Notes

1. **After resetting**, you'll need to update the password in:
   - This setup
   - Any other services using the database
   - Supabase connection strings in other projects

2. **The password is shown only once** - make sure to copy it!

3. **Use the correct username format:**
   - `postgres.kwhnrlzibgfedtxpkbgb` (not just `postgres`)

## 🎯 Quick Steps Summary

1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database
2. Click "Reset database password"
3. Copy the new password
4. Run:
   ```bash
   cd "/Users/Apple/New Math Discovery Documentation/webapp"
   ./scripts/set-database-url.sh "postgresql://postgres.kwhnrlzibgfedtxpkbgb:[NEW_PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"
   npm run db:push
   ```

That's it! 🚀

