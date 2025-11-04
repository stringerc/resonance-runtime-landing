# 🔧 Troubleshooting Database Connection

## Issue: "Can't reach database server"

This usually means one of two things:

### 1. IP Restrictions (Most Likely)

Supabase databases have IP restrictions by default. You need to allow your IP address.

**Fix:**
1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database
2. Find "Connection pooling" or "Network restrictions" section
3. Look for "Allowed IP addresses" or "IP restrictions"
4. Click "Add IP" or "Allow all IPs" (for development)
5. Add your current IP address

**Or use Connection Pooling (Recommended for development):**

If you see "Connection pooling" settings, use the pooled connection string instead:
- Port: `6543` (instead of `5432`)
- This uses PgBouncer and often bypasses IP restrictions

### 2. Connection String Format

Try this format instead:

```
postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres?sslmode=require
```

Or with connection pooling (port 6543):

```
postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres?sslmode=require
```

### 3. Check Supabase Dashboard

In Supabase dashboard:
1. Go to Settings → Database
2. Check if there's a "Network restrictions" or "IP allowlist" section
3. Make sure your IP is allowed, or temporarily allow all IPs for setup

### 4. Alternative: Use Connection Pooling

Connection pooling (port 6543) often works better:
- Uses PgBouncer
- Sometimes bypasses IP restrictions
- Better for development

**Try this connection string:**

```
postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres
```

---

## Quick Fix Script

Run this to try the pooled connection:

```bash
cd "/Users/Apple/New Math Discovery Documentation/webapp"
node -e "const fs=require('fs'); let c=fs.readFileSync('.env','utf8'); c=c.replace(/DATABASE_URL=.*/g, 'DATABASE_URL=\"postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:6543/postgres\"'); fs.writeFileSync('.env',c); console.log('✅ Updated to use connection pooling (port 6543)');"
```

Then try: `npm run db:push`

---

## Next Steps

1. **Check Supabase IP restrictions** (most likely fix)
2. **Try connection pooling** (port 6543)
3. **Verify password is correct** in Supabase dashboard

