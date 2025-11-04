# ⚡ Wake Up Database via MCP

## What I'm Doing

Running a SQL query through Supabase MCP to "wake up" the database. This should:
1. Activate the database connection
2. Make DNS resolvable
3. Allow Prisma to connect

## After This

Wait 30-60 seconds, then test DNS:
```bash
ping db.kwhnrlzibgfedtxpkbgb.supabase.co
```

If ping works, then run:
```bash
npm run db:push
```

---

**The SQL query should activate the database and make DNS available.**

