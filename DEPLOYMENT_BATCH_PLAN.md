# 📦 Batch Upload Plan

## ✅ Already Uploaded (6 files)
1. webapp/next.config.js ✅
2. webapp/package.json ✅
3. webapp/tailwind.config.js ✅
4. webapp/postcss.config.js ✅
5. webapp/app/providers.tsx ✅
6. webapp/app/globals.css ✅

## 🔄 Next Priority Files

### Core App Files
- [ ] webapp/app/layout.tsx (retry - had race condition)
- [ ] webapp/app/page.tsx (encoded, ready)
- [ ] webapp/tsconfig.json (retry)
- [ ] webapp/middleware.ts (retry with correct encoding)

### API Routes (Critical)
- [ ] webapp/app/api/auth/[...nextauth]/route.ts
- [ ] webapp/app/api/auth/register/route.ts
- [ ] webapp/app/api/checkout/create/route.ts
- [ ] webapp/app/api/test-db/route.ts
- [ ] webapp/app/api/webhooks/stripe/route.ts

### Pages
- [ ] webapp/app/dashboard/page.tsx
- [ ] webapp/app/auth/signin/page.tsx
- [ ] webapp/app/auth/signup/page.tsx
- [ ] webapp/app/pricing/page.tsx
- [ ] webapp/app/resonance/pricing/page.tsx
- [ ] webapp/app/syncscript/pricing/page.tsx

### Lib Files
- [ ] webapp/lib/db.ts
- [ ] webapp/lib/auth/password.ts
- [ ] webapp/lib/auth/mfa.ts
- [ ] webapp/lib/auth/rate-limit.ts
- [ ] webapp/lib/stripe/config.ts
- [ ] webapp/lib/stripe/checkout.ts
- [ ] webapp/lib/stripe/webhooks.ts

### Prisma
- [ ] webapp/prisma/schema.prisma

## Strategy
Continue uploading in batches of 3-5 files at a time to avoid rate limits.

**Current Status**: 6/50+ files uploaded

