import clsx from "clsx";

interface ResonanceMetrics {
  R?: number;
  spectralEntropy?: number | null;
  coherenceScore?: number | null;
  tailHealthScore?: number | null;
  timingScore?: number | null;
  lambdaRes?: number | null;
  p99Latency?: number | null;
  p50Latency?: number | null;
}

interface BandComplianceSummary {
  percentage: number;
  inBand: number;
  total: number;
}

interface ResonanceInsightsProps {
  metrics: ResonanceMetrics | null;
  band?: BandComplianceSummary;
  latestSampleTime?: number | null;
  latencyPresent?: boolean;
  layout?: "sidebar" | "panel";
}

type StatusLevel = "good" | "warning" | "critical";

const statusStyles: Record<StatusLevel, string> = {
  good: "bg-emerald-50 border-emerald-200 text-emerald-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  critical: "bg-rose-50 border-rose-200 text-rose-800",
};

function describeResonance(value?: number): { status: StatusLevel; message: string } {
  if (value === undefined || Number.isNaN(value)) {
    return { status: "warning", message: "No live samples yet. Keep the agent streaming phases." };
  }
  if (value < 0.35) {
    return {
      status: "warning",
      message:
        "R(t) is below the optimal band. This usually means load is sparse or highly variable—add richer traffic or let the controller keep learning.",
    };
  }
  if (value > 0.65) {
    return {
      status: "warning",
      message:
        "R(t) is above the optimal band. The system is over-synchronised—ease coupling strength or stagger workloads so controllers aren’t over-reacting.",
    };
  }
  return {
    status: "good",
    message: "R(t) sits comfortably inside the optimal 0.35–0.65 band. Controllers are in tune.",
  };
}

function describeCompliance(band?: BandComplianceSummary): { status: StatusLevel; message: string } {
  if (!band || band.total === 0) {
    return {
      status: "warning",
      message: "No history in this window yet. Leave the dashboard open or feed the agent to build compliance history.",
    };
  }
  if (band.percentage >= 85) {
    return { status: "good", message: `Great! ${band.percentage.toFixed(1)}% of samples land inside the band.` };
  }
  if (band.percentage >= 50) {
    return {
      status: "warning",
      message: `Band compliance is ${band.percentage.toFixed(
        1
      )}%. Keep streaming variety or adjust coupling to bring more points into the optimal zone.`,
    };
  }
  return {
    status: "critical",
    message:
      "Band compliance is very low. The agent is either still warming up or starved of diverse samples—feed more real traffic or run the phase feeder.",
  };
}

function describeCoherence(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return {
      status: "warning" as StatusLevel,
      message: "Coherence samples missing.",
      insight:
        "Coherence comes from the coherence-weighted service curve. When phase samples are sparse, we can’t estimate how evenly services stay in sync.",
    };
  }
  if (value >= 0.5) {
    return {
      status: "good" as StatusLevel,
      message: `Coherence ${(value * 100).toFixed(1)}% — services are marching in step.`,
      insight:
        "A high coherence score means inter-service hand-offs are smooth and phase corrections stay aligned. Keep phase sampling steady to maintain it.",
    };
  }
  return {
    status: "warning" as StatusLevel,
    message: `Coherence ${(value * 100).toFixed(1)}% — expect more drift between services.`,
    insight:
      "Low coherence usually means controllers are reacting at different speeds or phase samples arrive infrequently. Increase sampling or smooth bursts to bring services back in phase.",
  };
}

function describeTailHealth(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return {
      status: "warning" as StatusLevel,
      message: "Tail health unknown until latency samples arrive.",
      insight:
        "Feed p99/p99.9 latency via the Resonance SDK or bench harness so the EVT model can fit the tail. Without it we can’t judge extreme-event resilience.",
    };
  }
  if (value >= 0.5) {
    return {
      status: "good" as StatusLevel,
      message: `Tail health ${(value * 100).toFixed(1)}% — long-tail latency is contained.`,
      insight:
        "The GPD fit shows tail spikes are under control. Keep streaming latency to catch regressions early.",
    };
  }
  return {
    status: "warning" as StatusLevel,
    message: `Tail health ${(value * 100).toFixed(1)}% — tail latency is jittery.`,
    insight:
      "Investigate services driving the 99th/99.9th percentiles. Weighted back-pressure or smoothing bursty queues usually raises this score.",
  };
}

