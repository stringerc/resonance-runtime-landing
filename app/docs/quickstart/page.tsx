export default function QuickstartPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">Quickstart</p>
          <h1 className="text-3xl font-bold text-neutral-50">Resonance Quickstart</h1>
          <p className="text-lg text-neutral-300">
            Spin up the Resonance stack, stream live phase and latency metrics, and deploy updates confidently with this end-to-end checklist.
          </p>
        </header>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">1. Prerequisites</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li>Node.js 18 or newer</li>
            <li>Access to your Resonance Vercel (frontend) and Render (agent) deployments</li>
            <li>Agent API key (`RESONANCE_API_KEY`) and optional intake key</li>
            <li>Stripe publishable + secret keys for checkout flows</li>
            <li>Redis URL (Upstash or self-hosted) if rate limiting is enabled</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">2. Clone & Install</h2>
          <pre className="overflow-x-auto rounded-lg bg-surface-800 p-4 text-xs text-neutral-200">
            <code>{`git clone https://github.com/stringerc/resonance-runtime-landing.git
cd resonance-runtime-landing
npm install`}</code>
          </pre>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">3. Configure Environment</h2>
          <p className="text-sm text-neutral-300">
            Create <code>.env.local</code> with the required configuration:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-surface-800 p-4 text-xs text-neutral-200">
            <code>{`NEXTAUTH_URL=https://resonance.syncscript.app
NEXTAUTH_SECRET=generate-a-random-secret
DATABASE_URL=postgres://...
RESONANCE_AGENT_URL=https://syncscript-backend.onrender.com
RESONANCE_AGENT_VERSION=v1.0.0
RESONANCE_RELEASE_CHANNEL=stable
RESONANCE_API_KEY=your-agent-key
NEXT_PUBLIC_INTERCOM_APP_ID=...`}</code>
          </pre>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">4. Database Setup (Optional Demo Data)</h2>
          <pre className="overflow-x-auto rounded-lg bg-surface-800 p-4 text-xs text-neutral-200">
            <code>{`npx prisma migrate deploy
npx prisma db seed`}</code>
          </pre>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">5. Run Locally</h2>
          <pre className="overflow-x-auto rounded-lg bg-surface-800 p-4 text-xs text-neutral-200">
            <code>{`npm run dev`}</code>
          </pre>
          <p className="text-sm text-neutral-300">
            Visit <code>http://localhost:3000</code>, sign in, and follow the onboarding checklist to enable adaptive mode, stream phase samples, and report latency percentiles.
          </p>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">6. Deploy Updates</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li>Push to <code>main</code> for Vercel to rebuild the frontend.</li>
            <li>Tag agent releases (e.g. <code>git tag agent-v1.0.0 && git push --tags</code>) to trigger GitHub Actions for desktop binaries.</li>
            <li>Redeploy Render (`syncscript-backend`) after agent changes.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">7. Verify Metrics</h2>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
            <li><code>/dashboard/canary</code> for live R(t) and compliance.</li>
            <li><code>/dashboard/resonance-calculus</code> for deep analysis and AI insights.</li>
            <li>Dashboard status strip for agent version, channel, and uptime.</li>
          </ul>
        </section>

        <footer className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-5 text-sm text-brand-100">
          Need more depth? Continue with the Phase Intake and Latency Feed guides or open Intercom to chat with the ops team.
        </footer>
      </div>
    </div>
  );
}
