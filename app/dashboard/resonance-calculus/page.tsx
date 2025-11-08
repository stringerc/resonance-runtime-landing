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

export default function ResonanceCalculusPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Array<{ 
    time: number; 
    R: number;
    coherenceScore?: number | null;
    tailHealthScore?: number | null;
    timingScore?: number | null;
    lambdaRes?: number | null;
  }>>([]);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('daily');
  const [selectedComponent, setSelectedComponent] = useState<'coherence' | 'tail' | 'timing' | 'all'>('all');

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

  const latestSample = history.length ? history[history.length - 1] : null;
  const coherenceScore = metrics?.coherenceScore ?? latestSample?.coherenceScore ?? null;
  const tailHealthScore = metrics?.tailHealthScore ?? latestSample?.tailHealthScore ?? null;
  const timingScore = metrics?.timingScore ?? latestSample?.timingScore ?? null;
  const lambdaRes = metrics?.lambdaRes ?? latestSample?.lambdaRes ?? null;
  const latestSampleTime = latestSample?.time ?? null;

  const insightMetrics = useMemo(() => {
    if (!metrics) {
      return null;
    }
    return {
      ...metrics,
      coherenceScore,
      tailHealthScore,
      timingScore,
      lambdaRes,
    };
  }, [metrics, coherenceScore, tailHealthScore, timingScore, lambdaRes]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      const data = await response.json();
      setMetrics(data);
      
      if (data && data.R !== undefined) {
        setHistory(prev => {
          const newHistory = [...prev, {
            time: Date.now(),
            R: data.R,
            coherenceScore: data.coherenceScore,
            tailHealthScore: data.tailHealthScore,
            timingScore: data.timingScore,
            lambdaRes: data.lambdaRes,
          }];
          const maxPoints = 2000; // More points for detailed analysis
          return newHistory.slice(-maxPoints);
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setLoading(false);
    }
  };

  const getFilteredHistory = () => {
    if (history.length === 0) return [];
    
    const now = Date.now();
    const intervalMs: Record<TimeInterval, number> = {
      realtime: 5 * 1000,
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
      quarterly: 90 * 24 * 60 * 60 * 1000,
      yearly: 365 * 24 * 60 * 60 * 1000,
    };

    const interval = intervalMs[timeInterval];
    const cutoffTime = now - interval;
    
    const filtered = history.filter(point => point.time >= cutoffTime);
    
    if (filtered.length === 0) return [];
    
    // Aggregate for longer intervals
    if (timeInterval !== 'realtime' && filtered.length > 200) {
      const buckets = 200;
      const bucketSize = Math.ceil(filtered.length / buckets);
      const aggregated: typeof filtered = [];
      
      for (let i = 0; i < filtered.length; i += bucketSize) {
        const bucket = filtered.slice(i, i + bucketSize);
        const avgR = bucket.reduce((sum, p) => sum + p.R, 0) / bucket.length;
        const avgCoherence = bucket.filter(p => p.coherenceScore !== null && p.coherenceScore !== undefined)
          .reduce((sum, p) => sum + (p.coherenceScore || 0), 0) / bucket.filter(p => p.coherenceScore !== null).length || 0;
        const avgTail = bucket.filter(p => p.tailHealthScore !== null && p.tailHealthScore !== undefined)
          .reduce((sum, p) => sum + (p.tailHealthScore || 0), 0) / bucket.filter(p => p.tailHealthScore !== null).length || 0;
        const avgTiming = bucket.filter(p => p.timingScore !== null && p.timingScore !== undefined)
          .reduce((sum, p) => sum + (p.timingScore || 0), 0) / bucket.filter(p => p.timingScore !== null).length || 0;
        const avgLambda = bucket.filter(p => p.lambdaRes !== null && p.lambdaRes !== undefined)
          .reduce((sum, p) => sum + (p.lambdaRes || 0), 0) / bucket.filter(p => p.lambdaRes !== null).length || 0;
        
        aggregated.push({
          time: bucket.reduce((sum, p) => sum + p.time, 0) / bucket.length,
          R: avgR,
          coherenceScore: avgCoherence || null,
          tailHealthScore: avgTail || null,
          timingScore: avgTiming || null,
          lambdaRes: avgLambda || null,
        });
      }
      
      return aggregated;
    }
    
    return filtered;
  };

  const calculateBandCompliance = () => {
    const filtered = getFilteredHistory();
    if (filtered.length === 0) return { percentage: 0, inBand: 0, total: 0 };
    
    const inBand = filtered.filter(p => p.R >= 0.35 && p.R <= 0.65).length;
    return {
      percentage: (inBand / filtered.length) * 100,
      inBand,
      total: filtered.length,
    };
  };

  const bandCompliance = calculateBandCompliance();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Resonance Calculus data...</p>
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

  const hasCalculus =
    coherenceScore !== null ||
    tailHealthScore !== null ||
    timingScore !== null;

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
                href="/dashboard/canary"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
              >
                ← Canary Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition font-medium"
              >
                Dashboard
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resonance Calculus Analysis</h1>
          <p className="text-gray-600">
            Comprehensive breakdown of coherence-weighted service curves, tail health, and max-plus timing analysis
          </p>
          <div className="mt-3 text-sm">
            <a
              href="#metric-glossary"
              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
            >
              Need guidance? <span className="font-semibold">Open live insights →</span>
            </a>
          </div>
        </div>

        {/* Resonance Band Visualization (Patent Figure 2) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Global Resonance R(t) with Band Zones</h2>
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
          
          {/* Band Compliance */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Band Compliance</div>
                <div className="text-2xl font-bold text-gray-900">
                  {bandCompliance.percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {bandCompliance.inBand} / {bandCompliance.total} points in optimal band [0.35, 0.65]
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Target</div>
                <div className="text-lg font-semibold text-green-600">≥ 85%</div>
                <div className={`text-xs mt-1 ${bandCompliance.percentage >= 85 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {bandCompliance.percentage >= 85 ? '✓ Compliant' : '⚠ Below Target'}
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-80 bg-gray-50 rounded-lg p-4">
            <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
              {/* Resonance Band Zones */}
              {/* Low zone */}
              <rect
                x="0"
                y={(1 - 0.35) * 300}
                width="1000"
                height={0.35 * 300}
                fill="#fef3c7"
                stroke="#fbbf24"
                strokeWidth="1"
                opacity="0.4"
              />
              <text
                x="10"
                y={(1 - 0.2) * 300}
                className="text-xs font-semibold fill-yellow-700"
                fontSize="11"
              >
                LOW (&lt; 0.35)
              </text>
              
              {/* Optimal zone */}
              <rect
                x="0"
                y={(1 - 0.65) * 300}
                width="1000"
                height={(0.65 - 0.35) * 300}
                fill="#dcfce7"
                stroke="#86efac"
                strokeWidth="2"
                opacity="0.6"
              />
              <text
                x="500"
                y={(1 - 0.5) * 300}
                textAnchor="middle"
                className="text-xs font-semibold fill-green-700"
                fontSize="12"
              >
                OPTIMAL BAND [0.35, 0.65]
              </text>
              
              {/* High zone */}
              <rect
                x="0"
                y="0"
                width="1000"
                height={(1 - 0.65) * 300}
                fill="#fed7aa"
                stroke="#fb923c"
                strokeWidth="1"
                opacity="0.4"
              />
              <text
                x="10"
                y={(1 - 0.7) * 300}
                className="text-xs font-semibold fill-orange-700"
                fontSize="11"
              >
                HIGH (&gt; 0.65)
              </text>
              
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((val) => (
                <line
                  key={val}
                  x1="0"
                  y1={(1 - val) * 300}
                  x2="1000"
                  y2={(1 - val) * 300}
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
                        const x = (idx / (filtered.length - 1)) * 1000;
                        const y = (1 - point.R) * 300;
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
                    cx="1000"
                    cy={(1 - metrics.R) * 300}
                    r="8"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="3"
                  />
                  <text
                    x="990"
                    y={(1 - metrics.R) * 300 - 12}
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
                  y={(1 - val) * 300 + 4}
                  className="text-xs fill-gray-600"
                  fontSize="12"
                >
                  {val.toFixed(2)}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Component Breakdown View (Patent Figure 3) */}
        {hasCalculus && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Component Breakdown</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">View:</span>
                <select
                  value={selectedComponent}
                  onChange={(e) => setSelectedComponent(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="all">All Components</option>
                  <option value="coherence">Coherence Score</option>
                  <option value="tail">Tail Health Score</option>
                  <option value="timing">Timing Score</option>
                </select>
              </div>
            </div>
            
            <div className="relative h-64 bg-gray-50 rounded-lg p-4">
              <svg className="w-full h-full" viewBox="0 0 1000 240" preserveAspectRatio="none">
                {/* Grid */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((val) => (
                  <line
                    key={val}
                    x1="0"
                    y1={(1 - val) * 240}
                    x2="1000"
                    y2={(1 - val) * 240}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}
                
                {/* Component lines */}
                {(() => {
                  const filtered = getFilteredHistory();
                  if (filtered.length > 1) {
                    const lines: JSX.Element[] = [];
                    
                    if (selectedComponent === 'all' || selectedComponent === 'coherence') {
                      const coherencePoints = filtered
                        .filter(p => p.coherenceScore !== null && p.coherenceScore !== undefined)
                        .map((point, idx) => {
                          const x = (idx / (filtered.length - 1)) * 1000;
                          const y = (1 - (point.coherenceScore || 0)) * 240;
                          return `${x},${y}`;
                        }).join(' ');
                      if (coherencePoints) {
                        lines.push(
                          <polyline
                            key="coherence"
                            points={coherencePoints}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            opacity="0.8"
                          />
                        );
                      }
                    }
                    
                    if (selectedComponent === 'all' || selectedComponent === 'tail') {
                      const tailPoints = filtered
                        .filter(p => p.tailHealthScore !== null && p.tailHealthScore !== undefined)
                        .map((point, idx) => {
                          const x = (idx / (filtered.length - 1)) * 1000;
                          const y = (1 - (point.tailHealthScore || 0)) * 240;
                          return `${x},${y}`;
                        }).join(' ');
                      if (tailPoints) {
                        lines.push(
                          <polyline
                            key="tail"
                            points={tailPoints}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            opacity="0.8"
                          />
                        );
                      }
                    }
                    
                    if (selectedComponent === 'all' || selectedComponent === 'timing') {
                      const timingPoints = filtered
                        .filter(p => p.timingScore !== null && p.timingScore !== undefined)
                        .map((point, idx) => {
                          const x = (idx / (filtered.length - 1)) * 1000;
                          const y = (1 - (point.timingScore || 0)) * 240;
                          return `${x},${y}`;
                        }).join(' ');
                      if (timingPoints) {
                        lines.push(
                          <polyline
                            key="timing"
                            points={timingPoints}
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            opacity="0.8"
                          />
                        );
                      }
                    }
                    
                    return lines;
                  }
                  return null;
                })()}
                
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
            
            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm">
              {selectedComponent === 'all' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-600"></div>
                    <span className="text-gray-700">Coherence Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-green-600"></div>
                    <span className="text-gray-700">Tail Health Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-purple-600"></div>
                    <span className="text-gray-700">Timing Score</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Current Component Values */}
        {hasCalculus && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {coherenceScore !== null && coherenceScore !== undefined && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Coherence Score</h3>
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  {(coherenceScore * 100).toFixed(1)}%
                </div>
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.min(Math.max(coherenceScore * 100, 0), 100)}%` }}
                  />
                </div>
                <div className="text-xs text-blue-700 mt-2">
                  CWSC: β_c(t) / β(t)
                </div>
              </div>
            )}
            
              {tailHealthScore !== null && tailHealthScore !== undefined && (                                                             
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <h3 className="text-sm font-semibold text-green-900 mb-2">Tail Health Score</h3>
                <div className="text-3xl font-bold text-green-700 mb-2">
                    {(tailHealthScore * 100).toFixed(1)}%
                </div>
                <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all duration-300"
                      style={{ width: `${Math.min(Math.max(tailHealthScore * 100, 0), 100)}%` }}
                  />
                </div>
                <div className="text-xs text-green-700 mt-2">
                  EVT/GPD Model
                </div>
              </div>
            )}
            
              {timingScore !== null && timingScore !== undefined && (                                                                     
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">Timing Score</h3>
                <div className="text-3xl font-bold text-purple-700 mb-2">
                    {(timingScore * 100).toFixed(1)}%
                </div>
                <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${Math.min(Math.max(timingScore * 100, 0), 100)}%` }}
                  />
                </div>
                <div className="text-xs text-purple-700 mt-2">
                  Max-Plus Algebra
                </div>
              </div>
            )}
            
            {lambdaRes !== null && lambdaRes !== undefined && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <h3 className="text-sm font-semibold text-orange-900 mb-2">Max-Plus λ_res</h3>
                <div className="text-2xl font-bold text-orange-700 mb-2">
                  {lambdaRes.toFixed(3)}
                </div>
                <div className="text-xs text-orange-600 mb-2">Cycle Time</div>
                <div className="text-xs text-orange-700">
                  {lambdaRes < 10 ? '✓ Fast' : lambdaRes < 50 ? '⚠ Moderate' : '⚠ Slow'}                                                        
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tail Health Analysis Panel */}
        {tailHealthScore !== null && tailHealthScore !== undefined && (                                                                         
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Tail Health Analysis</h2>
            
            {/* Summary */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tail Health Score</div>
                  <div className="text-4xl font-bold text-gray-900">
                    {(tailHealthScore * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        tailHealthScore >= 0.7 ? 'bg-green-600' :
                        tailHealthScore >= 0.5 ? 'bg-yellow-500' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(Math.max(tailHealthScore * 100, 0), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GPD Parameters */}
            {metrics.gpd && (metrics.gpd.xi !== null || metrics.gpd.sigma !== null || metrics.gpd.threshold !== null) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">GPD Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {metrics.gpd.xi !== null && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Shape Parameter (ξ)</div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{metrics.gpd.xi.toFixed(4)}</div>
                      <div className="text-xs text-gray-500">
                        {metrics.gpd.xi > 0 ? 'Heavy tail (ξ > 0)' : 
                         metrics.gpd.xi < 0 ? 'Light tail (ξ < 0)' : 
                         'Exponential (ξ ≈ 0)'}
                      </div>
                    </div>
                  )}
                  {metrics.gpd.sigma !== null && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Scale Parameter (σ)</div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{metrics.gpd.sigma.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Scale of tail distribution</div>
                    </div>
                  )}
                  {metrics.gpd.threshold !== null && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Threshold (u)</div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{metrics.gpd.threshold.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Tail modeling start point</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tail Quantiles */}
            {metrics.tailQuantiles && (metrics.tailQuantiles.q99 !== null || metrics.tailQuantiles.q99_9 !== null) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Tail Quantiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metrics.tailQuantiles.q99 !== null && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Q99 (99th Percentile)</div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{metrics.tailQuantiles.q99.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">99% of values below this threshold</div>
                    </div>
                  )}
                  {metrics.tailQuantiles.q99_9 !== null && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Q99.9 (99.9th Percentile)</div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{metrics.tailQuantiles.q99_9.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">99.9% of values below this threshold</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Max-Plus Timing Analysis */}
        {lambdaRes !== null && lambdaRes !== undefined && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Max-Plus Timing Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Cycle Time (λ_res)</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {lambdaRes.toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">
                  {lambdaRes < 10 ? '✓ Fast cycle time - good synchronization' :
                   lambdaRes < 50 ? '⚠ Moderate cycle time - monitor bottlenecks' :
                   '⚠ Slow cycle time - potential bottlenecks detected'}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Timing Score</h3>
                {timingScore !== null && timingScore !== undefined ? (
                  <>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {(timingScore * 100).toFixed(1)}%
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${Math.min(Math.max(timingScore * 100, 0), 100)}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Derived from max-plus eigenvalue: 1 / (1 + λ_res / scale)
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">Not available</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resonance Balance View (Patent Figure 4) */}
        {hasCalculus && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Resonance Balance</h2>
            <p className="text-sm text-gray-600 mb-4">
              Multi-dimensional view of system resonance across key dimensions
            </p>
            
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Background circle */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                  
                  {/* Grid lines */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    const x1 = 100 + 80 * Math.cos(rad);
                    const y1 = 100 + 80 * Math.sin(rad);
                    return (
                      <line
                        key={angle}
                        x1="100"
                        y1="100"
                        x2={x1}
                        y2={y1}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    );
                  })}
                  
                  {/* Data polygon */}
                  {(() => {
                    const coherence = coherenceScore || 0;
                    const tail = tailHealthScore || 0;
                    const timing = timingScore || 0;
                    const entropy = metrics?.spectralEntropy ?? 0;
                    
                    const points = [
                      { angle: 0, value: coherence },      // Coherence (right)
                      { angle: 90, value: tail },         // Tail Health (top)
                      { angle: 180, value: timing },       // Timing (left)
                      { angle: 270, value: entropy },      // Spectral Entropy (bottom)
                    ];
                    
                    const path = points.map((p, idx) => {
                      const rad = (p.angle * Math.PI) / 180;
                      const r = 80 * p.value;
                      const x = 100 + r * Math.cos(rad);
                      const y = 100 + r * Math.sin(rad);
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ') + ' Z';
                    
                    return (
                      <>
                        <path
                          d={path}
                          fill="rgba(59, 130, 246, 0.2)"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                        {points.map((p, idx) => {
                          const rad = (p.angle * Math.PI) / 180;
                          const r = 80 * p.value;
                          const x = 100 + r * Math.cos(rad);
                          const y = 100 + r * Math.sin(rad);
                          return (
                            <circle
                              key={idx}
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#3b82f6"
                            />
                          );
                        })}
                      </>
                    );
                  })()}
                  
                  {/* Labels */}
                  <text x="100" y="20" textAnchor="middle" className="text-xs fill-gray-700" fontSize="12">
                    Tail Health
                  </text>
                  <text x="190" y="105" textAnchor="middle" className="text-xs fill-gray-700" fontSize="12">
                    Coherence
                  </text>
                  <text x="100" y="190" textAnchor="middle" className="text-xs fill-gray-700" fontSize="12">
                    Entropy
                  </text>
                  <text x="10" y="105" textAnchor="middle" className="text-xs fill-gray-700" fontSize="12">
                    Timing
                  </text>
                </svg>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600 mb-1">Coherence</div>
                <div className="text-lg font-bold text-gray-900">
                  {coherenceScore !== null && coherenceScore !== undefined ? (coherenceScore * 100).toFixed(0) : '0'}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Tail Health</div>
                <div className="text-lg font-bold text-gray-900">
                  {tailHealthScore !== null && tailHealthScore !== undefined ? (tailHealthScore * 100).toFixed(0) : '0'}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Timing</div>
                <div className="text-lg font-bold text-gray-900">
                  {timingScore !== null && timingScore !== undefined ? (timingScore * 100).toFixed(0) : '0'}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Entropy</div>
                <div className="text-lg font-bold text-gray-900">
                  {(metrics?.spectralEntropy !== undefined && metrics?.spectralEntropy !== null
                    ? metrics.spectralEntropy * 100
                    : 0
                  ).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info message if Resonance Calculus not available */}
        {!hasCalculus && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 text-xl">ℹ️</div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Resonance Calculus Metrics Not Available</h3>
                <p className="text-sm text-yellow-800 mb-2">
                  Resonance Calculus metrics require sufficient data collection. The agent needs to:
                </p>
                <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                  <li>Collect at least 50 latency samples for tail analysis</li>
                  <li>Build coherence history from phase updates</li>
                  <li>Compute max-plus eigenvalue from dependency graph</li>
                </ul>
                <p className="text-sm text-yellow-800 mt-3">
                  Once these conditions are met, component breakdown, tail health analysis, and timing metrics will appear here.
                </p>
              </div>
            </div>
          </div>
        )}
          </div>
          <ResonanceInsights
            metrics={insightMetrics}
            band={bandCompliance}
            latestSampleTime={latestSampleTime}
            latencyPresent={Boolean(metrics?.p99Latency)}
          />
        </div>
      </div>
    </div>
  );
}

