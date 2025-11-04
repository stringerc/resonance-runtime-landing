# ⚡ Quick Finish Setup

## Current Status

The script is waiting for your database connection string. You have 3 options:

---

## Option 1: Get Connection String Now (2 minutes)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database

2. **Get Connection String:**
   - Click on "Connection string" section
   - Select "URI" tab
   - Copy the full connection string
   - It looks like:
     ```
     postgresql://postgres.kwhnrlzibgfedtxpkbgb:[PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres
     ```

3. **Paste into Script:**
   - Go back to your terminal
   - Paste the connection string
   - Press Enter

4. **Script will automatically:**
   - Update `.env.local`
   - Push database schema

---

## Option 2: Skip and Do Manually

1. **Press Enter** in the terminal to skip

2. **Get connection string** from Supabase dashboard (same as Option 1)

3. **Update `.env.local` manually:**
   ```bash
   # Edit webapp/.env.local
   # Add or update:
   DATABASE_URL="postgresql://postgres.kwhnrlzibgfedtxpkbgb:[PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"
   ```

4. **Push schema:**
   ```bash
   cd webapp
   npm run db:push
   ```

---

## Option 3: Use Non-Interactive Script

1. **Get connection string** from Supabase dashboard

2. **Run:**
   ```bash
   cd webapp
   ./scripts/set-database-url.sh "your-connection-string-here"
   npm run db:push
   ```

---

## ✅ After Setup

Once the schema is pushed:

```bash
cd webapp
npm run dev
```

Visit: http://localhost:3000

---

## 🆘 Need Help?

- **Can't find connection string?** Look for "Connection string" → "URI" tab in Supabase dashboard
- **Wrong password?** You may need to reset it in Supabase dashboard
- **Connection failed?** Make sure you're using port `5432`, not `6543`

---

**Quick link:** https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database

