# 🔐 Final Password Setup - Simple Steps

## ✅ What I Tried

I attempted to reset the password via SQL, but Supabase requires superuser privileges (which we don't have via API). The password must be reset through the dashboard.

## 🚀 Solution: Reset Password in Dashboard (2 minutes)

### Step 1: Reset Password

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database

2. **Reset Password:**
   - Look for "Database password" section
   - Click "Reset database password" button
   - Copy the new password immediately (shown only once!)

### Step 2: Set Connection String

Once you have the new password, run this command (replace `[NEW_PASSWORD]` with the actual password):

```bash
cd "/Users/Apple/New Math Discovery Documentation/webapp"

./scripts/set-database-url.sh "postgresql://postgres.kwhnrlzibgfedtxpkbgb:[NEW_PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"
```

### Step 3: Push Database Schema

```bash
npm run db:push
```

### Step 4: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 📋 Quick Reference

**Connection String Template:**
```
postgresql://postgres.kwhnrlzibgfedtxpkbgb:[YOUR_PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres
```

**Dashboard Link:**
https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database

**Important:** 
- Use `postgres.kwhnrlzibgfedtxpkbgb` as the username (not just `postgres`)
- Use port `5432` (direct connection)

---

## 🎯 That's It!

Once you reset the password in the dashboard and run the commands above, your setup will be complete!

