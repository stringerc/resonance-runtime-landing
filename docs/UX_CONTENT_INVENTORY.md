# Resonance Runtime – UX Content Inventory

This inventory captures the current information architecture, critical user tasks, and data dependencies across the Resonance runtime experience. Use it as the source of truth when translating the product into a refreshed UX/UI direction (e.g., Figma redesign inspired by syncscript.app).

## 1. High-Level Structure

- **Public marketing surface** (`/`)
  - Hero, feature grid, CTA, footer navigation stubs. ([app/page.tsx](../app/page.tsx))
- **Authentication** (`/auth/signin`, `/auth/signup`, `/auth/forgot-password`)
  - Dark-surface forms aligned with dashboard styling. ([app/auth/*](../app/auth))
- **Dashboard shell** (wrapper for all protected routes)
  - Sticky top nav + sidebar, status strip, license + agent telemetry. ([app/dashboard/layout.tsx](../app/dashboard/layout.tsx), [components/dashboard/DashboardChrome.tsx](../components/dashboard/DashboardChrome.tsx))
- **Core dashboards**
  - Overview (`/dashboard`)
  - Canary Mode (`/dashboard/canary`)
  - Resonance Calculus (`/dashboard/resonance-calculus`)
- **Documentation hub** (`/docs` and child routes)
  - Index page + individual guides (Quickstart, Agent Setup, Phase Intake, Latency Feed, Trust Center, etc.). ([app/docs](../app/docs))
- **Commerce**
  - Resonance pricing (`/resonance/pricing`) and shared `/pricing` page. ([app/resonance/pricing/page.tsx](../app/resonance/pricing/page.tsx))
- **Support/Contact** (`/contact`), Trust Center (`/docs/trust`), and onboarding utilities (wizard, data alerts).

## 2. Detailed Page & Module Inventory

### 2.1 Home / Marketing (`/`)
- **Hero**: headline, subheading, dual CTA (Start Free Trial / View Pricing). Dynamic CTA if user signed in. ([app/page.tsx](../app/page.tsx))
- **Feature Cards**: Real-Time Monitoring, Advanced Analytics, Enterprise Security (icon + title + body).
- **CTA Banner**: Encourages signup (if anonymous).
- **Footer**: Multi-column nav placeholders for future marketing content (Product, Company, Legal, Support).

### 2.2 Auth Flows
- **Sign-in** (`/auth/signin`)
  - Dark mode aesthetic matching dashboard. Fields: email, password; forgot password link.
  - Error handling for credential failures (NextAuth). ([app/auth/signin/page.tsx](../app/auth/signin/page.tsx))
- **Sign-up** (`/auth/signup`)
  - Collects name, email, password, company (if available) with legal copy. ([app/auth/signup/page.tsx](../app/auth/signup/page.tsx))
- **Forgot password** (`/auth/forgot-password`)
  - Email capture, success state, CTA back to sign-in. ([app/auth/forgot-password/page.tsx](../app/auth/forgot-password/page.tsx))

### 2.3 Dashboard Shell (All protected routes)
- **Navigation**: `Overview`, `Canary Mode`, `Resonance Calculus`, `Docs` (link to `/docs`). ([app/dashboard/layout.tsx](../app/dashboard/layout.tsx))
- **Status Strip** (below nav): displays license label, last sample time, agent URL/version, release channel, uptime percentage. ([components/dashboard/DashboardStatusStrip.tsx](../components/dashboard/DashboardStatusStrip.tsx))
- **Global components**: `OnboardingLauncher`, `DataAlerts`, Intercom launcher, trust status card.

### 2.4 Dashboard Overview (`/dashboard`)
- **Hero copy**: “Welcome back” with user name/email.
- **Onboarding column** (right): `OnboardingChecklist` (adaptive mode, phase feed, latency feed, history) + `OnboardingLauncher`. ([components/dashboard/OnboardingChecklist.tsx](../components/dashboard/OnboardingChecklist.tsx))
- **License Status card**: plan label, status, renewal, usage metrics.
- **Health Overview**: `ResonanceInsights` component in summary mode, sparklines for R(t), spectral entropy, coherence, tail health, p99 latency. ([components/ResonanceInsights.tsx](../components/ResonanceInsights.tsx))
- **Recent Metrics**: chronological cards with key values.
- **HealthSnapshotExporter**: JSON/CSV export, CLI commands for verification. ([components/dashboard/HealthSnapshotExporter.tsx](../components/dashboard/HealthSnapshotExporter.tsx))
- **Payments**: Latest Stripe payments if available.

### 2.5 Canary Mode (`/dashboard/canary`)
- **Metric hero**: current R(t), last sample message, compliance band callout.
- **Time-range controls**: 5m, 1h, 24h, 7d. History persistence via `localStorage`. ([app/dashboard/canary/page.tsx](../app/dashboard/canary/page.tsx))
- **SVG chart**: scatter plot with line segments connecting contiguous data, missing data messaging.
- **ResonanceInsights side panel**: dynamic commentary on R(t), compliance, entropy, tail health, p99.
- **Tuning checklist**: ensures adaptive mode, phase stream, latency feed.
- **Data Alerts**: missing latency, sparse samples, incomplete history.

### 2.6 Resonance Calculus (`/dashboard/resonance-calculus`)
- **Top metrics**: R(t), coherence, tail health, timing score, spectral entropy with explanations.
- **Band compliance summary**: % in optimal band, sample count.
- **Charts**: R(t) history, latency percentiles, spectral entropy trend.
- **AI Insights**: `ResonanceInsights` panel providing actionable suggestions, status badges (good/warning/critical).
- **Latency Feed messaging**: ensures p99/p50 data present, instructions when missing.
- **Dossier link**: local markdown served via `/docs/resonance-calculus-dossier.md`.

### 2.7 Docs Hub (`/docs`)
- **Grid of guides** linking to:
  - Quickstart (`/docs/quickstart`)
  - Agent Setup (`/docs/agent-setup`)
  - Trust Center (`/docs/trust`)
  - Resonance Calculus dossier (`/docs/resonance-calculus-dossier.md`)
  - Phase Intake (`/docs/phase-intake`)
  - Latency Feed (`/docs/latency-feed`)
  - Agent Operations (`/docs/agent-operations`)
  - Security Baseline (`/docs/SECURITY_BASELINE.md`)
  - Design Tokens (`/docs/DESIGN_TOKENS.md`)
- Guides built as React pages (Quickstart, Agent Operations, History, Phase Intake, Latency Feed) or static markdown under `public/docs`.

### 2.8 Docs Detail Pages
- **Quickstart** (`/docs/quickstart`): environment setup, deploy steps, metric verification. ([app/docs/quickstart/page.tsx](../app/docs/quickstart/page.tsx))
- **Agent Operations** (`/docs/agent-operations`): daily checks, updating agent, incident response. ([app/docs/agent-operations/page.tsx](../app/docs/agent-operations/page.tsx))
- **History** (`/docs/history`): timeline + roadmap context. ([app/docs/history/page.tsx](../app/docs/history/page.tsx))
- **Agent Setup** (`/docs/agent-setup`): provisioning checklist. ([app/docs/agent-setup/page.tsx](../app/docs/agent-setup/page.tsx))
- **Phase Intake** and **Latency Feed** (recent additions). ([app/docs/phase-intake/page.tsx](../app/docs/phase-intake/page.tsx), [app/docs/latency-feed/page.tsx](../app/docs/latency-feed/page.tsx))
- **Trust Center** (`/docs/trust`): security, compliance, operational transparency. ([app/docs/trust/page.tsx](../app/docs/trust/page.tsx))
- **Static Markdown assets**: security baseline, design tokens, desktop agent guides, quick-export history. (See [public/docs](../public/docs)).

### 2.9 Commerce & Subscription
- **Resonance Pricing (`/resonance/pricing`)**
  - Plan cards with dynamic CTA (“Current plan”, “Upgrade”, “Downgrade”) based on Stripe data. ([app/resonance/pricing/page.tsx](../app/resonance/pricing/page.tsx))
  - `ResonanceCheckoutButton` variations with `label` + disabled state. ([components/CheckoutButton.tsx](../components/CheckoutButton.tsx))
- **Shared Pricing (`/pricing`)** and `/syncscript/pricing`
  - Marketing copy, plan comparison, CTA buttons.

### 2.10 Support & Misc
- **Contact** (`/contact`): Form, support info. ([app/contact/page.tsx](../app/contact/page.tsx))
- **Docs/Trust**: includes references to `HealthSnapshotExporter`, security posture.
- **OnboardingWizard**: multi-step modal stored in `localStorage`. ([components/onboarding/OnboardingWizard.tsx](../components/onboarding/OnboardingWizard.tsx))

## 3. Component-Level Summary

| Component | Purpose | Key Props / States | Source |
| --- | --- | --- | --- |
| `ResonanceInsights` | AI-style guidance for metrics | `metrics`, `history`, `latencyPresent` | [components/ResonanceInsights.tsx](../components/ResonanceInsights.tsx)
| `OnboardingChecklist` | Step tracker for data completeness | `completedSteps` object | [components/dashboard/OnboardingChecklist.tsx](../components/dashboard/OnboardingChecklist.tsx)
| `OnboardingLauncher` | CTA to open wizard | `checklistStatus` | [components/onboarding/OnboardingLauncher.tsx](../components/onboarding/OnboardingLauncher.tsx)
| `DataAlerts` | Alerts for missing feeds | Metrics history arrays | [components/onboarding/DataAlerts.tsx](../components/onboarding/DataAlerts.tsx)
| `DashboardStatusStrip` | Agent + license telemetry | `licenseLabel`, `lastSampleAt`, `uptimePercentage` | [components/dashboard/DashboardStatusStrip.tsx](../components/dashboard/DashboardStatusStrip.tsx)
| `HealthSnapshotExporter` | Download JSON/CSV bundles | `metrics`, `agentUrl`, `agentVersion` | [components/dashboard/HealthSnapshotExporter.tsx](../components/dashboard/HealthSnapshotExporter.tsx)
| `Metric charts` | SVG-based R(t) & percentile plots | `history`, `selectedRange` via state | [app/dashboard/canary/page.tsx](../app/dashboard/canary/page.tsx), [app/dashboard/resonance-calculus/page.tsx](../app/dashboard/resonance-calculus/page.tsx)

## 4. Data & Integrations

- **Metrics backend**: `/app/api/metrics/route.ts` proxies Render agent, returns R(t), spectral entropy, coherence, tail health, timing score, latency percentiles, metadata (version/channel/commit). Uses Prisma `userMetric` table for history persistence. ([app/api/metrics/route.ts](../app/api/metrics/route.ts))
- **Stripe**: Checkout, plan status, webhook handling for licenses. Relevant modules in `app/api/stripe/*`, `lib/stripe/*`.
- **Authentication**: NextAuth with credentials provider, optional MFA flag (`mfaRequired`). Config in `lib/auth/config.ts` and `types/next-auth.d.ts`.
- **Intercom**: Script injection in layout, CSP allowances in `middleware.ts`.
- **Design system**: Tailwind tokens defined in [tailwind.config.js](../tailwind.config.js) and document in [docs/DESIGN_TOKENS.md](./DESIGN_TOKENS.md).

## 5. Known UX Gaps / Opportunities

1. **Visual coherence**: Landing page still uses light gradient vs. dark dashboard aesthetic; needs syncscript-inspired polish.
2. **Navigation clarity**: Public pages (pricing, features, docs) share global nav? Consider consistent top-level nav + onboarding CTA.
3. **Docs discoverability**: Markdown links open raw files; design new docs layout with breadcrumb, hero, TOC.
4. **Graphs**: Provide standard empty states, highlight trend lines vs. dots, annotate compliance band visually.
5. **Mobile responsiveness**: Validate all dashboards for narrow breakpoints; restructure insights vs. charts stacking.
6. **Trust & compliance**: Surface security baseline + design tokens in marketing site for transparency.
7. **Integrations**: Link to desktop agent downloads, update manifests from dashboard.

## 6. Deliverables for UX/UI Redesign

- **Site map & content hierarchy** (this document).
- **User flows**: onboarding (new user), tuning (engineer), subscription upgrade (buyer).
- **Component library mapping**: tokens, typography, spacing, interactive states.
- **Design references**: Syncscript.app (glassmorphism, dark surfaces, gradients) + enterprise analytics patterns.
- **Documentation alignment**: ensure each doc page has defined hero, left nav, content body with code blocks.

Use this inventory to scope Figma frames, design variants, and new interactions without missing backend-driven data or compliance requirements. Refer back to the cited source files when deciding layout constraints or functional expectations.
