# 🚀 Finish Setup - Quick Guide

## Remaining Steps (3 minutes)

### Option 1: Automated Script (Recommended)

```bash
cd webapp
./scripts/finish-setup.sh
```

This script will:
- ✅ Check if DATABASE_URL is configured
- ✅ Guide you to get the connection string if needed
- ✅ Push the database schema automatically

### Option 2: Manual Steps

#### Step 1: Get Database Connection String

1. Go to: https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database
2. Find "Connection string" section
3. Select "URI" tab
4. Copy the connection string
5. It should look like:
   ```
   postgresql://postgres.kwhnrlzibgfedtxpkbgb:[PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres
   ```

**Important:** Use port `5432` (direct connection), not `6543` (PgBouncer).

#### Step 2: Update .env.local

Add or update this line in `webapp/.env.local`:
```env
DATABASE_URL="postgresql://postgres.kwhnrlzibgfedtxpkbgb:[YOUR-PASSWORD]@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"
```

Replace `[YOUR-PASSWORD]` with the actual password from the connection string.

#### Step 3: Push Database Schema

```bash
cd webapp
npm run db:push
```

---

## ✅ After Setup

Once the schema is pushed, you can:

1. **Start development server:**
   ```bash
   cd webapp
   npm run dev
   ```

2. **Test the platform:**
   - Landing: http://localhost:3000
   - Sign up: http://localhost:3000/auth/signup
   - Resonance pricing: http://localhost:3000/resonance/pricing
   - Syncscript pricing: http://localhost:3000/syncscript/pricing

---

## 🆘 Troubleshooting

**Error: "DATABASE_URL not found"**
- Make sure `.env.local` exists in the `webapp/` directory
- Check that `DATABASE_URL` is set correctly

**Error: "Connection refused" or "Authentication failed"**
- Verify the password in the connection string is correct
- Check that you're using port `5432`, not `6543`
- Ensure your IP is allowed in Supabase (if IP restrictions are enabled)

**Error: "Schema push failed"**
- Check that the database is accessible
- Verify the connection string format
- Try running `npm run db:generate` first

---

## 📖 Need Help?

- `FINAL_SETUP_CHECKLIST.md` - Complete checklist
- `COMPLETE_SUMMARY.md` - Full automation summary
- `scripts/finish-setup.sh` - Automated finish script

