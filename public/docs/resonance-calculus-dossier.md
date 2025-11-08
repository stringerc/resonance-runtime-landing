# Resonance Calculus Dossier

This dossier summarises the models and thresholds used across the Resonance dashboards. Use it as a companion to the live insights panel.

## Global Resonance R(t)

- **Model:** Kuramoto order parameter applied to service controllers.
- **Interpretation:**
  - `R(t) < 0.35` → controllers are under-coupled. Add richer traffic or allow adaptive mode to keep learning.
  - `0.35 ≤ R(t) ≤ 0.65` → controllers remain in tune.
  - `R(t) > 0.65` → controllers are over-coupled. Ease coupling or stagger workloads.

## Band Compliance

- **Definition:** Fraction of samples whose R(t) landed within the optimal band.
- **Target:** ≥ 85 % for steady-state validation.
- **Notes:** Compliance climbs as the agent receives phase samples with consistent cadence.

## Spectral Entropy

- **Definition:** Shannon entropy of the frequency spectrum of request types.
- **Target Window:** 0.40 – 0.60. Lower values indicate repetitive load; higher values indicate highly chaotic traffic.
- **Action:** Balance replay traces, canary traffic, and production load to stay in window.

## Coherence Score (CWSC)

- **Model:** Coherence-weighted service curve, β<sub>c</sub>(t) / β(t).
- **Interpretation:**
  - ≥ 50 % → inter-service hand-offs stay synchronised.
  - 35 – 50 % → drift beginning; review sampling cadence and service-specific controllers.
  - < 35 % → controllers reacting at different speeds; increase sampling or smooth bursts.

## Tail Health Score (EVT / GPD)

- **Model:** Fit a Generalised Pareto Distribution to p99/p99.9 latency samples.
- **Interpretation:**
  - ≥ 50 % → tail latency under control.
  - < 50 % → investigate services contributing to the tail; add smoothing or back-pressure.
- **Prerequisite:** Requires streaming latency percentiles. Without them, the score remains undefined.

## Timing Score & λ<sub>res</sub>

- **Model:** Max-Plus algebra measurement of cycle time; λ<sub>res</sub> is the dominant eigenvalue.
- **Interpretation:**
  - Timing score ≥ 50 % → predictable cycle time.
  - λ<sub>res</sub> near zero → fast loops; rising values indicate emerging bottlenecks.

## Coupling K(t)

- **Definition:** Adaptive gain applied by the controller.
- **Guideline:** Allow adaptive mode to manage K(t). Manual overrides should only push K(t) higher to pull R(t) toward the band or lower to reduce oscillations.

## Latency Percentiles

- **Feed:** Provide p50/p95/p99/p99.9 via the Resonance SDK or the `bench/feed_phases.js` harness.
- **Usage:** Required for EVT tail health and for monitoring regression on the canary dashboard.

## Streaming Checklist

1. Keep the agent in adaptive mode (`RESONANCE_MODE=adaptive`).
2. Stream phase samples regularly (SDK or `bench/feed_phases.js`).
3. Stream latency percentiles to unlock tail analysis.
4. Leave dashboards open or export metrics to maintain band-compliance history.

## Further Reading

For full derivations and proofs, contact the Resonance runtime team or review the internal whitepaper.
