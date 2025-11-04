# Vercel Domain Setup - resonance.syncscript.app

## 🎯 Goal

Configure Vercel dashboard to use `resonance.syncscript.app` as the main domain.

---

## 📋 Steps

### 1. Go to Vercel Dashboard

1. Visit: https://vercel.com/christopher-stringers-projects/webapp
2. Click **Settings** tab
3. Click **Domains** (left sidebar)

### 2. Add Custom Domain

1. Click **"Add Domain"**
2. Enter: `resonance.syncscript.app`
3. Click **"Add"**

### 3. Configure DNS

Vercel will provide DNS instructions. You'll need to add:

**Option A: CNAME (Recommended)**
- **Type**: CNAME
- **Name**: `resonance` (or `@` for root)
- **Value**: `cname.vercel-dns.com` (or value provided by Vercel)

**Option B: A Record**
- **Type**: A
- **Name**: `resonance` (or `@` for root)
- **Value**: IP addresses provided by Vercel

### 4. Wait for DNS Propagation

- Usually takes 1-60 minutes
- Can take up to 48 hours in rare cases
- Vercel will show status: "Valid Configuration" when ready

### 5. Verify

Once DNS is configured:
- Vercel will automatically issue SSL certificate
- Dashboard will be accessible at: `https://resonance.syncscript.app`
- All routes will work: `https://resonance.syncscript.app/dashboard/canary`

---

## ✅ Final Architecture

**Frontend (Dashboard)**:
- ✅ Vercel → `resonance.syncscript.app`
- ✅ Routes:
  - `/` - Home
  - `/dashboard/canary` - Canary monitoring
  - `/api/metrics` - Metrics proxy

**Backend (Agent)**:
- ✅ Render.com → `api.resonance.syncscript.app`
- ✅ Endpoints:
  - `/health` - Health check
  - `/metrics` - Prometheus metrics (protected)

---

## 🔄 After Both Are Live

Update Vercel environment variables:

```bash
cd "/Users/Apple/New Math Discovery Documentation/webapp"

# Backend URLs
vercel env add RESONANCE_AGENT_URL production
# Enter: https://api.resonance.syncscript.app/health

vercel env add RESONANCE_METRICS_URL production
# Enter: https://api.resonance.syncscript.app/metrics

# API Key (same one from Render)
vercel env add RESONANCE_API_KEY production
# Enter: jAn5Wzpm4EMbt-QQJPUXHo4esCiGW3i2hYW-BQsrlWY

# Redeploy
vercel --prod
```

---

## ✅ Success!

Once both are configured:
- ✅ Dashboard: `https://resonance.syncscript.app`
- ✅ API: `https://api.resonance.syncscript.app`
- ✅ Clean architecture
- ✅ Professional setup

---

**Ready to configure!** 🚀

