import Link from "next/link";

const steps = [
  {
    title: "1. Capture percentile metrics",
    body:
      "Collect p50, p95, p99 (and optionally p99.9) latency metrics from your gateway or service mesh. The agent consumes millisecond values per time window.",
  },
  {
    title: "2. Use the SDK helper",
    body:
      "Call `sdk.metrics.recordLatency({ p50, p95, p99 })` in your service or batch exporter. The SDK handles schema validation and authentication.",
  },
  {
    title: "3. Stream on the same cadence as phase data",
    body:
      "Aim for minute-level updates so tail health and timing score can react quickly to regressions. Ensure timestamps align with the agent clock (UTC recommended).",
  },
  {
    title: "4. Validate intake",
    body:
      "Check `/dashboard/resonance-calculus` and the AI insights panel. Once data arrives, Tail Health and Timing Score cards switch from warnings to live values.",
  },
  {
    title: "5. Automate alerts",
    body:
      "Use your observability tooling to trigger the SDK export when latency SLAs breach, ensuring Resonance has fresh data during incidents.",
  },
];

export default function LatencyFeedPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">Latency Feed</p>
          <h1 className="text-3xl font-bold text-neutral-50">Streaming Tail Latency Percentiles</h1>
          <p className="text-lg text-neutral-300">
            Tail latency powers Tail Health, Timing Score, and latency insights. Follow these steps to integrate percentile metrics with the Resonance agent intake API.
          </p>
        </header>

        <section className="space-y-5">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
              <h2 className="text-lg font-semibold text-neutral-50">{step.title}</h2>
              <p className="mt-2 text-sm text-neutral-300">{step.body}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-lg font-semibold text-neutral-50">Related Resources</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/docs/agent-setup" className="text-brand-200 hover:text-brand-100">
                Agent setup checklist
              </Link>
            </li>
            <li>
              <Link href="/docs/phase-intake" className="text-brand-200 hover:text-brand-100">
                Phase intake integration
              </Link>
            </li>
            <li>
              <Link href="https://github.com/stringerc/resonance-runtime-landing/tree/main/sdk" target="_blank" rel="noreferrer" className="text-brand-200 hover:text-brand-100">
                Resonance JavaScript SDK
              </Link>
            </li>
          </ul>
        </section>

        <footer className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-5 text-sm text-brand-100">
          Need support? Email <a className="underline" href="mailto:ops@resonance.dev">ops@resonance.dev</a> or open Intercom from the dashboard.
        </footer>
      </div>
    </div>
  );
}
