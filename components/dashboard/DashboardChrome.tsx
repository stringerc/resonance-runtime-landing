'use client';

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardStatusStrip from "./DashboardStatusStrip";

interface NavLink {
  href: string;
  label: string;
}

interface DashboardChromeProps {
  children: ReactNode;
  navLinks: NavLink[];
  userEmail: string;
  licenseLabel: string;
  lastSampleAt: string | null;
  agentUrl?: string | null;
  agentVersion?: string | null;
  releaseChannel?: string | null;
  buildCommit?: string | null;
  environment?: string | null;
  uptimePercentage?: number;
}

export default function DashboardChrome({
  children,
  navLinks,
  userEmail,
  licenseLabel,
  lastSampleAt,
  agentUrl,
  agentVersion,
  releaseChannel,
  buildCommit,
  environment,
  uptimePercentage,
}: DashboardChromeProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <div className="min-h-screen bg-surface-900 text-neutral-50">
      <header className="sticky top-0 z-40 border-b border-surface-700 bg-surface-900/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-lg font-semibold text-brand-200">
              Resonance Platform
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${isActive(link.href) ? "text-brand-200" : "hover:text-brand-200"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-300">
            <span className="hidden sm:inline">{userEmail}</span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-brand-300/30 px-3 py-1 text-brand-100 transition hover:bg-brand-500/10"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
        <DashboardStatusStrip
          agentUrl={agentUrl}
          lastSampleAt={lastSampleAt}
          licenseLabel={licenseLabel}
          agentVersion={agentVersion}
          releaseChannel={releaseChannel}
          buildCommit={buildCommit}
          environment={environment}
          uptimePercentage={uptimePercentage}
        />
      </header>
      <div className="flex min-h-[calc(100vh-4.5rem)]">
        <aside className="hidden lg:flex w-64 flex-col border-r border-surface-800 bg-surface-900/70 backdrop-blur-md">
          <div className="px-6 py-6 text-xs uppercase tracking-wide text-neutral-500">
            Navigation
          </div>
          <nav className="flex-1 space-y-1 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  isActive(link.href)
                    ? "bg-surface-800 text-brand-100"
                    : "text-neutral-300 hover:bg-surface-800 hover:text-brand-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 py-6 text-xs text-neutral-500">
            Need help? Visit{" "}
            <Link href="/docs" className="text-brand-200 hover:underline">
              docs
            </Link>
            .
          </div>
        </aside>
        <main className="flex-1 bg-surface-900/90">{children}</main>
      </div>
    </div>
  );
}

