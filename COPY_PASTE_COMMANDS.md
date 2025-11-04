# 🚀 Copy & Paste These Commands

## Step 1: Set Database URL

Run this command in your terminal:

```bash
cd "/Users/Apple/New Math Discovery Documentation/webapp" && chmod +x RUN_THIS_NOW.sh && ./RUN_THIS_NOW.sh
```

**OR** if that doesn't work, run these commands one by one:

```bash
cd "/Users/Apple/New Math Discovery Documentation/webapp"
```

```bash
echo 'DATABASE_URL="postgresql://postgres.kwhnrlzibgfedtxpkbgb:SuperDuper1991Chris@db.kwhnrlzibgfedtxpkbgb.supabase.co:5432/postgres"' >> .env.local
```

```bash
npm run db:push
```

```bash
npm run dev
```

---

## ✅ What Each Command Does

1. **First command:** Navigates to webapp directory
2. **Second command:** Adds DATABASE_URL to .env.local
3. **Third command:** Pushes database schema to Supabase
4. **Fourth command:** Starts development server

---

## 🎯 After Running

Visit: http://localhost:3000

Your platform will be fully set up!

