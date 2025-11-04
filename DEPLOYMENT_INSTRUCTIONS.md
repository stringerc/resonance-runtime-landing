# Vercel Deployment Instructions

## Issue: Missing Environment Variables

The build is failing because NextAuth requires `NEXTAUTH_SECRET` during build time.

## Solution: Add Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/christopher-stringers-projects/webapp
2. Click on "Settings"
3. Click on "Environment Variables"

### Step 2: Add Required Variables

Add these environment variables:

**For Production:**
- `NEXTAUTH_SECRET`: Generate a random secret (run: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your production URL (e.g., `https://your-app.vercel.app`)
- `DATABASE_URL`: Your database connection string (if using)
- `RESONANCE_AGENT_URL`: (Optional) Your agent URL
- `RESONANCE_METRICS_URL`: (Optional) Your metrics URL

**For Preview:**
- Same variables as Production

**For Development:**
- Same variables as Production

### Step 3: Redeploy

After adding variables, go to "Deployments" and click "Redeploy" on the latest deployment.

## Alternative: Quick Deploy (Skip Auth Routes)

If you only need the canary dashboard (which doesn't require auth), you can:

1. Temporarily disable auth route during build
2. Or add a dummy `NEXTAUTH_SECRET` for build time

## Quick Fix Command

```bash
# Generate a secret
openssl rand -base64 32

# Add to Vercel (via CLI)
vercel env add NEXTAUTH_SECRET production
# Paste the generated secret

# Redeploy
vercel --prod
```

## Current Status

✅ Build script fixed (prisma generate added)
⚠️ Need environment variables in Vercel
✅ Dashboard code ready
✅ API route ready

