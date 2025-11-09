import Link from "next/link";

const checklist = [
  {
    title: "1. Connect to the agent intake endpoint",
    body:
      "Phase samples are ingested via POST /intake/phase on the agent. Ensure RESONANCE_API_KEY is configured and include it as the Authorization Bearer token.",
  },
  {
    title: "2. Capture phase offsets",
    body:
      "Each sample should contain the service identifier, timestamp, and current phase offset (radians). Use the SDK helper `sdk.metrics.recordPhase(...)` or your own instrumentation.",
  },
  {
    title: "3. Stream at steady intervals",
    body:
      "Aim for at least one phase sample per service every 60 seconds while tuning. Higher frequency sampling accelerates band compliance stabilization.",
  },
  {
    title: "4. Use the bench harness for testing",
    body:
      "`node resonance/bench/feed_phases.js --count 120 --interval 1000` will simulate traffic and confirm the intake key is accepted before you connect production systems.",
  },
  {
    title: "5. Monitor dashboards",
    body:
      "R(t), band compliance, and coherence scores will respond within minutes once samples flow. Leave the dashboard tab open to build historical context.",
  },
];

export default function PhaseIntakePage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">Phase Intake</p>
          <h1 className="text-3xl font-bold text-neutral-50">Feeding Phase Samples</h1>
          <p className="text-lg text-neutral-300">
            Phase samples are the foundation for Resonance Calculus metrics. Follow this checklist to integrate the SDK or feed harness and keep your controller tuned.
          </p>
        </header>

        <section className="space-y-5">
          {checklist.map((item) => (
            <div key={item.title} className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
              <h2 className="text-lg font-semibold text-neutral-50">{item.title}</h2>
              <p className="mt-2 text-sm text-neutral-300">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-lg font-semibold text-neutral-50">Helpful Resources</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/docs/agent-setup" className="text-brand-200 hover:text-brand-100">
                Agent setup checklist
              </Link>
            </li>
            <li>
              <Link href="/docs/latency-feed" className="text-brand-200 hover:text-brand-100">
                Latency feed integration
              </Link>
            </li>
            <li>
              <Link href="https://github.com/stringerc/resonance-runtime-landing/tree/main/resonance/bench" target="_blank" rel="noreferrer" className="text-brand-200 hover:text-brand-100">
                Bench harness scripts
              </Link>
            </li>
          </ul>
        </section>

        <footer className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-5 text-sm text-brand-100">
          Questions while integrating? Email <a className="underline" href="mailto:ops@resonance.dev">ops@resonance.dev</a> or open Intercom from the dashboard.
        </footer>
      </div>
    </div>
  );
}
