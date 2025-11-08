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
  const [license, lastMetric] = await Promise.all([
    prisma.license.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userMetric.findFirst({
      where: { userId },
      orderBy: { timestamp: "desc" },
    }),
  ]);

  return {
    license,
    lastMetricAt: lastMetric?.timestamp ?? null,
  };
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { license, lastMetricAt } = await fetchStatus(session.user.id);
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
    >
      {children}
    </DashboardChrome>
  );
}

