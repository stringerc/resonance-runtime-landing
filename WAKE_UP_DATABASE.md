# ⚡ Wake Up Database - Solution

## Issue: DNS Not Resolving

Even though Supabase MCP shows the database as ACTIVE_HEALTHY, the DNS isn't resolving. This often means the database needs to be "woken up" by accessing it through the dashboard first.

## Solution: Wake Up Database via Dashboard

### Step 1: Access Database Through Dashboard

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Or go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/sql

3. **Run a Simple Query:**
   ```sql
   SELECT NOW();
   ```
   - This will "wake up" the database
   - Wait for it to execute (may take 10-30 seconds on first run)

### Step 2: Check Table Editor

1. Go to "Table Editor" in the dashboard
2. This will also trigger the database to become active

### Step 3: Wait 1-2 Minutes

After accessing the database through the dashboard, wait 1-2 minutes for DNS to become available.

### Step 4: Test DNS Again

```bash
ping db.kwhnrlzibgfedtxpkbgb.supabase.co
```

If ping works now, proceed to Step 5.

### Step 5: Push Schema

```bash
npm run db:push
```

---

## Alternative: Get Connection String from Dashboard

After accessing the database, get the exact connection string:

1. Go to: Settings → Database → Connection string
2. Copy the **exact** connection string shown
3. Update `.env` with that exact string

---

## Why This Happens

Free tier Supabase databases can go into a "deep sleep" mode where:
- Status shows as ACTIVE_HEALTHY
- But DNS isn't publicly resolvable until accessed
- First access through dashboard "wakes it up"

---

**Try accessing the SQL Editor first, then test DNS again.**

