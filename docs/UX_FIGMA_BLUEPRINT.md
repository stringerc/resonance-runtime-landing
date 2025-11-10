# Resonance UX → Figma Blueprint

Guidance for translating the current Resonance runtime experience into a refreshed UX/UI system aligned with the syncscript.app aesthetic.

## 1. Research & Audit

1. **Screen capture current flow**
   - Record walkthroughs of `/` → signup → onboarding wizard → dashboards → docs → pricing.
   - Note friction points (visual mismatch, navigation confusion, empty states).
2. **Review existing system documentation**
   - Design tokens, color palettes, typography: [docs/DESIGN_TOKENS.md](./DESIGN_TOKENS.md), [tailwind.config.js](../tailwind.config.js).
   - Security/Trust content: [docs/SECURITY_BASELINE.md](./SECURITY_BASELINE.md), [app/docs/trust/page.tsx](../app/docs/trust/page.tsx).
   - Product narrative: [docs/UX_CONTENT_INVENTORY.md](./UX_CONTENT_INVENTORY.md) (content hierarchy), Resonance Calculus dossier (`/docs/resonance-calculus-dossier.md`).
3. **Benchmark reference aesthetic**
   - Capture UI patterns from syncscript.app: gradient surfaces, glass panels, neon accent lines, whitespace rhythm.
   - Document grid systems, card styling, iconography trends.

## 2. Define UX Goals & Requirements

- **Personas / Jobs to be Done**
  - *Operator*: needs fast view of tuning status, latency risk, next actions.
  - *Engineering leader*: evaluate health trends, export compliance evidence.
  - *Buyer*: understand value, pricing, trust posture in marketing surfaces.
- **Primary user journeys**
  1. Onboard new agent (from invitation → data streaming).
  2. Diagnose coherence drop (Canary → insights → docs).
  3. Upgrade subscription (Pricing → checkout → confirmation).
- **Success metrics**
  - Reduced time-to-first-insight.
  - Increased use of docs / trust center.
  - Higher conversion for upgrades.

## 3. Figma Project Setup

1. **Create file sections**
   - *Foundations*: Color styles, typography, grids, shadows, spacing scale, icon treatment.
   - *Components*: Navigation, cards, charts, tables, forms, modals, insights panel, alerts.
   - *Layouts*: Marketing pages, Dashboard overview, Canary, Resonance Calculus, Docs, Pricing, Auth.
   - *Prototypes*: Critical flows (onboarding, tuning alert, checkout).
2. **Sync styles with Tailwind tokens**
   - Map `surface-900`, `brand-200`, `brand-500`, etc. to Figma color styles for easy parity.
   - Define text styles for headings (`text-3xl`, `text-neutral-50`) and body copy.
   - Include elevation tokens (`shadow-brand-glow`) as effect styles.
3. **Grid & spacing**
   - Adopt an 8px base grid (already implied in Tailwind spacing).
   - Dashboard: 12-column grid, 80px margins desktop, 16px mobile.
   - Mobile/Tablet breakpoint: design responsive variants for 768px and 375px width.

## 4. Layout & Flow Planning

1. **Site Map Frames**
   - Draw navigation map: `Landing → Auth → Dashboard Shell → {Overview, Canary, Resonance Calculus, Docs}`.
   - Include documentation sub-pages and external resources (desktop agent downloads, manifest links).
2. **Wireframes → High-fidelity**
   - Start with low fidelity to fix information hierarchy.
   - Transition to high fidelity once components and tokens defined.
3. **State variants**
   - Empty states (no metrics, missing latency, inactive license).
   - Loading states (charts skeleton, cards shimmer).
   - Alert states (warning/critical banners, status pills).
   - Dark vs. light (if marketing stays light theme, define interplay).
4. **Interactive prototypes**
   - Use Figma’s prototyping to demonstrate onboarding wizard, time-range switching, expansion of insights panel.
   - Include micro-interactions (hover states, button presses) to inform front-end implementation.

## 5. Content & Component Mapping

Leverage [`docs/UX_CONTENT_INVENTORY.md`](./UX_CONTENT_INVENTORY.md) to ensure every section is accounted for.

| Figma Component | Site Reference | Notes |
| --- | --- | --- |
| Dashboard Shell | `DashboardChrome`, `DashboardStatusStrip` | Stickiness, responsive collapse of sidebar.
| Insight Card | `ResonanceInsights` | Status badge (good/warning/critical), primary value, call-to-action.
| Chart Panel | Canary/Resonance Calculus | Combine scatter + trend line, add compliance band overlay.
| Checklist Panel | `OnboardingChecklist` | Step icons, completion states, link buttons.
| Alert Banner | `DataAlerts` | Multi-line copy + quick actions.
| Trust Card | `/dashboard` trust center section | Include quick links + compliance badges.
| Docs Layout | `/docs/*` pages | Title block, subnav, anchor headings, code block styling.

## 6. Alignment with Engineering

1. **Token parity**
   - Export Figma tokens using same naming (e.g., `color.brand.500`) for easy Tailwind mapping.
   - Document typography + spacing decisions in `docs/DESIGN_TOKENS.md` after finalizing.
2. **Component storybook**
   - Outline Figma → React component mapping; consider using Storybook to mirror Figma variants.
3. **Specs & annotations**
   - Provide spacing, radius, and interaction notes in Figma comments or dedicated spec pages.
   - Call out dependencies (e.g., metrics API fields) to ensure UI accommodates real data ranges.

## 7. Deliverable Checklist

- [ ] Updated site map & flow diagrams.
- [ ] Figma foundations file (colors, typography, elevation, grid).
- [ ] Component library (navigation, cards, charts, forms, alerts, docs layout).
- [ ] High-fidelity screens for critical pages (Landing, Overview, Canary, Resonance Calculus, Docs, Pricing, Auth).
- [ ] Prototype for onboarding and tuning flow.
- [ ] Accessibility review (contrast, focus states, keyboard navigation).
- [ ] Handoff package: spec export, motion guidelines, design QA checklist.

## 8. Next Steps

1. Finalize research notes and personas; share with stakeholders.
2. Build Figma foundations & component styles referencing syncscript.app aesthetics.
3. Produce mid-fidelity wireframes for sign-off on hierarchy.
4. Apply high-fidelity styling, run usability review with internal users.
5. Hand off final designs with annotations, update documentation in repo, and plan implementation sprints (Phase 6+ roadmap).

Refer to the existing code and documentation cited above to ensure the redesigned UX maps cleanly to real data, features, and constraints.
