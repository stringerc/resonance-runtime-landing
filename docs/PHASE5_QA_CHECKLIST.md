# Phase 5 QA & Documentation Checklist

Phase 5 introduced the Trust Center surfaces, enhanced status strip, and health snapshot exporter. Use this checklist to validate production readiness and update supporting documentation.

## 1. Functional QA

- [ ] **Status Strip Verification**
  - Confirm platform shows agent version, release channel, environment, commit hash, and 24 h uptime.
  - Validate colour semantics (green for healthy, amber for warnings) on desktop & mobile breakpoints.
  - Ensure missing metadata gracefully falls back to `Unknown` without console errors.

- [ ] **Health Snapshot Exporter**
  - Download JSON export and inspect fields (version, uptime, compliance, metrics) for accuracy.
  - Download CSV export and open in spreadsheet tool without formatting issues.
  - Use “Copy curl command”, “Copy SSL check”, and “Copy port check” buttons to confirm clipboard contents.

- [ ] **Trust Center Card & Docs**
  - From dashboard overview, follow “View Trust Center →” link and confirm `/docs/trust` renders.
  - Verify Trust Center links to security baseline, signing guide, and auto-update docs.
  - Check pricing hero stripe callout for proper copy and responsive layout.

- [ ] **Metrics API Regression**
  - Hit `/api/metrics` and confirm new fields (`agentVersion`, `releaseChannel`, `buildCommit`) appear.
  - Ensure legacy dashboards (Canary, Resonance Calculus) still parse payload without errors.

## 2. Documentation Updates

- [ ] Update `docs/SECURITY_BASELINE.md` to reference Trust Center and uptime/export features.
- [ ] Add Health Snapshot exporter usage notes to `docs/trust` footer or a dedicated section.
- [ ] Ensure Tailwind design tokens cover new card styles (no additional design token changes required).
- [ ] Record deployment checklist in project wiki or release notes referencing commits `5e9414c` & `7877d84`.

## 3. Browser & Device QA

- [ ] Test dashboard overview, pricing page, and Trust Center on:
  - Desktop Chrome/Firefox
  - Safari (iPad or responsive mode)
  - Mobile Chrome (responsive or device)
- [ ] Verify clipboard operations with browser permission prompts handled.

## 4. Deployment & Monitoring

- [ ] Monitor Vercel build/deploy logs for warnings introduced by new components.
- [ ] Spot check Render agent logs to confirm metrics endpoint continues to expose version metadata.
- [ ] Update external status page (if any) to mention new export capability.

Once all checkboxes are addressed, mark Phase 5 as fully complete and prepare for next roadmap phase.
