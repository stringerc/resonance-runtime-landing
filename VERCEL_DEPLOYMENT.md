# Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Build successful (`npm run build`)
- [x] API routes working (`/api/metrics`)
- [x] Dashboard page created (`/dashboard/canary`)
- [x] Vercel configuration (`vercel.json`)

## 🚀 Deployment Options

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
cd "/Users/Apple/New Math Discovery Documentation/webapp"
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No (first time) or Yes (update)
# - Project name? (default or custom)
# - Directory? ./
# - Override settings? No
```

### Option 2: Vercel Dashboard (Web UI)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub/GitLab/Bitbucket
3. **Click "Add New Project"**
4. **Import Git Repository**:
   - Select your repository
   - Or connect a new one
5. **Configure Project**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (or leave default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)
6. **Environment Variables** (if needed):
   - `RESONANCE_AGENT_URL` (optional, for production)
   - `RESONANCE_METRICS_URL` (optional, for production)
   - Other variables from `.env.local`
7. **Click "Deploy"**

### Option 3: GitHub Integration (Auto-Deploy)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add canary dashboard"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to Vercel dashboard
   - Import repository
   - Vercel will auto-deploy on every push

## 📋 Environment Variables

If deploying to Vercel and accessing agent from external URL:

1. Go to Project Settings → Environment Variables
2. Add:
   - `RESONANCE_AGENT_URL`: Your agent URL (e.g., `https://agent.example.com`)
   - `RESONANCE_METRICS_URL`: Your metrics URL (e.g., `https://metrics.example.com`)

**Note**: For local development, defaults to `http://localhost:18080` and `http://localhost:19090`

## 🔍 Post-Deployment

### Verify Deployment

1. **Check Dashboard**:
   - Visit: `https://your-app.vercel.app/dashboard/canary`
   - Should show metrics (or mock data if agent not accessible)

2. **Check API**:
   - Visit: `https://your-app.vercel.app/api/metrics`
   - Should return JSON with metrics

3. **Check Logs**:
   - Vercel Dashboard → Project → Logs
   - Look for any errors

### Troubleshooting

**Issue**: Metrics not loading
- **Solution**: Check if agent URL is accessible from Vercel
- **Fallback**: Dashboard will show mock data

**Issue**: Build fails
- **Solution**: Check build logs in Vercel
- **Common**: Missing environment variables, TypeScript errors

**Issue**: API route 500 error
- **Solution**: Check function logs in Vercel
- **Common**: Network timeout, CORS issues

## 📊 Access Points After Deployment

**Production URLs**:
- Dashboard: `https://your-app.vercel.app/dashboard/canary`
- API: `https://your-app.vercel.app/api/metrics`
- Home: `https://your-app.vercel.app/`

**Local (for development)**:
- Dashboard: `http://localhost:3000/dashboard/canary`
- Grafana: `http://localhost:3001`
- Agent: `http://localhost:18080/health`

## 🎯 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Verify dashboard loads
3. ✅ Check metrics display
4. ✅ Monitor canary validation
5. ✅ Review after 4-8 hours (AI-accelerated)

---

**Status**: Ready to Deploy! 🚀

