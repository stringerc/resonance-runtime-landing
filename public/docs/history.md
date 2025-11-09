# Resonance Project History

## Origins
- **2024 Q2** – Resonance Calculus conceived to evaluate synchrony across distributed systems using Kuramoto coupling and EVT tail analysis.
- **2024 Q3** – First `resonance-calculus-results` GitHub Pages prototype with mock data and manual updates.
- **2024 Q4** – Separation into `resonance-results-public` repository, introduction of live metrics pulled from the Render agent.

## 2025 modernization
- **Phase 1** – Lint/type cleanup, security headers, and design token foundation aligned with syncscript aesthetic.
- **Phase 2** – Dashboard navigation overhaul, consistent chrome, onboarding checklist, and status strip.
- **Phase 3** – AI-powered insights, dynamic glossary, live history persistence, and latency feed alerts.
- **Phase 4** – Guided onboarding wizard, data completeness banners, Trust Center documentation.
- **Phase 5** – Desktop agent auto-updates, signing guidance, health snapshot exporter, QA automation.

## Current architecture
- **Frontend** – Next.js 14 on Vercel, dark surface UI, Intercom assistant, strong CSP.
- **Backend** – Resonance agent (Node + TypeScript) on Render with adaptive tuning, `/intake/phase`, latency feed, and Prometheus metrics.
- **Desktop** – `pkg`-based binaries for macOS, Linux, and Windows; installers scripted with WiX/pkgbuild/fpm; auto-update manifest hosted on GitHub Releases.

## Roadmap highlights
- Phase 6 (in-progress): automated Grafana dashboards and SLA-driven alerting.
- Phase 7: multi-tenant licensing, enterprise SSO, and adaptive band personalization.

For tactical to-dos see `docs/PHASE5_ROADMAP.md`. Contributions welcome via PRs on `stringerc/resonance-runtime-landing`.
