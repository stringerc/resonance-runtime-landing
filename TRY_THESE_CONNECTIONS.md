# 🔧 Try These Connection Strings

## Option 1: Direct Connection (Port 5432)

Try updating `.env.local` with:

```bash
DATABASE_URL="postgresql://postgres:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres?sslmode=require"
```

**Note:** Port 5432 is direct connection (not pooler)

## Option 2: Pooler with PgBouncer Flag

Try updating `.env.local` with:

```bash
DATABASE_URL="postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

**Note:** Added `&pgbouncer=true` parameter

## Option 3: Use IP Address

If we can get the IP address, we can use that directly. But first try Options 1 and 2.

## 🔄 After Each Change

1. **Update `.env.local`** with the connection string above
2. **Restart Next.js server:** `Ctrl+C` then `npm run dev`
3. **Test:** http://localhost:3000/api/test-db
4. **If it works:** Try signing in again

---

**Try Option 1 first** (port 5432) - sometimes direct connections work even when pooler doesn't.

