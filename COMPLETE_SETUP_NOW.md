# 🚀 Complete Setup Now - Best Method

## Step-by-Step Instructions

### Step 1: Get Database Connection String (1 minute)

1. **Open Supabase Dashboard:**
   - Click: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database
   - Or navigate: Project → Settings → Database

2. **Find Connection String:**
   - Scroll to "Connection string" section
   - Click on "URI" tab (not "JDBC" or "Connection pooling")
   - You'll see something like:
     ```
     postgresql://postgres.kwhnrlzibgfedtxpkbgb:[YOUR-PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres
     ```
   - **Copy the entire string** (including the password)

**Important:** Make sure it says port `5432`, not `6543`

---

### Step 2: Run Setup Commands (30 seconds)

Once you have the connection string, run these commands:

```bash
cd "/Users/Apple/New Math Discovery Documentation/webapp"

# Replace YOUR_CONNECTION_STRING with what you copied from Supabase
./scripts/set-database-url.sh "YOUR_CONNECTION_STRING"

# Push the database schema
npm run db:push
```

**Example:**
```bash
./scripts/set-database-url.sh "postgresql://postgres.kwhnrlzibgfedtxpkbgb:abc123xyz@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"
npm run db:push
```

---

### Step 3: Verify Setup (30 seconds)

```bash
# Check that schema was pushed successfully
npm run db:generate

# Start development server
npm run dev
```

Visit: http://localhost:3000

---

## ✅ That's It!

Your platform is now fully set up and ready to use!

---

## 🆘 Troubleshooting

**If you get "connection refused":**
- Double-check the connection string was copied correctly
- Verify you're using port `5432`
- Make sure the password in the connection string is correct

**If you get "schema push failed":**
- Run `npm run db:generate` first
- Check that DATABASE_URL is set: `grep DATABASE_URL .env.local`
- Verify database is accessible

**Quick verification:**
```bash
# Check if DATABASE_URL is set
grep DATABASE_URL .env.local
```

---

## 📋 Quick Reference

- **Supabase Dashboard:** https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database
- **Connection String Location:** Settings → Database → Connection string → URI tab
- **Port:** Use `5432` (direct connection)

---

**Total time:** ~2 minutes once you have the connection string

