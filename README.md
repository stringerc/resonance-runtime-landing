# Resonance Calculus Enterprise Platform

Enterprise-grade SaaS platform with authentication, payment processing, and user dashboards.

## Features

✅ **Enterprise Authentication**
- NextAuth.js with JWT sessions
- Password hashing (bcrypt, 12+ rounds)
- Multi-factor authentication (TOTP) ready
- Rate limiting and account lockout
- Password strength validation (zxcvbn)

✅ **Stripe Payment Integration**
- Stripe Checkout (PCI-DSS SAQ A compliant)
- Webhook handling with signature verification
- Subscription management
- License activation

✅ **Security**
- OWASP Top 10 compliant
- Security headers (CSP, HSTS, etc.)
- CSRF protection
- SQL injection prevention (Prisma)

✅ **User Dashboard**
- License status
- Metrics display
- User profile management

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Prisma ORM)
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **Styling:** Tailwind CSS
- **Rate Limiting:** Upstash Redis

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
npm run db:generate
npm run db:push

# Run development server
npm run dev
```

## Project Structure

```
webapp/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   └── webhooks/       # Stripe webhooks
│   ├── auth/               # Auth pages (signin, signup)
│   ├── dashboard/          # User dashboard
│   └── pricing/            # Pricing page
├── lib/                     # Utility libraries
│   ├── auth/               # Authentication utilities
│   ├── stripe/             # Stripe integration
│   └── db.ts               # Prisma client
├── prisma/                 # Database schema
├── middleware.ts           # Security headers
└── SETUP.md                # Setup guide
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL
- `NEXTAUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

## Stripe Setup

1. Create products in Stripe dashboard (Basic, Pro, Enterprise)
2. Create prices for each product
3. Add Price IDs to `.env.local`:
   - `STRIPE_PRICE_ID_BASIC`
   - `STRIPE_PRICE_ID_PRO`
   - `STRIPE_PRICE_ID_ENTERPRISE`
4. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, etc.
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Security Features

- **Password Security:** bcrypt with 12+ rounds, zxcvbn validation
- **Rate Limiting:** 5 login attempts per 15 minutes, account lockout
- **Webhook Security:** Stripe signature verification, idempotency
- **Security Headers:** CSP, HSTS, X-Frame-Options, etc.
- **CSRF Protection:** NextAuth.js built-in

## Documentation

- [Setup Guide](./SETUP.md)
- [Security Implementation](../../docs/SECURITY_PAYMENT_IMPLEMENTATION.md)
- [Payment Receiving Guide](../../docs/PAYMENT_RECEIVING_GUIDE.md)
- [Security Summary](../../docs/SECURITY_SUMMARY.md)

## License

ISC

