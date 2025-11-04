# 🔒 IP Restrictions Check

## The Issue

Both ports (5432 and 6543) are failing, which strongly indicates **IP restrictions** in Supabase.

## Solution: Allow Your IP in Supabase

### Step 1: Get Your Current IP

Run this in your terminal:
```bash
curl ifconfig.me
```

Or visit: https://whatismyipaddress.com/

### Step 2: Add IP to Supabase

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database

2. **Find IP Restrictions:**
   - Look for "Network restrictions"
   - Or "IP allowlist"
   - Or "Connection pooling" → "IP restrictions"
   - Or "Database" → "Network access"

3. **Add Your IP:**
   - Click "Add IP" or "Add new restriction"
   - Paste your IP address
   - Save

4. **OR Temporarily Allow All IPs (for setup):**
   - If available, toggle "Restrict database access" to OFF
   - This allows all IPs (use with caution)

### Step 3: Try Again

After adding your IP, run:
```bash
npm run db:push
```

---

## Alternative: Check Connection String in Dashboard

1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database
2. Find "Connection string" section
3. Copy the **exact** connection string shown there
4. It might have additional parameters or different format

---

## Quick Test

After updating IP restrictions, wait 10-30 seconds for changes to propagate, then try:
```bash
npm run db:push
```

---

**Most likely fix:** IP restrictions need to be configured in Supabase dashboard.

