export default function HistoryPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">Project History</p>
          <h1 className="text-3xl font-bold text-neutral-50">Resonance Timeline</h1>
          <p className="text-lg text-neutral-300">
            Milestones from the initial Resonance Calculus prototype to the current production platform.
          </p>
        </header>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">Origins</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li><strong>2024 Q2</strong> – Resonance Calculus conceived to evaluate synchrony across distributed systems using Kuramoto coupling and EVT tails.</li>
            <li><strong>2024 Q3</strong> – GitHub Pages prototype (`resonance-calculus-results`) published with mock data and manual updates.</li>
            <li><strong>2024 Q4</strong> – Split into <code>resonance-results-public</code> with live metrics sourced from the Render agent.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">2025 Modernization</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li><strong>Phase 1</strong> – Lint/type cleanup, security headers, and design token foundation inspired by syncscript.app.</li>
            <li><strong>Phase 2</strong> – Dashboard chrome overhaul, navigation consistency, onboarding checklist, and status strip.</li>
            <li><strong>Phase 3</strong> – AI-powered insights, persistent history, latency feed alerts, and glossary pane.</li>
            <li><strong>Phase 4</strong> – Guided onboarding wizard, data completeness banners, Trust Center documentation.</li>
            <li><strong>Phase 5</strong> – Desktop agent auto-updates, signing/installer guidance, health snapshot exporter, QA automation.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">Current Architecture</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li><strong>Frontend</strong> – Next.js 14 on Vercel, dark surface UI, Intercom assistant, hardened CSP.</li>
            <li><strong>Backend</strong> – Resonance agent (Node + TypeScript) on Render with adaptive tuning, <code>/intake/phase</code>, latency feed, Prometheus metrics.</li>
            <li><strong>Desktop</strong> – <code>pkg</code>-built binaries, WiX/pkgbuild/fpm installer scripts, auto-update manifest on GitHub Releases.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-3">
          <h2 className="text-xl font-semibold text-neutral-50">Roadmap Highlights</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li><strong>Phase 6</strong> – Automated Grafana dashboards and SLA-driven alerting.</li>
            <li><strong>Phase 7</strong> – Multi-tenant licensing, enterprise SSO, adaptive band personalization.</li>
          </ul>
        </section>

        <footer className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-5 text-sm text-brand-100">
          Track tactical tasks in <code>docs/PHASE5_ROADMAP.md</code> and submit pull requests to <code>stringerc/resonance-runtime-landing</code> to contribute.
        </footer>
      </div>
    </div>
  );
}
