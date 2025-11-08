import Link from "next/link";

const docLinks = [
  {
    title: "Quickstart",
    description: "Bring the Resonance Agent online with adaptive mode and sample feeds.",
    href: "/docs/quickstart",
  },
  {
    title: "Resonance Calculus Dossier",
    description: "Mathematical foundations and interpretation of R(t), coherence, and tail health.",
    href: "/docs/resonance-calculus-dossier.md",
  },
  {
    title: "Phase Intake",
    description: "Feed phase samples into the controller via SDK or the bench harness.",
    href: "/docs/phase-intake",
  },
  {
    title: "Latency Feed",
    description: "Stream p50/p95/p99 percentiles to unlock tail metrics and timing scores.",
    href: "/docs/latency-feed",
  },
  {
    title: "Agent Operations",
    description: "Deploy, monitor, and update the Resonance Agent across environments.",
    href: "/docs/agent-operations",
  },
];

export default function DocsIndexPage() {
  return (
    <div className="lg:pl-64">
      <div className="px-6 py-12">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-neutral-50">Documentation</h1>
          <p className="mt-3 text-neutral-400">
            Start with the quickstart checklist, then explore deeper guides as you integrate Resonance.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {docLinks.map((doc) => (
            <Link
              key={doc.title}
              href={doc.href}
              className="rounded-2xl border border-surface-800 bg-surface-900/70 p-6 shadow-brand-glow transition hover:border-brand-500/30 hover:bg-surface-800"
            >
              <h2 className="text-lg font-semibold text-neutral-100">{doc.title}</h2>
              <p className="mt-2 text-sm text-neutral-400">{doc.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-200">
                Read guide →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
