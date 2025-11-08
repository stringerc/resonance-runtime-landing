"use client";

interface DataAlertsProps {
  hasLatency?: boolean;
  hasPhaseHistory?: boolean;
  historyHours?: number;
  latencyCommand?: string;
  phaseCommand?: string;
}

const AlertCard = ({ heading, body, action }: { heading: string; body: string; action?: React.ReactNode }) => (
  <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
    <h3 className="text-sm font-semibold text-amber-200">{heading}</h3>
    <p className="mt-1 text-xs text-amber-100/80">{body}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

const ClipboardButton = ({ command }: { command: string }) => (
  <button
    type="button"
    onClick={() => navigator.clipboard.writeText(command)}
    className="inline-flex items-center rounded-lg border border-amber-400/40 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/10"
  >
    Copy bench command
  </button>
);

export default function DataAlerts({
  hasLatency,
  hasPhaseHistory,
  historyHours,
  latencyCommand = "node bench/feed_latency.js",
  phaseCommand = "node bench/feed_phases.js",
}: DataAlertsProps) {
  const alerts: React.ReactNode[] = [];

  if (!hasLatency) {
    alerts.push(
      <AlertCard
        key="latency"
        heading="Latency feed missing"
        body="We can’t compute tail health without p50/p95/p99 latency. Stream metrics via the SDK or bench harness."
        action={
          <div className="flex flex-wrap gap-2">
            <a
              href="/docs/latency-feed"
              className="inline-flex items-center rounded-lg border border-amber-400/40 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/10"
            >
              View latency feed guide →
            </a>
            <ClipboardButton command={latencyCommand} />
          </div>
        }
      />
    );
  }

  if (!hasPhaseHistory) {
    alerts.push(
      <AlertCard
        key="phase"
        heading="Phase samples sparse"
        body="Run the phase feeder or keep live traffic streaming so R(t) and coherence stay accurate."
        action={
          <div className="flex flex-wrap gap-2">
            <a
              href="/docs/phase-intake"
              className="inline-flex items-center rounded-lg border border-amber-400/40 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/10"
            >
              Phase intake instructions →
            </a>
            <ClipboardButton command={phaseCommand} />
          </div>
        }
      />
    );
  }

  if (historyHours !== undefined && historyHours < 24) {
    alerts.push(
      <AlertCard
        key="history"
        heading="Limited history captured"
        body={`Only ${historyHours.toFixed(1)} hours of data captured. Leave the dashboard open or keep the agent streaming to build compliance.`}
        action={
          <a
            href="/docs/quickstart"
            className="inline-flex items-center rounded-lg border border-amber-400/40 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/10"
          >
            History tips →
          </a>
        }
      />
    );
  }

  if (!alerts.length) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
        All data feeds healthy. Tail health and timing analytics are up to date.
      </div>
    );
  }

  return <div className="space-y-3">{alerts}</div>;
}