function describeTiming(value?: number | null, lambda?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return {
      status: "warning" as StatusLevel,
      message: "Timing score unavailable until enough phase + latency history accumulates.",
      insight: "Keep the agent running so Max-Plus algebra can measure end-to-end cycle times.",
    };
  }
  if (value >= 0.5) {
    return {
      status: "good" as StatusLevel,
      message: `Timing ${(value * 100).toFixed(1)}% — controllers are keeping cycles predictable.`,
      insight: lambda
        ? `λ_res is ${lambda.toFixed(
            3
          )}. Lower numbers mean faster feedback loops; yours indicates the slowest loop is staying tight.`
        : "Controllers keep cycle time consistent. Continue monitoring λ_res for early drift signals.",
    };
  }
  return {
    status: "warning" as StatusLevel,
    message: `Timing ${(value * 100).toFixed(1)}% — cycle-time jitter is creeping in.`,
    insight:
      "Look for overloaded queues or aggressive coupling. Raising minimum coupling or smoothing bursts can stabilise timing.",
  };
}

function describeEntropy(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return {
      status: "warning" as StatusLevel,
      message: "Entropy is unknown. Provide request mix data for analysis.",
      insight:
        "Spectral entropy shows workload variety. Without it, we can’t confirm whether load diversity is balanced.",
    };
  }
  if (value >= 0.4 && value <= 0.6) {
    return {
      status: "good" as StatusLevel,
      message: `Entropy ${(value * 100).toFixed(1)} — workload variety looks healthy.`,
      insight:
        "You have a balanced mix of request shapes, which keeps controllers responsive without overfitting to a single pattern.",
    };
  }
  if (value < 0.4) {
    return {
      status: "warning" as StatusLevel,
      message: `Entropy ${(value * 100).toFixed(1)} — workload is repetitive.`,
      insight:
        "Introduce more representative traffic (e.g., replay traces or distribute service calls) so the agent learns a richer pattern.",
    };
  }
  return {
    status: "warning" as StatusLevel,
    message: `Entropy ${(value * 100).toFixed(1)} — workload is noisy.`,
    insight:
      "Request mix is highly chaotic. Batch similar traffic or smooth bursts so controllers aren’t constantly chasing extremes.",
  };
}

function describeLatency(hasLatency?: boolean, p99?: number | null) {
  if (!hasLatency || p99 === null || p99 === undefined || Number.isNaN(p99)) {
    return {
      status: "warning" as StatusLevel,
      message: "Latency feed missing.",
      insight:
        "Stream percentile latency (p50/p95/p99) through the Resonance SDK (`sdk.metrics.recordLatency({ p99 })`) or run the bench harness with `--with-latency`. Without tail data we can’t validate extremes.",
    };
  }
  return {
    status: "good" as StatusLevel,
    message: `p99 latency is ${Math.round(p99)} ms.`,
    insight:
      "Percentile data is arriving. Keep feeding production traces so tail health and EVT fits stay in lockstep with reality.",
  };
}

