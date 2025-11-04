# ✅ Simple Setup - Manual Steps

## Your Connection String (Fixed Format)

I noticed your connection string had a small format issue. Here's the corrected version:

```
postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres
```

**Note:** The username should be `postgres.kwhnrlzibgfedtxpkbgb` (not just `postgres`)

---

## Step 1: Update .env.local

Open the file `webapp/.env.local` and add this line (or update the existing DATABASE_URL line):

```
DATABASE_URL="postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"
```

---

## Step 2: Push Database Schema

Open a terminal and run:

```bash
cd "/Users/Apple/New Math Discovery Documentation/webapp"
npm run db:push
```

This will create all the database tables.

---

## Step 3: Start Development Server

```bash
npm run dev
```

Then visit: http://localhost:3000

---

## ✅ That's It!

Your setup is complete! The platform will be running at http://localhost:3000

---

## 🆘 If npm run db:push Fails

If you get a connection error, double-check:
1. The password in the connection string is correct
2. The username is `postgres.kwhnrlzibgfedtxpkbgb` (with the project ref)
3. You're using port `5432`

---

**Quick copy-paste for .env.local:**
```
DATABASE_URL="postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"
```

