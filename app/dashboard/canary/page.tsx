"use client";

import { useState, useEffect, useMemo } from "react";
import ResonanceInsights from "@/components/ResonanceInsights";

interface Metrics {
  R: number;
  K: number;
  spectralEntropy: number;
  mode: string;
  modeValue: number;
  p99Latency?: number;
  p50Latency?: number;
  latencyImprovement?: number;
  error?: string;
  agentUrl?: string;
  agentConnected?: boolean;
  environment?: string;
  mock?: boolean;
  timestamp?: string;
  // Resonance Calculus metrics (optional)
  coherenceScore?: number | null;
  tailHealthScore?: number | null;
  timingScore?: number | null;
  lambdaRes?: number | null;
  gpd?: {
    xi: number | null;
    sigma: number | null;
    threshold: number | null;
  } | null;
  tailQuantiles?: {
    q99: number | null;
    q99_9: number | null;
  } | null;
}

type TimeInterval = 'realtime' | 'hourly' | 'daily' | 'monthly' | 'quarterly' | 'yearly';

export default function CanaryDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedHours, setElapsedHours] = useState(0);
  const [history, setHistory] = useState<Array<{ time: number; R: number }>>([]);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('realtime');
  const [tailHealthExpanded, setTailHealthExpanded] = useState(false);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const bandCompliance = useMemo(() => {
    if (!history.length) {
      return { percentage: 0, inBand: 0, total: 0 };
    }
    const inBand = history.filter((point) => point.R >= 0.35 && point.R <= 0.65).length;
    return {
      percentage: (inBand / history.length) * 100,
      inBand,
      total: history.length,
    };
  }, [history]);

  const latestSampleTime = history.length ? history[history.length - 1].time : null;

  useEffect(() => {
    // Calculate elapsed hours since canary start
    const canaryStart = localStorage.getItem('canaryStartTime');
    if (canaryStart) {
      const start = parseInt(canaryStart);
      const now = Date.now();
      setElapsedHours((now - start) / (1000 * 60 * 60));
    } else {
      localStorage.setItem('canaryStartTime', Date.now().toString());
      setElapsedHours(0);
    }
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      const data = await response.json();
      setMetrics(data);
      
      // Add to history (store more points for longer intervals)
      if (data && data.R !== undefined) {
        setHistory(prev => {
          const newHistory = [...prev, { time: Date.now(), R: data.R }];
          // Keep more points for longer intervals (up to 1000 points = ~1.4 hours at 5s intervals)
          const maxPoints = 1000;
          return newHistory.slice(-maxPoints);
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setLoading(false);
    }
  };

  // Get filtered/aggregated data based on interval
  const getFilteredHistory = () => {
    if (history.length === 0) return [];
    
    const now = Date.now();
    const intervalMs: Record<TimeInterval, number> = {
      realtime: 5 * 1000, // 5 seconds
      hourly: 60 * 60 * 1000, // 1 hour
      daily: 24 * 60 * 60 * 1000, // 1 day
      monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
      quarterly: 90 * 24 * 60 * 60 * 1000, // 90 days
      yearly: 365 * 24 * 60 * 60 * 1000, // 365 days
    };

    const interval = intervalMs[timeInterval];
    const cutoffTime = now - interval;
    
    // Filter data within the interval
    const filtered = history.filter(point => point.time >= cutoffTime);
    
    if (filtered.length === 0) return [];
    
    // For longer intervals, aggregate data points
    if (timeInterval !== 'realtime' && filtered.length > 100) {
      const buckets = 100; // Max 100 points on graph
      const bucketSize = Math.ceil(filtered.length / buckets);
      const aggregated: Array<{ time: number; R: number }> = [];
      
      for (let i = 0; i < filtered.length; i += bucketSize) {
        const bucket = filtered.slice(i, i + bucketSize);
        const avgR = bucket.reduce((sum, p) => sum + p.R, 0) / bucket.length;
        const avgTime = bucket.reduce((sum, p) => sum + p.time, 0) / bucket.length;
        aggregated.push({ time: avgTime, R: avgR });
      }
      
      return aggregated;
    }
    
    return filtered;
  };
const getModeColor = (mode: string) => {
  switch (mode) {
    case 'adaptive':
      return 'text-brand-200';
    case 'active':
      return 'text-emerald-200';
    case 'shadow':
      return 'text-amber-300';
    default:
      return 'text-neutral-300';
  }
};

  const getBandStatus = (r: number) => {
    if (r >= 0.35 && r <= 0.65) return { status: 'optimal', color: 'text-green-600' };
    if (r < 0.35) return { status: 'low', color: 'text-yellow-600' };
    return { status: 'high', color: 'text-orange-600' };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-900">
        <div className="text-center text-neutral-400">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-brand-400"></div>
          <p>Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-900">
        <div className="text-center">
          <p className="mb-4 text-rose-400">Failed to load metrics</p>
          <button
            onClick={fetchMetrics}
            className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const bandStatus = getBandStatus(metrics.R);
  const modeLabel = metrics.mode || 'adaptive';

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-50">Canary Mode Monitoring</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-400">
            <span className="text-neutral-300">
              Elapsed: <span className="font-semibold text-neutral-100">{elapsedHours.toFixed(1)} hours</span> / 24 hours
            </span>
            <span className="text-brand-200">
              Mode:{' '}
              <span className={`${getModeColor(modeLabel)} font-semibold`}>
                {modeLabel.charAt(0).toUpperCase() + modeLabel.slice(1)}
              </span>
            </span>
            <a
              href="#metric-glossary"
              className="inline-flex items-center gap-1 text-brand-200 hover:text-brand-100"
            >
              Need guidance? <span className="font-semibold">Open live insights →</span>
            </a>
          </div>
        </div>

        {/* Main Graph */}
        <div className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-50">Global Resonance Overview</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">Time Range:</span>
              <select
                value={timeInterval}
                onChange={(e) => setTimeInterval(e.target.value as TimeInterval)}
                className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-1 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Last Hour</option>
                <option value="daily">Last 24 Hours</option>
                <option value="monthly">Last 30 Days</option>
                <option value="quarterly">Last 90 Days</option>
                <option value="yearly">Last Year</option>
              </select>
            </div>
          </div>
          <div className="relative h-64 rounded-xl border border-surface-800 bg-surface-900/70 p-4">
            <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
              {/* Resonance Band Zones */}
              {/* Low zone (< 0.35) */}
              <rect
                x="0"
                y={(1 - 0.35) * 240}
                width="800"
                height={0.35 * 240}
                fill="#fef3c7"
                stroke="#fbbf24"
                strokeWidth="1"
                opacity="0.4"
              />
              <text
                x="10"
                y={(1 - 0.2) * 240}
                className="text-xs font-semibold fill-yellow-700"
                fontSize="11"
              >
                LOW
              </text>
              
              {/* Optimal zone (0.35 - 0.65) */}
              <rect
                x="0"
                y={(1 - 0.65) * 240}
                width="800"
                height={(0.65 - 0.35) * 240}
                fill="#dcfce7"
                stroke="#86efac"
                strokeWidth="2"
                opacity="0.6"
              />
              <text
                x="400"
                y={(1 - 0.5) * 240}
                textAnchor="middle"
                className="text-xs font-semibold fill-green-700"
                fontSize="12"
              >
                OPTIMAL BAND [0.35, 0.65]
              </text>
              
              {/* High zone (> 0.65) */}
              <rect
                x="0"
                y="0"
                width="800"
                height={(1 - 0.65) * 240}
                fill="#fed7aa"
                stroke="#fb923c"
                strokeWidth="1"
                opacity="0.4"
              />
              <text
                x="10"
                y={(1 - 0.7) * 240}
                className="text-xs font-semibold fill-orange-700"
                fontSize="11"
              >
                HIGH
              </text>
              
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((val) => (
                <line
                  key={val}
                  x1="0"
                  y1={(1 - val) * 240}
                  x2="800"
                  y2={(1 - val) * 240}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              ))}
              
              {/* R(t) line graph */}
              {(() => {
                const filtered = getFilteredHistory();
                if (filtered.length > 1) {
                  return (
                    <polyline
                      points={filtered.map((point, idx) => {
                        const x = (idx / (filtered.length - 1)) * 800;
                        const y = (1 - point.R) * 240;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                  );
                }
                return null;
              })()}
              
              {/* Current value indicator */}
              {metrics && (
                <>
                  <circle
                    cx="800"
                    cy={(1 - metrics.R) * 240}
                    r="6"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x="790"
                    y={(1 - metrics.R) * 240 - 10}
                    textAnchor="end"
                    className="text-xs font-semibold fill-blue-600"
                    fontSize="12"
                  >
                    R(t) = {metrics.R.toFixed(3)}
                  </text>
                </>
              )}
              
              {/* Y-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((val) => (
                <text
                  key={val}
                  x="5"
                  y={(1 - val) * 240 + 4}
                  className="text-xs fill-gray-600"
                  fontSize="12"
                >
                  {val.toFixed(2)}
                </text>
              ))}
            </svg>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-neutral-400">
            <div className="flex flex-wrap items-center gap-2">
              <span>Target Band: [0.35, 0.65]</span>
              <span className="mx-1 text-neutral-600">|</span>
              <span>Current: <span className="text-neutral-100">{metrics.R.toFixed(3)}</span></span>
              <span className="mx-1 text-neutral-600">|</span>
              <span>
                Status:{' '}
                <span className={`${bandStatus.color} font-semibold`}>{bandStatus.status.toUpperCase()}</span>
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              {getFilteredHistory().length} data points shown ({history.length} total stored)
            </div>
          </div>
        </div>

        {/* Resonance Components Panel */}
        {(metrics.coherenceScore !== null && metrics.coherenceScore !== undefined) ||
          (metrics.tailHealthScore !== null && metrics.tailHealthScore !== undefined) ||
          (metrics.timingScore !== null && metrics.timingScore !== undefined) ||
          (metrics.lambdaRes !== null && metrics.lambdaRes !== undefined) ? (
          <div className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
            <h2 className="mb-4 text-xl font-semibold text-neutral-50">Resonance Components</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Coherence Score */}
              {metrics.coherenceScore !== null && metrics.coherenceScore !== undefined && (
                <div className="rounded-xl border border-surface-700 bg-surface-900/70 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-neutral-200">Coherence Score</h3>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-brand-200">
                      {(metrics.coherenceScore * 100).toFixed(0)}
                    </div>
                    <span className="text-sm text-neutral-400">%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-800">
                    <div
                      className="h-full rounded-full bg-brand-400 transition-all duration-300"
                      style={{ width: `${metrics.coherenceScore * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-neutral-400">
                    {metrics.coherenceScore >= 0.5 ? '✓ Optimal' : '⚠ Low'}
                  </div>
                </div>
              )}

              {/* Tail Health Score */}
              {metrics.tailHealthScore !== null && metrics.tailHealthScore !== undefined && (
                <div className="rounded-xl border border-surface-700 bg-surface-900/70 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-neutral-200">Tail Health Score</h3>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-emerald-300">
                      {(metrics.tailHealthScore * 100).toFixed(0)}
                    </div>
                    <span className="text-sm text-neutral-400">%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-800">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${metrics.tailHealthScore * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-neutral-400">
                    {metrics.tailHealthScore >= 0.5 ? '✓ Healthy' : '⚠ Risk'}
                  </div>
                </div>
              )}

              {/* Timing Score */}
              {metrics.timingScore !== null && metrics.timingScore !== undefined && (
                <div className="rounded-xl border border-surface-700 bg-surface-900/70 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-neutral-200">Timing Score</h3>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-fuchsia-300">
                      {(metrics.timingScore * 100).toFixed(0)}
                    </div>
                    <span className="text-sm text-neutral-400">%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-800">
                    <div
                      className="h-full rounded-full bg-fuchsia-400 transition-all duration-300"
                      style={{ width: `${metrics.timingScore * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-neutral-400">
                    {metrics.timingScore >= 0.5 ? '✓ Synchronized' : '⚠ Delayed'}
                  </div>
                </div>
              )}

              {/* Max-Plus Eigenvalue */}
              {metrics.lambdaRes !== null && metrics.lambdaRes !== undefined && (
                <div className="rounded-xl border border-surface-700 bg-surface-900/70 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-neutral-200">Max-Plus λ_res</h3>
                  <div className="text-2xl font-bold text-amber-300">
                    {metrics.lambdaRes.toFixed(3)}
                  </div>
                  <div className="mt-1 text-xs text-neutral-400">Cycle Time</div>
                  <div className="mt-1 text-xs text-neutral-400">
                    {metrics.lambdaRes < 10 ? '✓ Fast' : metrics.lambdaRes < 50 ? '⚠ Moderate' : '⚠ Slow'}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Supporting Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-surface-800 bg-surface-900/70 p-6 shadow-brand-sm">
            <h3 className="mb-2 text-sm font-semibold text-neutral-200">Latency P99</h3>
            <div className="text-2xl font-bold text-neutral-50">
              {metrics.p99Latency ? `${Math.round(metrics.p99Latency)}ms` : 'N/A'}
            </div>
            {metrics.p99Latency ? (
              metrics.latencyImprovement ? (
                <div className="mt-1 text-sm text-emerald-300">
                  ↓ {metrics.latencyImprovement}% (1h)
                </div>
              ) : (
                <div className="mt-1 text-sm text-neutral-400">
                  {metrics.p50Latency ? `P50: ${Math.round(metrics.p50Latency)}ms` : 'Monitoring...'}
                </div>
              )
            ) : (
              <div className="mt-1 text-sm text-neutral-400">
                {metrics.mock ? 'Mock data - no latency' : metrics.error ? 'Agent not accessible' : 'Waiting for data...'}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-surface-800 bg-surface-900/70 p-6 shadow-brand-sm">
            <h3 className="mb-2 text-sm font-semibold text-neutral-200">Spectral Entropy</h3>
            <div className="text-2xl font-bold text-neutral-50">
              {metrics.spectralEntropy.toFixed(2)}
            </div>
            <div className="mt-1 text-sm text-neutral-400">
              {metrics.spectralEntropy >= 0.4 && metrics.spectralEntropy <= 0.6 ? '✓ Balanced' : '⚠ Monitor'}
            </div>
          </div>

          <div className="rounded-xl border border-surface-800 bg-surface-900/70 p-6 shadow-brand-sm">
            <h3 className="mb-2 text-sm font-semibold text-neutral-200">Controller Status</h3>
            <div className={`text-2xl font-bold ${getModeColor(modeLabel)}`}>
              {modeLabel.charAt(0).toUpperCase() + modeLabel.slice(1)}
            </div>
            <div className="mt-1 text-sm text-neutral-400">
              K(t) = <span className="text-neutral-100">{metrics.K.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Tail Health Details (Expandable) */}
        {metrics.tailHealthScore !== null && metrics.tailHealthScore !== undefined && (
          <div className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-50">Tail Health Analysis</h2>
              <button
                onClick={() => setTailHealthExpanded(!tailHealthExpanded)}
                className="rounded-lg px-4 py-2 text-sm text-brand-200 transition hover:bg-surface-800 hover:text-brand-100"
              >
                {tailHealthExpanded ? '▼ Hide Details' : '▶ Show Details'}
              </button>
            </div>
            
            {/* Summary */}
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="mb-1 text-sm text-neutral-400">Tail Health Score</div>
                  <div className="text-3xl font-bold text-neutral-50">
                    {(metrics.tailHealthScore * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-4 overflow-hidden rounded-full bg-surface-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        metrics.tailHealthScore >= 0.7 ? 'bg-green-600' :
                        metrics.tailHealthScore >= 0.5 ? 'bg-yellow-500' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${metrics.tailHealthScore * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm">
                  <span className={`font-semibold ${
                    metrics.tailHealthScore >= 0.7 ? 'text-green-600' :
                    metrics.tailHealthScore >= 0.5 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {metrics.tailHealthScore >= 0.7 ? 'Excellent' :
                     metrics.tailHealthScore >= 0.5 ? 'Good' :
                     'Needs Attention'}
                  </span>
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            {tailHealthExpanded && (
              <div className="space-y-4 border-t border-surface-800 pt-4">
                {/* GPD Parameters */}
                {metrics.gpd && (metrics.gpd.xi !== null || metrics.gpd.sigma !== null || metrics.gpd.threshold !== null) && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-neutral-200">GPD Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {metrics.gpd.xi !== null && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="mb-1 text-xs text-neutral-400">Shape Parameter (ξ)</div>
                          <div className="text-lg font-bold text-neutral-50">{metrics.gpd.xi.toFixed(4)}</div>
                          <div className="mt-1 text-xs text-neutral-500">
                            {metrics.gpd.xi > 0 ? 'Heavy tail' : metrics.gpd.xi < 0 ? 'Light tail' : 'Exponential'}
                          </div>
                        </div>
                      )}
                      {metrics.gpd.sigma !== null && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="mb-1 text-xs text-neutral-400">Scale Parameter (σ)</div>
                          <div className="text-lg font-bold text-neutral-50">{metrics.gpd.sigma.toFixed(2)}</div>
                          <div className="mt-1 text-xs text-neutral-500">Scale of tail distribution</div>
                        </div>
                      )}
                      {metrics.gpd.threshold !== null && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="mb-1 text-xs text-neutral-400">Threshold (u)</div>
                          <div className="text-lg font-bold text-neutral-50">{metrics.gpd.threshold.toFixed(2)}</div>
                          <div className="mt-1 text-xs text-neutral-500">Tail modeling start point</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tail Quantiles */}
                {metrics.tailQuantiles && (metrics.tailQuantiles.q99 !== null || metrics.tailQuantiles.q99_9 !== null) && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-neutral-200">Tail Quantiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {metrics.tailQuantiles.q99 !== null && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="mb-1 text-xs text-neutral-400">Q99 (99th Percentile)</div>
                          <div className="text-lg font-bold text-neutral-50">{metrics.tailQuantiles.q99.toFixed(2)}</div>
                          <div className="mt-1 text-xs text-neutral-500">99% of values below this</div>
                        </div>
                      )}
                      {metrics.tailQuantiles.q99_9 !== null && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="mb-1 text-xs text-neutral-400">Q99.9 (99.9th Percentile)</div>
                          <div className="text-lg font-bold text-neutral-50">{metrics.tailQuantiles.q99_9.toFixed(2)}</div>
                          <div className="mt-1 text-xs text-neutral-500">99.9% of values below this</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(!metrics.gpd || (metrics.gpd.xi === null && metrics.gpd.sigma === null && metrics.gpd.threshold === null)) &&
                 (!metrics.tailQuantiles || (metrics.tailQuantiles.q99 === null && metrics.tailQuantiles.q99_9 === null)) && (
                  <div className="text-sm italic text-neutral-500">
                    Detailed GPD parameters and quantiles will be available once sufficient tail data is collected.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Agent Status</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  metrics.agentConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {metrics.agentConnected ? '✅ Connected' : '❌ Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Environment</span>
                <span className="text-sm font-medium text-neutral-100 capitalize">
                  {metrics.environment || 'Unknown'}
                </span>
              </div>
              {metrics.mock && (
                <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Data Source</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                    ⚠️ Mock Data
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Agent URL</span>
                <span className="max-w-[200px] truncate text-xs font-mono text-neutral-300" title={metrics.agentUrl}>
                  {metrics.agentUrl || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Last Update</span>
                <span className="text-xs text-neutral-300">
                  {metrics.timestamp ? new Date(metrics.timestamp).toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Update Interval</span>
                <span className="text-xs text-neutral-300">5 seconds</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Data Points Collected</span>
                <span className="text-sm font-medium text-neutral-100">
                  {history.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Data Retention</span>
                <span className="text-xs text-neutral-300">
                  {Math.round((history.length * 5) / 60)} minutes
                </span>
              </div>
              {metrics.error && (
                <div className="flex items-start justify-between">
                <span className="text-sm text-neutral-400">Error</span>
                  <span className="text-xs text-red-600 max-w-[200px] text-right">
                    {metrics.error}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
          <h3 className="mb-2 text-sm font-semibold text-neutral-200">Canary Validation Progress</h3>
          <div className="mb-2 h-4 w-full overflow-hidden rounded-full bg-surface-800">
            <div
              className="h-full rounded-full bg-brand-400 transition-all duration-300"
              style={{ width: `${Math.min((elapsedHours / 24) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-sm text-neutral-400">
            {elapsedHours < 24 ? (
              <span>{elapsedHours.toFixed(1)} / 24 hours ({(elapsedHours / 24 * 100).toFixed(1)}%)</span>
            ) : (
              <span className="font-semibold text-emerald-300">✅ 24 hours complete! Ready for review.</span>
            )}
          </div>
        </div>
          </div>
          <aside className="lg:w-80 xl:w-96 lg:pl-4">
            <ResonanceInsights
              metrics={metrics}
              band={bandCompliance}
              latestSampleTime={latestSampleTime}
              latencyPresent={Boolean(metrics?.p99Latency)}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

