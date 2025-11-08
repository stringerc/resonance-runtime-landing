import Link from "next/link";

const checklistItems = [
  {
    title: "Enable Adaptive Mode",
    description: "Ensure the Resonance agent is running with RESONANCE_MODE=adaptive.",
    href: "/docs/agent-setup",
    doneKey: "adaptive",
  },
  {
    title: "Stream Phase Samples",
    description: "Feed real phase traces (SDK or bench feeder) until R(t) stabilises.",
    href: "/docs/phase-intake",
    doneKey: "phase",
  },
  {
    title: "Provide Latency Percentiles",
    description: "Send p50/p95/p99 latency to unlock Tail Health and Timing metrics.",
    href: "/docs/latency-feed",
    doneKey: "latency",
  },
  {
    title: "Build History",
    description: "Keep monitoring open to capture at least 24h of samples for band compliance.",
    href: "/docs/history",
    doneKey: "history",
  },
];

const statusIcon = (done?: boolean) =>
  done ? (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
      ✓
    </span>
  ) : (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-surface-700 text-neutral-500">
      •
    </span>
  );

interface OnboardingChecklistProps {
  completedSteps?: Partial<Record<"adaptive" | "phase" | "latency" | "history", boolean>>;
}

export default function OnboardingChecklist({ completedSteps = {} }: OnboardingChecklistProps) {
  return (
    <div className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-50">Get In Tune</h2>
          <p className="text-sm text-neutral-400">
            Finish these steps to unlock full Resonance insights.
          </p>
        </div>
        <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-200">
          Guided Setup
        </span>
      </div>
      <ul className="space-y-4">
        {checklistItems.map((item) => {
          const done = completedSteps[item.doneKey as keyof typeof completedSteps];
          return (
            <li
              key={item.title}
              className="flex items-start gap-3 rounded-xl border border-surface-800/60 bg-surface-900/60 p-4"
            >
              {statusIcon(done)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-100">{item.title}</h3>
                  <Link
                    href={item.href}
                    className="text-xs text-brand-200 hover:underline"
                  >
                    View guide
                  </Link>
                </div>
                <p className="mt-1 text-xs text-neutral-400">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 rounded-xl border border-brand-500/20 bg-brand-500/10 px-4 py-3 text-xs text-brand-100">
        Tip: Once all steps are completed, band compliance will stabilise above 85% and dashboards
        will show real latency intelligence.
      </div>
    </div>
  );
}

