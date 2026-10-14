# Audit evidence index

## Environment

- Date: 2026-10-14; repository: `D:\EduLab\physicslab`; version: `2.4.0-dev`.
- Browser: Playwright using installed Microsoft Edge fallback; fresh isolated context; Vietnamese locale.
- Evidence script: `scripts/real-world-audit.cjs`.
- Artifacts: `work/audit-2026-10-14/` (gitignored): `evidence.json` and six real screenshots. No user profile data was used.

## Executed UI cases

| Case | Route / viewport | Result |
|---|---|---|
| First use | Home → Learning / 1440 | Pass; 16 legacy lesson choices visible |
| Student A | `#/learning/newton-discovery` → Newton sim → reload | Pass; feedback, direct force control and note persistence |
| Student B | `#/learning/wave-discovery` → wave sim | Pass; invalid numeric feedback and standing-wave update |
| Student C | `#/learning/ideal-gas-discovery` → Revision / 1440 | Pass; isochoric control and 10 grade-12 items |
| Mobile | Newton reader / 390×844 | Pass; 390/390 document widths, ToC used |
| Teacher | Projectile / 1440 | Pass; save/restore; presentation exits with Escape |
| Simulations | all 13 routes / 1440 | Pass; route opened; deeper per-model actions are separately covered by release Browser QA |
| Lab | `#/lab` / 1440 | Pass; 24 visible select options; sampled landing composition |

## Automated evidence

- Release baseline: 275/275 unit tests pass; Vite build pass; Browser QA pass; offline QA pass.
- Responsive automated routes: 320, 360, 390, 768, 1024, 1440, 1920; no overflow and controls >=44 px according to `scripts/browser-check.cjs`.
- Not performed: Firefox, WebKit, real screen reader, physical touch keyboard, production-field performance/FPS/heap, real learner or teacher study, destructive multi-tab/quota operations against personal data.
