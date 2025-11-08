'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ResonanceInsights from '@/components/ResonanceInsights';

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
      case 'adaptive': return 'text-blue-600';
      case 'active': return 'text-green-600';
      case 'shadow': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getBandStatus = (r: number) => {
    if (r >= 0.35 && r <= 0.65) return { status: 'optimal', color: 'text-green-600' };
    if (r < 0.35) return { status: 'low', color: 'text-yellow-600' };
    return { status: 'high', color: 'text-orange-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load metrics</p>
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Resonance Calculus
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/resonance-calculus"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Resonance Calculus →
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Canary Mode Monitoring</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>
              Elapsed: <strong>{elapsedHours.toFixed(1)} hours</strong> / 24 hours
            </span>
            <span className="text-primary-600">
              Mode:{' '}
              <strong className={getModeColor(modeLabel)}>
                {modeLabel.charAt(0).toUpperCase() + modeLabel.slice(1)}
              </strong>
            </span>
            <a
              href="#metric-glossary"
              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
            >
              Need guidance? <span className="font-semibold">Open live insights →</span>
            </a>
          </div>
        </div>

        {/* Main Graph */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Global Resonance Overview</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Time Range:</span>
              <select
                value={timeInterval}
                onChange={(e) => setTimeInterval(e.target.value as TimeInterval)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
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
          <div className="relative h-64 bg-gray-50 rounded-lg p-4">
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
          <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
            <div>
              <span>Target Band: [0.35, 0.65]</span>
              <span className="mx-2">|</span>
              <span>Current: {metrics.R.toFixed(3)}</span>
              <span className="mx-2">|</span>
              <span>Status: <span className={bandStatus.color}>{bandStatus.status.toUpperCase()}</span></span>
            </div>
            <div className="text-xs text-gray-500">
              {getFilteredHistory().length} data points shown ({history.length} total stored)
            </div>
          </div>
        </div>

        {/* Resonance Components Panel */}
        {(metrics.coherenceScore !== null && metrics.coherenceScore !== undefined) ||
         (metrics.tailHealthScore !== null && metrics.tailHealthScore !== undefined) ||
         (metrics.timingScore !== null && metrics.timingScore !== undefined) ||
         (metrics.lambdaRes !== null && metrics.lambdaRes !== undefined) ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Resonance Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Coherence Score */}
              {metrics.coherenceScore !== null && metrics.coherenceScore !== undefined && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Coherence Score</h3>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-blue-700">
                      {(metrics.coherenceScore * 100).toFixed(0)}
                    </div>
                    <span className="text-sm text-blue-600">%</span>
                  </div>
                  <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${metrics.coherenceScore * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    {metrics.coherenceScore >= 0.5 ? '✓ Optimal' : '⚠ Low'}
                  </div>
                </div>
              )}

              {/* Tail Health Score */}
              {metrics.tailHealthScore !== null && metrics.tailHealthScore !== undefined && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">Tail Health Score</h3>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-green-700">
                      {(metrics.tailHealthScore * 100).toFixed(0)}
                    </div>
                    <span className="text-sm text-green-600">%</span>
                  </div>
                  <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all duration-300"
                      style={{ width: `${metrics.tailHealthScore * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    {metrics.tailHealthScore >= 0.5 ? '✓ Healthy' : '⚠ Risk'}
                  </div>
                </div>
              )}

              {/* Timing Score */}
              {metrics.timingScore !== null && metrics.timingScore !== undefined && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">Timing Score</h3>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-purple-700">
                      {(metrics.timingScore * 100).toFixed(0)}
                    </div>
                    <span className="text-sm text-purple-600">%</span>
                  </div>
                  <div className="mt-2 h-2 bg-purple-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${metrics.timingScore * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-purple-700 mt-1">
                    {metrics.timingScore >= 0.5 ? '✓ Synchronized' : '⚠ Delayed'}
                  </div>
                </div>
              )}

              {/* Max-Plus Eigenvalue */}
              {metrics.lambdaRes !== null && metrics.lambdaRes !== undefined && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <h3 className="text-sm font-semibold text-orange-900 mb-2">Max-Plus λ_res</h3>
                  <div className="text-2xl font-bold text-orange-700">
                    {metrics.lambdaRes.toFixed(3)}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">Cycle Time</div>
                  <div className="text-xs text-orange-700 mt-1">
                    {metrics.lambdaRes < 10 ? '✓ Fast' : metrics.lambdaRes < 50 ? '⚠ Moderate' : '⚠ Slow'}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Supporting Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Latency P99</h3>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.p99Latency ? `${Math.round(metrics.p99Latency)}ms` : 'N/A'}
            </div>
            {metrics.p99Latency ? (
              metrics.latencyImprovement ? (
                <div className="text-sm text-green-600 mt-1">
                  ↓ {metrics.latencyImprovement}% (1h)
                </div>
              ) : (
                <div className="text-sm text-gray-500 mt-1">
                  {metrics.p50Latency ? `P50: ${Math.round(metrics.p50Latency)}ms` : 'Monitoring...'}
                </div>
              )
            ) : (
              <div className="text-sm text-gray-500 mt-1">
                {metrics.mock ? 'Mock data - no latency' : metrics.error ? 'Agent not accessible' : 'Waiting for data...'}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Spectral Entropy</h3>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.spectralEntropy.toFixed(2)}
            </div>
            <div className="text-sm text-green-600 mt-1">
              {metrics.spectralEntropy >= 0.4 && metrics.spectralEntropy <= 0.6 ? '✓ Balanced' : '⚠ Monitor'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Controller Mode</h3>
            <div className={`text-2xl font-bold ${getModeColor(modeLabel)}`}>
              {modeLabel.charAt(0).toUpperCase() + modeLabel.slice(1)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              K(t) = {metrics.K.toFixed(3)}
            </div>
          </div>
        </div>

        {/* Tail Health Details (Expandable) */}
        {metrics.tailHealthScore !== null && metrics.tailHealthScore !== undefined && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Tail Health Analysis</h2>
              <button
                onClick={() => setTailHealthExpanded(!tailHealthExpanded)}
                className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition"
              >
                {tailHealthExpanded ? '▼ Hide Details' : '▶ Show Details'}
              </button>
            </div>
            
            {/* Summary */}
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tail Health Score</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {(metrics.tailHealthScore * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
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
              <div className="border-t border-gray-200 pt-4 space-y-4">
                {/* GPD Parameters */}
                {metrics.gpd && (metrics.gpd.xi !== null || metrics.gpd.sigma !== null || metrics.gpd.threshold !== null) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">GPD Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {metrics.gpd.xi !== null && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Shape Parameter (ξ)</div>
                          <div className="text-lg font-bold text-gray-900">{metrics.gpd.xi.toFixed(4)}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {metrics.gpd.xi > 0 ? 'Heavy tail' : metrics.gpd.xi < 0 ? 'Light tail' : 'Exponential'}
                          </div>
                        </div>
                      )}
                      {metrics.gpd.sigma !== null && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Scale Parameter (σ)</div>
                          <div className="text-lg font-bold text-gray-900">{metrics.gpd.sigma.toFixed(2)}</div>
                          <div className="text-xs text-gray-500 mt-1">Scale of tail distribution</div>
                        </div>
                      )}
                      {metrics.gpd.threshold !== null && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Threshold (u)</div>
                          <div className="text-lg font-bold text-gray-900">{metrics.gpd.threshold.toFixed(2)}</div>
                          <div className="text-xs text-gray-500 mt-1">Tail modeling start point</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tail Quantiles */}
                {metrics.tailQuantiles && (metrics.tailQuantiles.q99 !== null || metrics.tailQuantiles.q99_9 !== null) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Tail Quantiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {metrics.tailQuantiles.q99 !== null && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Q99 (99th Percentile)</div>
                          <div className="text-lg font-bold text-gray-900">{metrics.tailQuantiles.q99.toFixed(2)}</div>
                          <div className="text-xs text-gray-500 mt-1">99% of values below this</div>
                        </div>
                      )}
                      {metrics.tailQuantiles.q99_9 !== null && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Q99.9 (99.9th Percentile)</div>
                          <div className="text-lg font-bold text-gray-900">{metrics.tailQuantiles.q99_9.toFixed(2)}</div>
                          <div className="text-xs text-gray-500 mt-1">99.9% of values below this</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(!metrics.gpd || (metrics.gpd.xi === null && metrics.gpd.sigma === null && metrics.gpd.threshold === null)) &&
                 (!metrics.tailQuantiles || (metrics.tailQuantiles.q99 === null && metrics.tailQuantiles.q99_9 === null)) && (
                  <div className="text-sm text-gray-500 italic">
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
                <span className="text-sm text-gray-600">Agent Status</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  metrics.agentConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {metrics.agentConnected ? '✅ Connected' : '❌ Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Environment</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {metrics.environment || 'Unknown'}
                </span>
              </div>
              {metrics.mock && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Source</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                    ⚠️ Mock Data
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Agent URL</span>
                <span className="text-xs font-mono text-gray-700 truncate max-w-[200px]" title={metrics.agentUrl}>
                  {metrics.agentUrl || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Update</span>
                <span className="text-xs text-gray-700">
                  {metrics.timestamp ? new Date(metrics.timestamp).toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Update Interval</span>
                <span className="text-xs text-gray-700">5 seconds</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Points Collected</span>
                <span className="text-sm font-medium text-gray-900">
                  {history.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Retention</span>
                <span className="text-xs text-gray-700">
                  {Math.round((history.length * 5) / 60)} minutes
                </span>
              </div>
              {metrics.error && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Error</span>
                  <span className="text-xs text-red-600 max-w-[200px] text-right">
                    {metrics.error}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Canary Validation Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-primary-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((elapsedHours / 24) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            {elapsedHours < 24 ? (
              <span>{elapsedHours.toFixed(1)} / 24 hours ({(elapsedHours / 24 * 100).toFixed(1)}%)</span>
            ) : (
              <span className="text-green-600 font-semibold">✅ 24 hours complete! Ready for review.</span>
            )}
          </div>
        </div>
          </div>
          <ResonanceInsights
            metrics={metrics}
            band={bandCompliance}
            latestSampleTime={latestSampleTime}
            latencyPresent={Boolean(metrics?.p99Latency)}
          />
        </div>
      </div>
    </div>
  );
}

