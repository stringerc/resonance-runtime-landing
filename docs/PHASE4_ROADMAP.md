# Phase 4 Roadmap – Guided Onboarding & Data Completeness

## Objectives
- Reduce time-to-value for new operators by walking them through the adaptive setup steps.
- Detect missing or sparse data feeds and surface actionable remediation guidance.
- Maintain visual/interaction consistency with the newly refreshed dashboard chrome.

## Deliverables
1. **Guided Onboarding Modal**
   - Triggered when a user first visits the dashboard (or when checklist isn’t complete).
   - Step-by-step wizard covering:
     1. Adaptive mode verification.
     2. Phase sample ingestion (bench harness or SDK).
     3. Latency feed configuration.
     4. History build up (leave dashboard open / feed traffic).
   - Inline links to docs / downloads for each step.
   - Progress saved so users can resume later.

2. **Data Completeness Alerts**
   - Inline banners on Overview/Canary/Calculus when:
     - p99 latency missing (with CTA to latency guide + bench harness command).
     - Coherence history sparse (suggest running phase feeder).
     - No history persisted (remind to keep agent running).
   - Consolidated section in ResonanceInsights summarizing gaps.

3. **Docs + Bench Assets**
   - Expand docs with quickstart snippets for latency/phase feeds.
   - Provide bench harness command examples (using latest API key env vars).

## Implementation Plan
### Phase 4A – Roadmap Approval & UX Draft
- Review this document with stakeholders; adjust scope/timeline if needed.
- Produce wireframes for the onboarding modal and alert banners.

### Phase 4B – Guided Onboarding
- Build modal/wizard component (client-side, persists progress to localStorage or user settings).
- Integrate with existing checklist to mark steps as completed.
- Add entry point from dashboard header/onboarding checklist.

### Phase 4C – Data Completeness Alerts
- Add server-side checks (e.g., metrics API response flags) to identify gaps.
- Render alert banners with CTA buttons linking to docs/bench harness commands.
- Extend `ResonanceInsights` to summarize missing data.

### Phase 4D – QA & Documentation
- Verify wizard flow across browsers; ensure alerts appear/disappear correctly.
- Update docs (Quickstart, Phase Intake, Latency Feed) with new guidance.
- Announce changes in changelog or release notes.

## Timeline (Tentative)
- 4A: 1 day – Stakeholder review, UX mockups.
- 4B: 2–3 days – Onboarding wizard implementation.
- 4C: 2 days – Data completeness alerts + insights integration.
- 4D: 1 day – QA, docs, release notes.

_Total: ~1 week once approved._
