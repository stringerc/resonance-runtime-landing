'use client';

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface DashboardStatusStripProps {
  agentUrl?: string | null;
  lastSampleAt: string | null;
  licenseLabel: string;
  agentVersion?: string | null;
  releaseChannel?: string | null;
  buildCommit?: string | null;
  environment?: string | null;
  uptimePercentage?: number;
}

const StatusPill = ({
  label,
  value,
  tone,
  href,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "neutral";
  href?: string;
}) => {
  const className = {
    good: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40",
    warn: "bg-amber-500/20 text-amber-200 border border-amber-400/40",
    neutral: "bg-surface-800 text-neutral-200 border border-surface-700",
  }[tone];

  const pill = (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-brand-glow ${className}`}>
      <span className="uppercase tracking-wide text-[10px] text-neutral-400">{label}</span>
      <span>{value}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition">
        {pill}
      </Link>
    );
  }

  return pill;
};

const agentTone = (agentUrl?: string | null) =>
  agentUrl ? ("good" as const) : ("warn" as const);

const channelTone = (channel?: string | null) => {
  if (!channel) return "neutral" as const;
  const normalized = channel.toLowerCase();
  if (normalized === "adaptive" || normalized === "active") return "good" as const;
  if (normalized === "shadow" || normalized === "canary") return "warn" as const;
  return "neutral" as const;
};

export default function DashboardStatusStrip({
  agentUrl,
  lastSampleAt,
  licenseLabel,
  agentVersion,
  releaseChannel,
  buildCommit,
  environment,
  uptimePercentage,
}: DashboardStatusStripProps) {
  const lastSample = lastSampleAt
    ? formatDistanceToNow(new Date(lastSampleAt), { addSuffix: true })
    : "No samples yet";

  const licenseTone =
    licenseLabel === "active" || licenseLabel === "pro" ? ("good" as const) : ("warn" as const);

  const versionLabel = agentVersion ? (agentVersion.startsWith("v") ? agentVersion : `v${agentVersion}`) : "Unknown";
  const commitLabel = buildCommit ? buildCommit.slice(0, 7) : null;
  const environmentLabel = environment ? environment.charAt(0).toUpperCase() + environment.slice(1) : "Unknown";
  const uptimeLabel = typeof uptimePercentage === "number" ? `${uptimePercentage.toFixed(1)}%` : "—";
  const uptimeTone = uptimePercentage !== undefined && uptimePercentage >= 99 ? "good" : uptimePercentage !== undefined && uptimePercentage >= 90 ? "neutral" : "warn";

  return (
    <div className="border-t border-b border-surface-800 bg-surface-900/75">
      <div className="flex flex-wrap items-center gap-3 px-6 py-3 text-xs text-neutral-300">
        <StatusPill
          label="Connectivity"
          value={agentUrl ? "Connected" : "Not configured"}
          tone={agentTone(agentUrl)}
          href="/docs"
        />
        <StatusPill
          label="Last sample"
          value={lastSample}
          tone={lastSampleAt ? "neutral" : "warn"}
        />
        <StatusPill
          label="License"
          value={licenseLabel}
          tone={licenseTone}
          href="/resonance/pricing"
        />
        <StatusPill
          label="Version"
          value={versionLabel}
          tone={agentVersion ? "neutral" : "warn"}
        />
        {releaseChannel && (
          <StatusPill
            label="Channel"
            value={releaseChannel}
            tone={channelTone(releaseChannel)}
          />
        )}
        <StatusPill
          label="Environment"
          value={environmentLabel}
          tone={environment === "production" ? "good" : "neutral"}
        />
        <StatusPill
          label="24h Uptime"
          value={uptimeLabel}
          tone={uptimeTone}
        />
        {commitLabel && (
          <StatusPill
            label="Commit"
            value={commitLabel}
            tone="neutral"
            href="/docs/trust"
          />
        )}
        <div className="ml-auto flex items-center gap-3 text-[11px] text-neutral-500">
          <span>Need help?</span>
          <Link href="/docs" className="text-brand-200 hover:underline">
            Read the field guide
          </Link>
        </div>
      </div>
    </div>
  );
}

