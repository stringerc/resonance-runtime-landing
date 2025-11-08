import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import ResonanceInsights from "@/components/ResonanceInsights";
import DashboardClient from "./DashboardClient";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import OnboardingLauncher from "@/components/onboarding/OnboardingLauncher";
import DataAlerts from "@/components/onboarding/DataAlerts";

type MetricKey =
  | "R"
  | "K"
  | "spectralEntropy"
  | "coherenceScore"
  | "tailHealthScore"
  | "timingScore"
  | "lambdaRes"
  | "p99Latency"
  | "p50Latency";

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getNumericField = (record: Record<string, unknown>, key: MetricKey): number | null => {
  const value = record[key];
  return typeof value === "number" ? value : null;
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch user's license
  const license = await prisma.license.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Fetch recent metrics
  const recentMetrics = await prisma.userMetric.findMany({
    where: { userId: session.user.id },
    orderBy: { timestamp: "desc" },
    take: 10,
  });
  const orderedMetrics = [...recentMetrics].reverse();

  const resonanceHistory = orderedMetrics
    .map((metric) => {
      if (!isObjectRecord(metric.data)) {
        return null;
      }
      const value = getNumericField(metric.data, "R");
      return value !== null ? { time: metric.timestamp.getTime(), value } : null;
    })
    .filter((point): point is { time: number; value: number } => point !== null);

  const bandComplianceOverview = resonanceHistory.length
    ? {
        percentage:
          (resonanceHistory.filter((point) => point.value >= 0.35 && point.value <= 0.65).length / resonanceHistory.length) *
          100,
        inBand: resonanceHistory.filter((point) => point.value >= 0.35 && point.value <= 0.65).length,
        total: resonanceHistory.length,
      }
    : { percentage: 0, inBand: 0, total: 0 };

  const latestSampleTime = resonanceHistory.length ? resonanceHistory[resonanceHistory.length - 1].time : null;
  const latestMetric = recentMetrics[0];
  const latestData = latestMetric && isObjectRecord(latestMetric.data) ? latestMetric.data : null;
  const getLatestNumeric = (key: MetricKey) => (latestData ? getNumericField(latestData, key) : null);

  const insightMetrics = latestData
    ? {
        R: getLatestNumeric("R") ?? undefined,
        spectralEntropy: getLatestNumeric("spectralEntropy"),
        coherenceScore: getLatestNumeric("coherenceScore"),
        tailHealthScore: getLatestNumeric("tailHealthScore"),
        timingScore: getLatestNumeric("timingScore"),
        lambdaRes: getLatestNumeric("lambdaRes"),
        p99Latency: getLatestNumeric("p99Latency"),
        p50Latency: getLatestNumeric("p50Latency"),
      }
    : null;

  const latencyPresent = getLatestNumeric("p99Latency") !== null;

  const extractSeries = (key: MetricKey): number[] =>
    orderedMetrics
      .map((metric) => {
        if (!isObjectRecord(metric.data)) {
          return null;
        }
        return getNumericField(metric.data, key);
      })
      .filter((value): value is number => value !== null);

  const rSeries = resonanceHistory.map((point) => point.value);
  const entropySeries = extractSeries("spectralEntropy");
  const coherenceSeries = extractSeries("coherenceScore");
  const tailSeries = extractSeries("tailHealthScore");
  const latencySeries = extractSeries("p99Latency");


  // Fetch payments history
  const payments = await prisma.payment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-neutral-50">Dashboard</h1>
          <p className="mt-2 text-neutral-400">
            Welcome back, {session.user.name || session.user.email}. Keep the agent streaming for steady band compliance.
          </p>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <OnboardingChecklist
            completedSteps={{
              adaptive: license?.status === "ACTIVE",
              phase: resonanceHistory.length > 25,
              latency: latencyPresent,
              history: resonanceHistory.length >= 288,
            }}
          />
          <OnboardingLauncher
            checklistStatus={{
              adaptive: license?.status === "ACTIVE",
              phase: resonanceHistory.length > 25,
              latency: latencyPresent,
              history: resonanceHistory.length >= 288,
            }}
          />
        </div>
      </div>

        {/* License Status Card */}
        <div className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-50">License Status</h2>
            {license && (
              <Link
                href="/dashboard/canary"
                className="text-sm font-medium text-brand-200 hover:text-brand-100"
              >
                View Monitoring →
              </Link>
            )}
          </div>
          {license ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-neutral-400">Plan</span>
                  <div className="mt-1 text-lg font-semibold capitalize text-neutral-100">
                    {license.type?.toLowerCase() === "pro" ? "Pro" : license.type?.toLowerCase() || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-neutral-400">Status</span>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        license.status === "ACTIVE"
                          ? "bg-emerald-500/15 text-emerald-200"
                          : license.status === "TRIAL"
                          ? "bg-brand-500/15 text-brand-200"
                          : "bg-rose-500/15 text-rose-200"
                      }`}
                    >
                      {license.status}
                    </span>
                  </div>
                </div>
                {license.currentPeriodEnd && (
                  <div>
                    <span className="text-sm text-neutral-400">Renews</span>
                    <div className="mt-1 text-lg font-semibold text-neutral-100">
                      {new Date(license.currentPeriodEnd).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
              {license.status === "ACTIVE" && (
                <div className="border-t border-surface-800 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-300">Subscription Active</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Access to all Resonance Pro features
                      </p>
                    </div>
                    <Link
                      href="/dashboard/canary"
                      className="text-sm font-medium transition rounded-lg px-4 py-2 bg-brand-gradient text-neutral-900"
                    >
                      View Monitoring
                    </Link>
                  </div>
                </div>
              )}
              {license.status !== "ACTIVE" && (
                <Link
                  href="/pricing"
                  className="block mt-4 text-center px-4 py-2 text-sm font-semibold text-brand-100 transition rounded-lg border border-brand-400/40 hover:bg-brand-500/10"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="mb-4 text-neutral-400">No active license</p>
              <Link
                href="/pricing"
                className="inline-block px-6 py-2 text-sm font-semibold text-brand-900 transition rounded-lg bg-brand-gradient"
              >
                Choose a Plan
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {license && license.status === "ACTIVE" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-surface-800 bg-surface-900/70 p-6 shadow-brand-glow">
              <h3 className="mb-2 text-sm font-semibold text-neutral-300">Resonance Agent</h3>
              <div className="mb-1 text-2xl font-bold text-neutral-50">
                <DashboardClient />
              </div>
              <p className="text-xs text-neutral-500">Real-time monitoring</p>
            </div>
            <div className="rounded-2xl border border-surface-800 bg-surface-900/70 p-6 shadow-brand-glow">
              <h3 className="mb-2 text-sm font-semibold text-neutral-300">Features</h3>
              <div className="mb-1 text-lg font-semibold text-neutral-100">
                Advanced Analytics
              </div>
              <p className="text-xs text-neutral-500">EVT, Network Calculus, Max-Plus</p>
            </div>
            <div className="rounded-2xl border border-surface-800 bg-surface-900/70 p-6 shadow-brand-glow">
              <h3 className="mb-2 text-sm font-semibold text-neutral-300">Data Retention</h3>
              <div className="mb-1 text-lg font-semibold text-neutral-100">
                90 Days
              </div>
              <p className="text-xs text-neutral-500">Historical data access</p>
            </div>
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === "succeeded"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {payment.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Overview */}
        {insightMetrics && (
          <div className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-50">Health Overview</h2>
              <span className="text-xs uppercase tracking-wide text-neutral-500">
                Last sample{" "}
                {latestMetric?.timestamp
                  ? new Date(latestMetric.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "N/A"}
              </span>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ResonanceInsights
                  layout="panel"
                  metrics={insightMetrics}
                  band={bandComplianceOverview}
                  latestSampleTime={latestSampleTime}
                  latencyPresent={latencyPresent}
                />
                <div className="mt-4">
                  <DataAlerts
                    hasLatency={latencyPresent}
                    hasPhaseHistory={resonanceHistory.length > 50}
                    historyHours={resonanceHistory.length ? Math.min((resonanceHistory.length * 5) / 60, 48) : 0}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <OverviewCard
                  title="Global Resonance R(t)"
                  value={insightMetrics.R ?? null}
                  formatter={(value) => formatDecimal(value, 3)}
                  series={rSeries}
                  color="#3b82f6"
                  helperText={`Band compliance ${bandComplianceOverview.percentage.toFixed(1)}%`}
                />
                <OverviewCard
                  title="Spectral Entropy"
                  value={insightMetrics.spectralEntropy ?? null}
                  formatter={(value) => formatDecimal(value, 3)}
                  series={entropySeries}
                  color="#8b5cf6"
                  helperText="Target range 0.40 – 0.60"
                />
                <OverviewCard
                  title="Coherence Score"
                  value={insightMetrics.coherenceScore ?? null}
                  formatter={formatPercent}
                  series={coherenceSeries}
                  color="#14b8a6"
                  helperText="CWSC synchrony"
                />
                <OverviewCard
                  title="Tail Health"
                  value={insightMetrics.tailHealthScore ?? null}
                  formatter={formatPercent}
                  series={tailSeries}
                  color="#10b981"
                  helperText="EVT / GPD fit"
                />
                <OverviewCard
                  title="Latency p99"
                  value={insightMetrics.p99Latency ?? null}
                  formatter={formatLatency}
                  series={latencySeries}
                  color="#f97316"
                  helperText="Provide latency feed to unlock tail analysis"
                  emptyLabel="Latency feed missing"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {license && license.status === "ACTIVE" && (
          <div className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-50">Shortcuts</h2>
              <span className="text-xs text-neutral-500">Jump to common actions</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/dashboard/canary"
                className="group rounded-xl border border-surface-800 bg-surface-900/70 p-4 transition hover:border-brand-400/40 hover:bg-surface-800"
              >
                <div className="mb-1 font-semibold text-neutral-100 group-hover:text-brand-100">View Monitoring</div>
                <div className="text-sm text-neutral-400">Real-time Resonance metrics and AI insights</div>
              </Link>
              <Link
                href="/dashboard/resonance-calculus"
                className="group rounded-xl border border-surface-800 bg-surface-900/70 p-4 transition hover:border-brand-400/40 hover:bg-surface-800"
              >
                <div className="mb-1 font-semibold text-neutral-100 group-hover:text-brand-100">Resonance Calculus</div>
                <div className="text-sm text-neutral-400">Component breakdown, tail analysis, and timing metrics</div>
              </Link>
              <Link
                href="/resonance/pricing"
                className="group rounded-xl border border-surface-800 bg-surface-900/70 p-4 transition hover:border-brand-400/40 hover:bg-surface-800"
              >
                <div className="mb-1 font-semibold text-neutral-100 group-hover:text-brand-100">Manage Subscription</div>
                <div className="text-sm text-neutral-400">Upgrade, downgrade, or cancel your plan</div>
              </Link>
              <Link
                href="/docs"
                className="group rounded-xl border border-surface-800 bg-surface-900/70 p-4 transition hover:border-brand-400/40 hover:bg-surface-800"
              >
                <div className="mb-1 font-semibold text-neutral-100 group-hover:text-brand-100">Docs & Field Guide</div>
                <div className="text-sm text-neutral-400">Integration steps, calculus dossier, and operations playbooks</div>
              </Link>
              <Link
                href="https://github.com/stringerc/syncscriptE/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-surface-800 bg-surface-900/70 p-4 transition hover:border-brand-400/40 hover:bg-surface-800"
              >
                <div className="mb-1 font-semibold text-neutral-100 group-hover:text-brand-100">Download Agents</div>
                <div className="text-sm text-neutral-400">Latest desktop binaries, manifests, and release notes</div>
              </Link>
            </div>
          </div>
        )}

        {/* Metrics Section */}
        <div className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-50">Recent Metrics</h2>
            {resonanceHistory.length > 0 && (
              <span className="text-xs text-neutral-500">
                Showing last {resonanceHistory.length} samples
              </span>
            )}
          </div>
          {resonanceHistory.length > 0 ? (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {recentMetrics.map((metric) => {
                  const record = isObjectRecord(metric.data) ? metric.data : {};
                  const rValue = getNumericField(record, "R");
                  const spectralEntropy = getNumericField(record, "spectralEntropy");
                  const coherenceScore = getNumericField(record, "coherenceScore");
                  const tailHealth = getNumericField(record, "tailHealthScore");
                  const timingScore = getNumericField(record, "timingScore");
                  const lambdaRes = getNumericField(record, "lambdaRes");
                  const p99Latency = getNumericField(record, "p99Latency");

                  return (
                    <div key={metric.id} className="rounded-xl border border-surface-800 bg-surface-900/70 p-4">
                      <div className="mb-3 flex items-center justify-between text-sm text-neutral-400">
                        <span>{new Date(metric.timestamp).toLocaleString()}</span>
                        <span className="font-medium text-neutral-200">
                          R(t): {rValue !== null ? rValue.toFixed(3) : "—"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-300">
                        <MetricValue label="Entropy" value={spectralEntropy} formatter={(value) => formatDecimal(value, 3)} />
                        <MetricValue label="Coherence" value={coherenceScore} formatter={formatPercent} />
                        <MetricValue label="Tail Health" value={tailHealth} formatter={formatPercent} />
                        <MetricValue label="Timing" value={timingScore} formatter={formatPercent} />
                        <MetricValue label="λ_res" value={lambdaRes} formatter={(value) => formatDecimal(value, 3)} />
                        <MetricValue label="p99 latency" value={p99Latency} formatter={formatLatency} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-neutral-500">
                Historical samples are stored as part of your Resonance history. For deeper analysis open the Canary or Resonance Calculus dashboards.
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="mb-4 text-neutral-400">
                No metrics yet. Start monitoring to see data here.
              </p>
              {license && license.status === "ACTIVE" && (
                <Link
                  href="/dashboard/canary"
                  className="inline-block rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-neutral-900 transition"
                >
                  Go to Monitoring Dashboard
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDecimal(value: number | null | undefined, digits = 3) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return Number(value).toFixed(digits);
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return `${(value * 100).toFixed(1)}%`;
}

function formatLatency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} s`;
  }
  return `${Math.round(value)} ms`;
}

