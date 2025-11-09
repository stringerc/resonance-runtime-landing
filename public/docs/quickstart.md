# Resonance Quickstart

This quickstart walks you from a clean environment to a Resonance dashboard with live phase and latency metrics.

## 1. Prerequisites
- Node.js 18+
- Access to your Resonance workspace (Vercel + Render deploys)
- An API key for the Resonance agent (`RESONANCE_API_KEY`)
- Stripe secret publishable keys (for billing flows)
- Upstash or alternative Redis URL (optional, used for rate limiting)

## 2. Clone the runtime landing repo
```
git clone https://github.com/stringerc/resonance-runtime-landing.git
cd resonance-runtime-landing
npm install
```

## 3. Configure environment variables
Create `.env.local` with the required configuration:
```
NEXTAUTH_URL=https://resonance.syncscript.app
NEXTAUTH_SECRET=generate-a-random-secret
DATABASE_URL=postgres://...
RESONANCE_AGENT_URL=https://syncscript-backend.onrender.com
RESONANCE_AGENT_VERSION=v1.0.0
RESONANCE_RELEASE_CHANNEL=stable
RESONANCE_API_KEY=your-agent-key
NEXT_PUBLIC_INTERCOM_APP_ID=...
```

## 4. Seed the database (optional demo data)
```
npx prisma migrate deploy
npx prisma db seed
```

## 5. Run locally
```
npm run dev
```
Open `http://localhost:3000` and sign in. The onboarding checklist guides you through enabling adaptive mode, streaming phases, and wiring latency percentiles.

## 6. Deploy updates
- Push to `main` for Vercel to rebuild the frontend.
- Tag agent releases (`git tag agent-v1.0.0 && git push --tags`) to trigger GitHub Actions for desktop binaries.
- Redeploy Render (`syncscript-backend`) after agent changes.

## 7. Verify metrics
- `/dashboard/canary` for live R(t) and compliance.
- `/dashboard/resonance-calculus` for deep analysis and AI insights.
- Check the status strip for agent version, channel, and uptime.

Need more detail? Continue with the Phase Intake and Latency Feed guides.
