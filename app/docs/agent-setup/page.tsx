import Link from "next/link";

const steps = [
  {
    title: "1. Provision the agent host",
    description:
      "Choose a Linux or macOS host with outbound HTTPS access. Allocate at least 2 vCPU, 4 GB RAM, and storage for logs. For production, pin to a systemd service user.",
  },
  {
    title: "2. Configure environment variables",
    description:
      "Set RESONANCE_MODE=adaptive, RESONANCE_API_KEY, and any Stripe/Intercom keys. Copy the `.env.example` from the repository and customize for your environment.",
  },
  {
    title: "3. Install dependencies",
    description:
      "Install Node.js 18+, pkg, and the Resonance agent repository. Run `npm install` followed by `npm run build` to emit TypeScript artifacts.",
  },
  {
    title: "4. Launch the agent",
    description:
      "Start the agent via `npm run start:agent` or the compiled binary. Verify health endpoints at `/health` and `/metrics` with your API key." ,
  },
  {
    title: "5. Stream phase & latency data",
    description:
      "Use the SDK or bench scripts to feed phase samples (`bench/feed_phases.js`) and latency percentiles. Monitor band compliance in the dashboards.",
  },
  {
    title: "6. Enable auto-updates",
    description:
      "Deploy the auto-update manifest and configure the agent with `RESONANCE_UPDATE_MANIFEST_URL`. Ensure file permissions allow staging updates.",
  },
];

export default function AgentSetupPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">Agent Setup</p>
          <h1 className="text-3xl font-bold text-neutral-50">Deploying the Resonance Agent</h1>
          <p className="text-lg text-neutral-300">
            Follow these steps to install and tune the Resonance agent in your environment. Once completed, you can stream real traffic, build history, and unlock the full suite of Resonance Calculus dashboards.
          </p>
        </header>

        <section className="space-y-5">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
              <h2 className="text-lg font-semibold text-neutral-50">{step.title}</h2>
              <p className="mt-2 text-sm text-neutral-300">{step.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-lg font-semibold text-neutral-50">Related Guides</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/docs/phase-intake" className="text-brand-200 hover:text-brand-100">
                Feeding phase samples & tuning
              </Link>
            </li>
            <li>
              <Link href="/docs/latency-feed" className="text-brand-200 hover:text-brand-100">
                Streaming latency percentiles
              </Link>
            </li>
            <li>
              <Link href="/docs/desktop-agent/README.md" className="text-brand-200 hover:text-brand-100">
                Desktop agent operations
              </Link>
            </li>
            <li>
              <Link href="/docs/AUTO_UPDATE.md" className="text-brand-200 hover:text-brand-100">
                Auto-update manifest & rollout
              </Link>
            </li>
          </ul>
        </section>

        <footer className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-5 text-sm text-brand-100">
          Need help? Reach out at <a className="underline" href="mailto:ops@resonance.dev">ops@resonance.dev</a> or open the Intercom widget from any dashboard screen.
        </footer>
      </div>
    </div>
  );
}
