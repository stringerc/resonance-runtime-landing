import Link from "next/link";

export default function ResonanceCalculusPaperPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">Research</p>
          <h1 className="text-3xl font-bold text-neutral-50">
            A Resonance Calculus for Tail-Aware Optimization and Control of Discrete-Event Systems
          </h1>
          <div className="text-sm text-neutral-300 space-y-1">
            <p>
              <span className="font-semibold text-neutral-100">Author:</span> Christopher A. Stringer
            </p>
            <p>Independent Researcher, Duluth, GA, USA</p>
            <p>November 2025</p>
          </div>
        </header>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">Abstract</h2>
          <p className="text-sm text-neutral-300">
            We propose <em>Resonance Calculus</em> (RC) and <em>Resonance Algebra</em>, a unified framework for modeling and optimizing the
            performance of large-scale discrete-event systems under coherence, timing, and tail constraints. RC combines coherence-weighted
            service models, tail-aware risk metrics derived from Extreme Value Theory (EVT), and max-plus algebra for synchronization,
            cycle-time, and bottleneck analysis on networks of interdependent components. These ingredients yield scalar resonance scores and
            max-plus eigenvalues that can be used as control signals for routing, scheduling, and resource allocation.
          </p>
          <p className="text-sm text-neutral-300">
            We formulate resonance metrics, relate them to service curves and max-plus cycle times, and outline feedback laws that regulate
            resonance within prescribed bands under explicit SLO and safety constraints. The framework applies to cloud and edge computing,
            embedded and IoT controllers, fleet and operations systems, and hybrid quantum–classical workflows. We provide illustrative
            constructions and discuss how RC can be integrated with existing optimization and control stacks. Long-range speculative physics
            or propulsion concepts are deliberately excluded; we focus on mechanisms that are concretely implementable with current or
            near-term technology.
          </p>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow space-y-4">
          <h2 className="text-xl font-semibold text-neutral-50">Download</h2>
          <p className="text-sm text-neutral-300">You can download the current draft as a PDF.</p>
          <Link
            href="/docs/A_Resonance_Calculus_for_Tail_Aware_Optimization_and_Control_of_Discrete_Event_Systems.pdf"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500/90 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-brand-400"
          >
            Download the draft (PDF)
          </Link>
          <p className="text-xs text-neutral-500">Replace this placeholder PDF with the full manuscript when available.</p>
        </section>

        <section className="rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-brand-glow">
          <h2 className="text-xl font-semibold text-neutral-50">About the Author</h2>
          <p className="mt-2 text-sm text-neutral-300">
            Christopher A. Stringer is an independent researcher based in Duluth, GA, USA, working at the intersection of optimization and
            control of discrete-event systems, performance engineering, and human-in-the-loop scheduling.
          </p>
        </section>
      </div>
    </div>
  );
}
