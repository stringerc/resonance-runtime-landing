import Link from "next/link";

const glossary = [
  {
    term: "Global Resonance R(t)",
    description:
      'Kuramoto order parameter. Picture each service call as a drummer: R(t) near 1.0 means they strike in unison, R(t) near 0.0 means everyone is drifting. The “in tune” band is 0.35–0.65.',
  },
  {
    term: "Band Compliance",
    description:
      "Share of recent samples that landed inside the optimal band. Feed steady, real traffic and compliance climbs; silence or monotone load keeps it low.",
  },
  {
    term: "Spectral Entropy",
    description:
      "Variety of request patterns. 0.40–0.60 signals a balanced mix. Too low means repetitive load, too high means noisy / unpredictable traffic.",
  },
  {
    term: "Coherence Score",
    description:
      "Derived from the coherence-weighted service curve (CWSC). Shows how evenly work propagates—high coherence means minimal phase drift between services.",
  },
  {
    term: "Tail Health Score",
    description:
      "Grounded in Extreme Value Theory (GPD fit). High scores mean p99/p99.9 latency remains tame even during bursts.",
  },
  {
    term: "Timing Score & λ_res",
    description:
      "Max-Plus algebra tracks cycle time. λ_res highlights the slowest feedback loop. Lower values → faster turnaround across the system.",
  },
  {
    term: "Coupling K(t)",
    description:
      "Adaptive gain the agent applies. Low K means gentle nudges, higher K reinforces stronger corrections. The agent tunes this automatically in adaptive mode.",
  },
  {
    term: "Latency Percentiles",
    description:
      "p50 / p95 / p99 / p99.9 summarise typical through worst-case response times. These populate once services stream latency samples to the agent.",
  },
];

export default function MetricGlossary() {
  return (
    <aside
      id="metric-glossary"
      aria-label="Resonance field guide"
      className="lg:w-80 xl:w-96 lg:pl-6 mt-8 lg:mt-0"
    >
      <div className="sticky top-24 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Resonance Field Guide</h2>
          <p className="text-sm text-gray-600 mb-4">
            Plain-language explanations for each metric. Share this with new operators so they can read the dashboard like a speedometer.
          </p>
          <div className="space-y-4">
            {glossary.map((item) => (
              <div key={item.term}>
                <h3 className="text-sm font-semibold text-primary-700">{item.term}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-4">
            Need the math? Review the{" "}
            <a
              href="https://github.com/stringerc/resonance-runtime-landing/blob/main/RESONANCE_CALCULUS_COMPREHENSIVE_REVIEW.md"
              target="_blank"
              rel="noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Resonance Calculus dossier
            </a>
            .
          </div>
        </div>
      </div>
    </aside>
  );
}

