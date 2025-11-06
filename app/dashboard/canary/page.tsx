'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Metrics {
  R: number;
  K: number;
  spectralEntropy: number;
  mode: string;
  modeValue: number;
  p99Latency?: number;
  latencyImprovement?: number;
  error?: string;
}

interface AIInsight {
  main: string;
  confidence: number;
  supporting: {
    title: string;
    value: string;
    status: 'good' | 'warning' | 'critical';
  }[];
}

export default function CanaryDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [elapsedHours, setElapsedHours] = useState(0);
  const [history, setHistory] = useState<Array<{ time: number; R: number }>>([]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
      
      // Add to history (keep last 50 points for graph)
      if (data && data.R !== undefined) {
        setHistory(prev => {
          const newHistory = [...prev, { time: Date.now(), R: data.R }];
          // Keep only last 50 points
          return newHistory.slice(-50);
        });
      }
      
      // Generate AI insights
      if (data) {
        generateInsights(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setLoading(false);
    }
  };

  const generateInsights = (m: Metrics) => {
    const modeLabels: { [key: number]: string } = {
      0: 'observe',
      1: 'shadow',
      2: 'adaptive',
      3: 'active'
    };

    const mode = modeLabels[m.modeValue] || 'unknown';
    const inBand = m.R >= 0.35 && m.R <= 0.65;
    const entropyOptimal = m.spectralEntropy >= 0.4 && m.spectralEntropy <= 0.6;

    let mainInsight = '';
    let confidence = 95;

    if (mode === 'adaptive' && inBand && entropyOptimal) {
      mainInsight = `System performance optimal. R(t) at ${m.R.toFixed(2)} within target band [0.35, 0.65]. Controller in adaptive mode managing traffic. ${m.latencyImprovement ? `Latency improved ${m.latencyImprovement}%` : 'Monitoring in progress'}.`;
      confidence = 95;
    } else if (mode === 'adaptive' && !inBand) {
      mainInsight = `R(t) at ${m.R.toFixed(2)} outside target band. Controller adjusting coupling K(t) to ${m.K.toFixed(2)}. Monitor closely.`;
      confidence = 85;
    } else {
      mainInsight = `System in ${mode} mode. Monitoring metrics and controller behavior.`;
      confidence = 80;
    }

    setInsights({
      main: mainInsight,
      confidence,
      supporting: [
        {
          title: 'R(t) & Target Band',
          value: `${m.R.toFixed(2)} (target: [0.35, 0.65])`,
          status: inBand ? 'good' : 'warning'
        },
        {
          title: 'Spectral Entropy',
          value: `${m.spectralEntropy.toFixed(2)} ${entropyOptimal ? '✓ Balanced' : '⚠ Monitor'}`,
          status: entropyOptimal ? 'good' : 'warning'
        },
        {
          title: 'Controller Mode',
          value: `${mode.charAt(0).toUpperCase() + mode.slice(1)} (K=${m.K.toFixed(2)})`,
          status: mode === 'adaptive' ? 'good' : 'warning'
        }
      ]
    });
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Canary Mode Monitoring</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Elapsed: <strong>{elapsedHours.toFixed(1)} hours</strong> / 24 hours</span>
            <span className="text-primary-600">Mode: <strong className={getModeColor(modeLabel)}>{modeLabel.charAt(0).toUpperCase() + modeLabel.slice(1)}</strong></span>
          </div>
        </div>

        {/* Main Graph */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Global Resonance Overview</h2>
          <div className="relative h-64 bg-gray-50 rounded-lg p-4">
            {/* Target Band Visualization */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <div className="relative h-full">
                {/* Target band area */}
                <div
                  className="absolute w-full bg-green-100 border-2 border-green-300"
                  style={{
                    top: `${(1 - 0.65) * 100}%`,
                    height: `${(0.65 - 0.35) * 100}%`,
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 text-center text-xs text-green-700 font-semibold py-1">
                    TARGET BAND
                  </div>
                </div>
                
                {/* Current R(t) value */}
                <div
                  className="absolute left-0 right-0 flex items-center"
                  style={{ top: `${(1 - metrics.R) * 100}%` }}
                >
                  <div className="w-full flex items-center">
                    <div className={`w-3 h-3 rounded-full ${bandStatus.color.replace('text-', 'bg-')} mr-2`}></div>
                    <span className="text-sm font-semibold">
                      R(t) = {metrics.R.toFixed(3)} ({bandStatus.status})
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600 pl-2">
              <span>1.00</span>
              <span>0.75</span>
              <span>0.50</span>
              <span>0.25</span>
              <span>0.00</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Target Band: [0.35, 0.65] | Current: {metrics.R.toFixed(3)} | Status: <span className={bandStatus.color}>{bandStatus.status.toUpperCase()}</span></p>
          </div>
        </div>

        {/* Supporting Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Latency P99</h3>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.p99Latency ? `${metrics.p99Latency}ms` : 'N/A'}
            </div>
            {metrics.p99Latency ? (
              metrics.latencyImprovement ? (
                <div className="text-sm text-green-600 mt-1">
                  ↓ {metrics.latencyImprovement}% (1h)
                </div>
              ) : (
                <div className="text-sm text-gray-500 mt-1">
                  Monitoring...
                </div>
              )
            ) : (
              <div className="text-sm text-gray-500 mt-1">
                {metrics.error ? 'Agent not accessible' : 'Waiting for data...'}
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

        {/* AI Insights */}
        {insights && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🤖</span> AI Insights
            </h2>
            
            {/* Main Insight */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
              <div className="font-semibold text-blue-900 mb-1">MAIN INSIGHT</div>
              <p className="text-blue-800">{insights.main}</p>
              <div className="text-xs text-blue-600 mt-2">Confidence: {insights.confidence}%</div>
            </div>

            {/* Supporting Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.supporting.map((insight, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">{insight.title}</div>
                  <div className={`text-lg font-bold ${
                    insight.status === 'good' ? 'text-green-600' :
                    insight.status === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {insight.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
    </div>
  );
}

