# Agent Operations Guide

Operational runbook for the Resonance agent once it is in production.

## Daily checks
- Confirm `/health` responds with `200` and lists the current `agentVersion` and Git commit.
- Inspect `/metrics` for recent R(t), spectral entropy, latency, and tail distributions.
- Validate the dashboard status strip shows uptime > 95% of the last 24h.

## Updating the agent
1. Make code changes in `/Users/Apple/Downloads/Resonance/resonance`.
2. Run `npm run build:agent-binaries` to produce platform archives.
3. Tag the release: `git tag agent-vX.Y.Z && git push --tags`.
4. GitHub Actions publishes binaries + manifest to Releases.
5. Render deployment restarts and serves the new build.
6. Agents poll `RESONANCE_UPDATE_MANIFEST_URL` and stage updates automatically.

## Auto-update workflow
- Agents poll at `RESONANCE_UPDATE_INTERVAL_MS` (default 30 min).
- If a newer semver version exists, it downloads to `RESONANCE_UPDATE_STAGING_DIR`.
- Apply staged update with `resonance-agent --install-staged-update` during a maintenance window.

## Scaling intake
- Run multiple agent instances behind a load balancer; ensure sticky sessions by API key.
- Set `RESONANCE_INTAKE_API_KEY` distinct from the dashboard key.
- Use the bench harness with `--with-latency` to stress test throughput.

## Incident response
- Enable adaptive mode (policy defaults to `adaptive`).
- Stream additional phase samples if coherence drops below 0.3.
- Capture latency histograms (p50/p95/p99) for correlation with Tail Health alerts.
- If entropy surges, reduce update interval (`RESONANCE_UPDATE_INTERVAL_MS`) and verify upstream clock sync.

## Security posture
- Keys validated with constant-time comparison (`security.ts`).
- CSP, HSTS, COOP/COEP enforced via middleware.
- Review `docs/SECURITY_BASELINE.md` for headers and cookie strategy.

## Useful commands
```
# Validate health endpoints
yarn curl https://syncscript-backend.onrender.com/health

# Feed synthetic phases
node resonance/bench/feed_phases.js --interval 1000 --count 600

# Tail latency smoke test
node resonance/bench/feed_phases.js --with-latency --interval 1000 --count 300
```

Document updates in `/docs/PHASE5_QA_RESULTS.md` after each release.
