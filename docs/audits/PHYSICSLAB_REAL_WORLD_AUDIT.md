# PhysicsLab 2.4 real-world audit

Audit date: 2026-10-14. Scope was review only: no application data, schema, version, commit, deployment, or product code was changed.

## Verdict

The model/simulation platform is technically strong enough for guided use, but Learning 3.0 is **not ready to be described as a complete 49-lesson self-study curriculum**. Data validation finds 49 complete records, 98 worked examples, and 245 questions; the live Learning landing page in a fresh profile rendered only 16 legacy discovery choices. That mismatch is a P1 release blocker for the curriculum-completion claim.

What was verified in the live UI: 13 simulation routes, Student A/B/C journeys, Revision Home, 390 px lesson view, Teacher Studio save/restore/presentation, and the Lab landing route. No console error, page error, or failed request was observed in that fresh Chromium profile. Evidence: `work/audit-2026-10-14/evidence.json`.

## Baseline

`npm run check:release` passed: 275 unit tests, production build, Browser QA, and offline QA. The independently repeated `npm run check:offline` also passed; the production precache includes Learning, Lab, Tools, 3D and a lazy simulation. Automated success is supporting evidence, not acceptance of pedagogy or usability.

## Status matrix

| Claim | Source code | Live UI / journey | Independent academic review |
|---|---:|---:|---:|
| 49 structured lessons | Yes | Not all discoverable from Learning catalog | No external teacher review |
| 98 examples / 245 questions | Yes | Sampled 3 lesson flows | Numeric validators only |
| 13 simulations | Yes | All 13 routes opened | Physics tests, not full curriculum peer review |
| 15 base labs | Yes / existing browser QA | Lab selector/landing sampled | No real classroom trial |
| Revision, notebook, Teacher Studio | Yes | Revision and Teacher Studio sampled | No classroom trial |

See the role reports, issue list and evidence index in this directory.
