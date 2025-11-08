'use client';

import Link from 'next/link';

const trustHighlights = [
  {
    title: 'Security Baseline',
    description:
      'Strict Content Security Policy, HSTS, frame protections, and hardened cookies mirror OWASP best practices across every page load.',
    href: '/docs/SECURITY_BASELINE.md',
    cta: 'View security baseline',
  },
  {
    title: 'Signed Desktop Agent',
    description:
      'Platform binaries ship with signing + notarisation guidance for macOS, Authenticode for Windows, and GPG for Linux plus staged auto-update manifests.',
    href: '/docs/desktop-agent/SIGNING_AND_INSTALLERS.md',
    cta: 'Review signing guide',
  },
  {
    title: 'Auto-Update Safeguards',
    description:
      'Incremental updates are SHA256 verified, staged, and never applied silently—operators choose when to promote a download.',
    href: '/docs/desktop-agent/AUTO_UPDATE.md',
    cta: 'Inspect update workflow',
  },
];

const contactGuidelines = [
  {
    label: 'Incident response',
    value: 'ops@resonance.dev — 24/7 pager for production-impacting events',
  },
  {
    label: 'Security disclosures',
    value: 'security@resonance.dev — PGP key fingerprint 3F8A 1C24 9BA5 0C12',
  },
  {
    label: 'Status page',
    value: 'https://status.resonance.dev (mirrors uptime feed from dashboard export)',
  },
];

export default function TrustCenterPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">Trust Center</p>
          <h1 className="text-3xl font-bold text-neutral-50">Operational guarantees & security posture</h1>
          <p className="text-lg text-neutral-400">
            Resonance is designed for production incident response. This hub summarises the controls already in-place—security headers,
            signed desktop payloads, transparent updates—and where to escalate questions.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {trustHighlights.map((item) => (
            <div key={item.title} className="rounded-2xl border border-surface-800 bg-surface-900/80 p-5 shadow-brand-glow">
              <h2 className="text-lg font-semibold text-neutral-50">{item.title}</h2>
              <p className="mt-2 text-sm text-neutral-400">{item.description}</p>
              <Link
                href={item.href}
                className="mt-4 inline-flex items-center text-sm font-semibold text-brand-200 hover:text-brand-100"
              >
                {item.cta} →
              </Link>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
          <h2 className="text-xl font-semibold text-neutral-50">Security in depth</h2>
          <p className="mt-3 text-sm text-neutral-400">
            Every deployment inherits the baseline documented above: TLS-only session cookies, constant-time API key checks, and CSP rules that
            explicitly admit Intercom, Stripe, and Resonance-controlled origins. Dashboard releases are versioned and tagged; the agent exposes version
            metadata so you can confirm what is running directly from the UI.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-surface-700 bg-surface-900/70 p-4">
              <h3 className="text-sm font-semibold text-neutral-100">Desktop agent protections</h3>
              <ul className="mt-2 space-y-2 text-xs text-neutral-400">
                <li>• SHA256 manifest published alongside every build artifact.</li>
                <li>• macOS notarisation + hardened runtime, Windows Authenticode signing.</li>
                <li>• Linux packaging hooks for post-install + post-remove checks.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-surface-700 bg-surface-900/70 p-4">
              <h3 className="text-sm font-semibold text-neutral-100">Platform runtime controls</h3>
              <ul className="mt-2 space-y-2 text-xs text-neutral-400">
                <li>• Rate limiting gracefully degrades when Redis is unavailable—no crash loops.</li>
                <li>• Auth cookies configured with Secure, HttpOnly, and SameSite=Lax in production.</li>
                <li>• CSP forbids third-party execution outside vetted analytics & support tooling.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
          <h2 className="text-xl font-semibold text-neutral-50">Contact & escalation</h2>
          <p className="mt-3 text-sm text-neutral-400">
            For urgent issues you can page the operations desk directly. Non-urgent security questions are triaged within one business day.
          </p>
          <div className="mt-4 space-y-3">
            {contactGuidelines.map((item) => (
              <div key={item.label} className="rounded-lg border border-surface-700 bg-surface-900/70 p-3 text-sm text-neutral-300">
                <span className="font-semibold text-neutral-100">{item.label}:</span> {item.value}
              </div>
            ))}
          </div>
        </section>

        <footer className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-5 text-sm text-brand-100">
          Looking for deployment hardening steps? Follow the
          <Link href="/docs/desktop-agent/README.md" className="ml-1 text-brand-50 underline hover:text-brand-100">
            desktop agent operations guide
          </Link>
          , or export an audit bundle right from the dashboard Trust Center panel.
        </footer>
      </div>
    </div>
  );
}