interface OverviewCardProps {
  title: string;
  value: number | null | undefined;
  formatter?: (value: number | null | undefined) => string;
  series: number[];
  color: string;
  helperText?: string;
  emptyLabel?: string;
}

function OverviewCard({
  title,
  value,
  formatter = (v) => formatDecimal(v, 3),
  series,
  color,
  helperText,
  emptyLabel = "No samples yet",
}: OverviewCardProps) {
  const displayValue = formatter(value);
  return (
    <div className="rounded-xl border border-surface-800 bg-surface-900/70 p-4 shadow-brand-glow">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">{title}</h3>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-bold text-neutral-50">{displayValue}</div>
          {helperText && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
        </div>
        <div className="flex-1">
          {series.length > 1 ? (
            <Sparkline series={series} color={color} />
          ) : (
            <div className="text-right text-xs text-neutral-500">{emptyLabel}</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SparklineProps {
  series: number[];
  color: string;
}

function Sparkline({ series, color }: SparklineProps) {
  const width = 140;
  const height = 50;
  const safeSeries = series.length === 1 ? [...series, series[0]] : series;
  const min = Math.min(...safeSeries);
  const max = Math.max(...safeSeries);
  const range = max - min || 1;

  const points = safeSeries
    .map((value, index) => {
      const x = (index / (safeSeries.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-16"
      role="img"
      aria-label="Trend over recent samples"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

interface MetricValueProps {
  label: string;
  value: number | null | undefined;
  formatter?: (value: number | null | undefined) => string;
}

function MetricValue({ label, value, formatter = (val) => formatDecimal(val, 3) }: MetricValueProps) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-900">{formatter(value)}</div>
    </div>
  );
}

