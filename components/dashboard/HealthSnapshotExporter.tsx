'use client';

import { useMemo } from 'react';

interface HealthSnapshotExporterProps {
  metrics: Record<string, number | null | undefined> | null;
  bandCompliance: {
    percentage: number;
    inBand: number;
    total: number;
  };
  agentVersion?: string | null;
  releaseChannel?: string | null;
  uptimePercentage?: number;
  lastSampleTime?: number | null;
  environment: string;
  agentUrl?: string | null;
}

const toCsv = (data: Record<string, unknown>) => {
  const headers = Object.keys(data);
  const values = headers.map((key) => {
    const value = data[key];
    return typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value ?? '');
  });
  return `${headers.join(',')}
${values.join(',')}`;
};

export default function HealthSnapshotExporter({
  metrics,
  bandCompliance,
  agentVersion,
  releaseChannel,
  uptimePercentage,
  lastSampleTime,
  environment,
  agentUrl,
}: HealthSnapshotExporterProps) {
  const agentHost = useMemo(() => {
    if (!agentUrl) return 'agent.host';
    try {
      return new URL(agentUrl).host || 'agent.host';
    } catch {
      return agentUrl;
    }
  }, [agentUrl]);

  const snapshot = useMemo(() => {
    const generated = new Date().toISOString();
    const latestMetrics = metrics ?? {};
    return {
      generated,
      agentVersion: agentVersion ?? 'unknown',
      releaseChannel: releaseChannel ?? 'adaptive',
      uptimePercentage: uptimePercentage ?? 0,
      lastSampleTime: lastSampleTime ? new Date(lastSampleTime).toISOString() : null,
      environment,
      agentUrl: agentUrl ?? 'not-configured',
      bandCompliance,
      metrics: {
        R: latestMetrics.R ?? null,
        spectralEntropy: latestMetrics.spectralEntropy ?? null,
        coherenceScore: latestMetrics.coherenceScore ?? null,
        tailHealthScore: latestMetrics.tailHealthScore ?? null,
        timingScore: latestMetrics.timingScore ?? null,
        lambdaRes: latestMetrics.lambdaRes ?? null,
        p50Latency: latestMetrics.p50Latency ?? null,
        p99Latency: latestMetrics.p99Latency ?? null,
      },
    };
  }, [agentVersion, releaseChannel, uptimePercentage, lastSampleTime, environment, agentUrl, bandCompliance, metrics]);

  const download = (format: 'json' | 'csv') => {
    const blobContent = format === 'json'
      ? JSON.stringify(snapshot, null, 2)
      : toCsv({
          generated: snapshot.generated,
          agentVersion: snapshot.agentVersion,
          releaseChannel: snapshot.releaseChannel,
          uptimePercentage: snapshot.uptimePercentage,
          lastSampleTime: snapshot.lastSampleTime,
          environment: snapshot.environment,
          agentUrl: snapshot.agentUrl,
          compliancePercentage: snapshot.bandCompliance.percentage.toFixed(1),
          complianceSamples: `${snapshot.bandCompliance.inBand}/${snapshot.bandCompliance.total}`,
          R: snapshot.metrics.R,
          spectralEntropy: snapshot.metrics.spectralEntropy,
          coherenceScore: snapshot.metrics.coherenceScore,
          tailHealthScore: snapshot.metrics.tailHealthScore,
          timingScore: snapshot.metrics.timingScore,
          lambdaRes: snapshot.metrics.lambdaRes,
          p50Latency: snapshot.metrics.p50Latency,
          p99Latency: snapshot.metrics.p99Latency,
        });

    const blob = new Blob([blobContent], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resonance-health-snapshot.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyCommand = (command: string) => {
    void navigator.clipboard.writeText(command);
  };

  return (
    <div className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-50">Export Health Snapshot</h2>
          <p className="text-sm text-neutral-400">
            Download the current agent status, compliance, and tail metrics for audit trails or incident reviews.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => download('json')}
            className="rounded-lg border border-brand-400/40 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-100 transition hover:bg-brand-500/20"
          >
            Download JSON
          </button>
          <button
            type="button"
            onClick={() => download('csv')}
            className="rounded-lg border border-brand-400/40 bg-surface-900/60 px-4 py-2 text-sm font-semibold text-brand-100 transition hover:bg-brand-500/10"
          >
            Download CSV
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-surface-700 bg-surface-900/70 p-4 text-xs text-neutral-400">
          <p className="font-semibold text-neutral-100">Verify agent</p>
          <p className="mt-2 font-mono">curl -fsSL {agentUrl ?? 'https://your-agent/health'}</p>
          <button
            type="button"
            onClick={() => copyCommand(`curl -fsSL ${agentUrl ?? 'https://your-agent/health'}`)}
            className="mt-3 inline-flex items-center rounded-lg border border-surface-600 px-3 py-1 text-[11px] text-neutral-300 transition hover:border-brand-400/40"
          >
            Copy curl command
          </button>
        </div>
        <div className="rounded-xl border border-surface-700 bg-surface-900/70 p-4 text-xs text-neutral-400">
          <p className="font-semibold text-neutral-100">Check SSL / ports</p>
          <p className="mt-2 font-mono">openssl s_client -connect {`${agentHost}:443`} -brief</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyCommand(`openssl s_client -connect ${agentHost}:443 -brief`)}
              className="inline-flex items-center rounded-lg border border-surface-600 px-3 py-1 text-[11px] text-neutral-300 transition hover:border-brand-400/40"
            >
              Copy SSL check
            </button>
            <button
              type="button"
              onClick={() => copyCommand(`nc -vz ${agentHost} 18080`)}
              className="inline-flex items-center rounded-lg border border-surface-600 px-3 py-1 text-[11px] text-neutral-300 transition hover:border-brand-400/40"
            >
              Copy port check
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-surface-700 bg-surface-900/70 p-4 text-xs text-neutral-400">
          <p className="font-semibold text-neutral-100">Snapshot summary</p>
          <ul className="mt-2 space-y-1">
            <li>• Uptime (24h): {(uptimePercentage ?? 0).toFixed(1)}%</li>
            <li>• Band compliance: {bandCompliance.percentage.toFixed(1)}%</li>
            <li>• Latest sample: {snapshot.lastSampleTime ?? 'n/a'}</li>
            <li>• Channel: {snapshot.releaseChannel}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