export default function ResonanceInsights({
  metrics,
  band,
  latestSampleTime,
  latencyPresent,
  layout = "sidebar",
}: ResonanceInsightsProps) {
  const resonance = describeResonance(metrics?.R);
  const compliance = describeCompliance(band);
  const coherence = describeCoherence(metrics?.coherenceScore);
  const tailHealth = describeTailHealth(metrics?.tailHealthScore);
  const timing = describeTiming(metrics?.timingScore, metrics?.lambdaRes);
  const entropy = describeEntropy(metrics?.spectralEntropy);
  const latency = describeLatency(latencyPresent, metrics?.p99Latency);

  const lastUpdated = latestSampleTime
    ? new Date(latestSampleTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <aside
      id="metric-glossary"
      aria-label="Resonance insights"
      className={clsx(
        layout === "sidebar" ? "lg:w-80 xl:w-96 lg:pl-6 mt-8 lg:mt-0" : "w-full",
        layout === "panel" && "mt-0"
      )}
    >
      <div className={clsx(layout === "sidebar" ? "sticky top-24 space-y-4" : "space-y-4")}>
        <div
          className={clsx(
            "border border-gray-200 rounded-xl shadow-sm p-6 space-y-4",
            layout === "panel" ? "bg-white" : "bg-white"
          )}
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Resonance Insights</h2>
            <p className="text-sm text-gray-600">
              Live interpretation of the dashboard. Each card spells out what your current numbers mean and the next best step.
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-2">Last sample: {lastUpdated}</p>
            )}
          </div>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Core Health</h3>

            <InsightCard
              title="Global Resonance R(t)"
              status={resonance.status}
              primary={metrics?.R ?? null}
              primaryFormatter={(value) => (value === null ? "—" : value.toFixed(3))}
              message={resonance.message}
            >
              <p>
                R(t) measures how tightly controllers are coupled. The sweet spot (0.35–0.65) keeps adjustments responsive without oscillations.
              </p>
            </InsightCard>

            <InsightCard
              title="Band Compliance"
              status={compliance.status}
              primary={band?.percentage ?? null}
              primaryFormatter={(value) => (value === null ? "—" : `${value.toFixed(1)}%`)}
              message={compliance.message}
            >
              <p>
                {band
                  ? `${band.inBand} of ${band.total} samples`
                  : "No samples yet"}{" "}
                fall inside the optimal band. Leave the dashboard open or feed real traffic to build history.
              </p>
            </InsightCard>

            <InsightCard
              title="Spectral Entropy"
              status={entropy.status}
              primary={metrics?.spectralEntropy ?? null}
              primaryFormatter={(value) => (value === null ? "—" : value.toFixed(3))}
              message={entropy.message}
            >
              <p>{entropy.insight}</p>
            </InsightCard>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Calculus Metrics</h3>

            <InsightCard
              title="Coherence Score"
              status={coherence.status}
              primary={metrics?.coherenceScore ?? null}
              primaryFormatter={(value) =>
                value === null ? "0.0%" : `${(value * 100).toFixed(1)}%`
              }
              message={coherence.message}
            >
              <p>{coherence.insight}</p>
            </InsightCard>

            <InsightCard
              title="Tail Health Score"
              status={tailHealth.status}
              primary={metrics?.tailHealthScore ?? null}
              primaryFormatter={(value) =>
                value === null ? "0.0%" : `${(value * 100).toFixed(1)}%`
              }
              message={tailHealth.message}
            >
              <p>{tailHealth.insight}</p>
            </InsightCard>

            <InsightCard
              title="Timing Score & λ_res"
              status={timing.status}
              primary={
                metrics?.timingScore !== null && metrics?.timingScore !== undefined
                  ? `${(metrics.timingScore * 100).toFixed(1)}%`
                  : null
              }
              secondary={
                metrics?.lambdaRes !== null && metrics?.lambdaRes !== undefined
                  ? `λ_res ${metrics.lambdaRes.toFixed(3)}`
                  : undefined
              }
              message={timing.message}
            >
              <p>{timing.insight}</p>
            </InsightCard>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Latency Feed</h3>

            <InsightCard
              title="p99 Latency"
              status={latency.status}
              primary={metrics?.p99Latency ?? null}
              primaryFormatter={(value) => (value === null ? "—" : `${Math.round(value)} ms`)}
              message={latency.message}
            >
              <p>{latency.insight}</p>
              {!latencyPresent && (
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 mt-2">
                  <li>Send percentile latency via the Resonance SDK (`sdk.metrics.recordLatency({ p99 })`).</li>
                  <li>Or run <code>node resonance/bench/feed_phases.js --with-latency</code> to stream sample tail data while testing.</li>
                </ul>
              )}
            </InsightCard>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Need deeper math?</h3>
            <p className="text-xs text-gray-600">
              Download the full Resonance Calculus dossier for proofs, derivations, and implementation details behind every metric.
            </p>
            <a
              href="/docs/resonance-calculus-dossier.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition"
            >
              Open Resonance Calculus Dossier
            </a>
          </section>
        </div>
      </div>
    </aside>
  );
}

interface InsightCardProps {
  title: string;
  status: StatusLevel;
  primary: number | string | null;
  primaryFormatter?: (value: number | string | null) => string;
  secondary?: string;
  message: string;
  children?: React.ReactNode;
}

function InsightCard({ title, status, primary, primaryFormatter, secondary, message, children }: InsightCardProps) {
  const formattedPrimary =
    primaryFormatter && typeof primary !== "string"
      ? primaryFormatter(primary)
      : primary === null
      ? "—"
      : primary;

  return (
    <div className={clsx("border rounded-lg p-4 space-y-2", statusStyles[status])}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        <span
          className={clsx(
            "text-xs font-semibold px-2 py-0.5 rounded-full border",
            status === "good" && "bg-emerald-600/10 border-emerald-600/30 text-emerald-900",
            status === "warning" && "bg-amber-600/10 border-amber-600/30 text-amber-900",
            status === "critical" && "bg-rose-600/10 border-rose-600/30 text-rose-900"
          )}
        >
          {status === "good" ? "Healthy" : status === "warning" ? "Watch" : "Action"}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{formattedPrimary}</span>
        {secondary && <span className="text-xs font-medium">{secondary}</span>}
      </div>
      <p className="text-sm font-medium">{message}</p>
      {children && <div className="text-xs leading-relaxed">{children}</div>}
    </div>
  );
}

