import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import DashboardChrome from "@/components/dashboard/DashboardChrome";
import { redirect } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/canary", label: "Canary Mode" },
  { href: "/dashboard/resonance-calculus", label: "Resonance Calculus" },
  { href: "/docs", label: "Docs" },
];

async function fetchStatus(userId: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [license, lastMetric, recentSamples] = await Promise.all([
    prisma.license.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userMetric.findFirst({
      where: { userId },
      orderBy: { timestamp: "desc" },
    }),
    prisma.userMetric.findMany({
      where: {
        userId,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: "asc" },
      take: 500,
    }),
  ]);

  const uptimePercentage = (() => {
    if (!recentSamples.length) {
      return 0;
    }
    const windowMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    let covered = 0;
    for (let i = 0; i < recentSamples.length; i += 1) {
      const current = recentSamples[i].timestamp.getTime();
      const next = i + 1 < recentSamples.length ? recentSamples[i + 1].timestamp.getTime() : now;
      const gap = Math.max(0, Math.min(next - current, 10 * 60 * 1000));
      covered += gap;
    }
    return Math.max(0, Math.min(100, (covered / windowMs) * 100));
  })();

  return {
    license,
    lastMetricAt: lastMetric?.timestamp ?? null,
    uptimePercentage,
  };
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { license, lastMetricAt, uptimePercentage } = await fetchStatus(session.user.id);
  const licenseLabel =
    license?.status === "ACTIVE"
      ? license?.type?.toLowerCase() ?? license?.resonanceType ?? "active"
      : license?.status?.toLowerCase() ?? "none";

  return (
    <DashboardChrome
      navLinks={navLinks}
      userEmail={session.user.email ?? "user"}
      licenseLabel={licenseLabel}
      lastSampleAt={lastMetricAt ? lastMetricAt.toISOString() : null}
      agentUrl={process.env.RESONANCE_AGENT_URL ?? null}
      agentVersion={process.env.RESONANCE_AGENT_VERSION ?? null}
      releaseChannel={process.env.RESONANCE_RELEASE_CHANNEL ?? undefined}
      buildCommit={process.env.RESONANCE_AGENT_COMMIT ?? null}
      environment={process.env.VERCEL ? "production" : process.env.NODE_ENV ?? "development"}
      uptimePercentage={uptimePercentage}
    >
      {children}
    </DashboardChrome>
  );
}

