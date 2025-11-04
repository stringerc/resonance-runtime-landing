# ⏸️ Database Paused - Fix Guide

## Issue: DNS Resolution Failing

The error `ENODATA` means the DNS server has no records for that hostname. This usually happens when:

1. **Database is paused** (free tier Supabase pauses after inactivity)
2. **Database needs to be resumed**

## Solution: Resume Database

### Step 1: Check Database Status

1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb
2. Look at the project overview
3. Check if you see:
   - "Paused" status
   - "Resume" or "Restore" button
   - Warning about inactive database

### Step 2: Resume Database

1. If paused, click **"Resume"** or **"Restore"** button
2. Wait 1-2 minutes for database to fully start
3. The DNS will become available once database is active

### Step 3: Try Again

After resuming, run:
```bash
npm run db:push
```

---

## Alternative: Check Connection String in Dashboard

Even if paused, you can still see the connection string:

1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database
2. Copy the exact connection string shown
3. Use that exact string (it might have different format)

---

## Quick Test After Resume

Once database is resumed, test DNS:
```bash
ping db.kwhnrlzibgfedtxpkbgb.supabase.co
```

If ping works, then try:
```bash
npm run db:push
```

---

**Most likely fix:** Resume the database in Supabase dashboard, then try again.

