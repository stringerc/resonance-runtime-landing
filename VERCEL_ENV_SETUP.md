# Vercel Environment Variables Setup

## 🔧 Required for Auth to Work

The `/api/auth/register` error (500) is because **DATABASE_URL** is missing in Vercel.

### Quick Fix:

1. **Go to Vercel Dashboard**:
   - https://vercel.com/christopher-stringers-projects/webapp
   - Click **Settings** → **Environment Variables**

2. **Add DATABASE_URL**:
   - **Name**: `DATABASE_URL`
   - **Value**: Your database connection string (PostgreSQL)
   - **Environment**: Production, Preview, Development (all three)

3. **Other Required Variables** (if not already set):
   - `NEXTAUTH_SECRET` ✅ (already added)
   - `NEXTAUTH_URL`: `https://webapp-pi6vo02by-christopher-stringers-projects.vercel.app`
   - `DATABASE_URL`: Your PostgreSQL connection string

4. **Redeploy**:
   - Go to **Deployments**
   - Click **⋮** on latest deployment
   - Click **Redeploy**

---

## 📊 Metrics API - Agent Access

The metrics API can't access `localhost:18080` from Vercel because:
- Vercel runs on their servers (not your machine)
- `localhost` refers to Vercel's servers, not yours

### Solutions:

**Option 1: Public Agent URL (Recommended)**
- Deploy agent to a public URL (e.g., Railway, Render, Fly.io)
- Add to Vercel: `RESONANCE_AGENT_URL=https://your-agent-url.com/health`

**Option 2: Use Mock Data (Current)**
- Metrics API already returns mock data when agent not accessible
- Dashboard will still work, just with simulated data

**Option 3: Self-Host Dashboard**
- Keep dashboard on localhost (where agent is accessible)
- Access at: `http://localhost:3000/dashboard/canary`

---

## 🔍 Check Current Environment Variables

```bash
cd "/Users/Apple/New Math Discovery Documentation/webapp"
vercel env ls
```

---

## ✅ After Adding DATABASE_URL

1. Redeploy the app
2. Try signing in again
3. Should work! ✅

