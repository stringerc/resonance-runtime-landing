export default function AgentOperationsPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">Agent Operations</p>
          <h1 className="text-3xl font-bold text-neutral-50">Production Operations Guide</h1>
          <p className="text-lg text-neutral-300">
            Keep the Resonance agent healthy in production with daily checks, update runbooks, and incident response playbooks.
          </p>
        </header>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-3">
          <h2 className="text-xl font-semibold text-neutral-50">Daily Checks</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li>Ensure <code>/health</code> responds <code>200</code> with current version and commit hash.</li>
            <li>Review <code>/metrics</code> for recent R(t), entropy, latency, and tail distributions.</li>
            <li>Confirm dashboard status strip reports uptime &gt; 95% over the last 24 hours.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-3">
          <h2 className="text-xl font-semibold text-neutral-50">Updating the Agent</h2>
          <ol className="list-decimal list-inside text-sm text-neutral-300 space-y-1">
            <li>Implement code changes in the <code>resonance/agent</code> workspace.</li>
            <li>Run <code>npm run build:agent-binaries</code> to produce cross-platform archives.</li>
            <li>Tag the release (<code>git tag agent-vX.Y.Z && git push --tags</code>) to trigger GitHub Actions.</li>
            <li>Render redeploys the backend and serves the new build artifacts.</li>
            <li>Agents poll <code>RESONANCE_UPDATE_MANIFEST_URL</code> and stage updates automatically.</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-3">
          <h2 className="text-xl font-semibold text-neutral-50">Auto-update Flow</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li>Polling cadence: <code>RESONANCE_UPDATE_INTERVAL_MS</code> (default 30 minutes).</li>
            <li>New versions download to <code>RESONANCE_UPDATE_STAGING_DIR</code>.</li>
            <li>Apply staged updates via <code>resonance-agent --install-staged-update</code>.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-3">
          <h2 className="text-xl font-semibold text-neutral-50">Scaling Intake</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li>Run multiple agent instances behind a load balancer; stick sessions by API key.</li>
            <li>Separate <code>RESONANCE_INTAKE_API_KEY</code> from dashboard key for least privilege.</li>
            <li>Use the bench harness (<code>--with-latency</code>) to stress test throughput before go-live.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-3">
          <h2 className="text-xl font-semibold text-neutral-50">Incident Response</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li>Confirm adaptive mode is enabled (policy defaults to <code>adaptive</code>).</li>
            <li>Stream additional phase samples if coherence drops below 0.30.</li>
            <li>Capture latency percentiles when Tail Health triggers warnings.</li>
            <li>Investigate entropy spikes by verifying upstream clock sync and sampling intervals.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-3">
          <h2 className="text-xl font-semibold text-neutral-50">Security</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li>API keys validated via constant-time comparison in <code>security.ts</code>.</li>
            <li>Middleware enforces CSP, HSTS, and COOP/COEP headers.</li>
            <li>Review <code>docs/SECURITY_BASELINE.md</code> for a full breakdown.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-3">
          <h2 className="text-xl font-semibold text-neutral-50">Useful Commands</h2>
          <pre className="overflow-x-auto rounded-lg bg-surface-800 p-4 text-xs text-neutral-200">
            <code>{`# Validate health endpoint
curl https://syncscript-backend.onrender.com/health

# Feed synthetic phases
node resonance/bench/feed_phases.js --interval 1000 --count 600

# Tail latency smoke test
node resonance/bench/feed_phases.js --with-latency --interval 1000 --count 300`}</code>
          </pre>
        </section>

        <footer className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-5 text-sm text-brand-100">
          Record operational updates in <code>docs/PHASE5_QA_RESULTS.md</code> after each release and notify the team via Intercom or ops@resonance.dev for escalations.
        </footer>
      </div>
    </div>
  );
}
