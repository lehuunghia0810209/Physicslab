# AUD-001 follow-up: Browser QA legacy dashboard count

## Evidence

Windows release log (2026-10-14): **280/280 unit tests PASS** and **164 Vite modules build PASS**, then `scripts/browser-check.cjs:184` failed on the expected string `Đã kiểm tra 2/22`. The browser QA was not completed, so offline QA had not run in that session.

## Root cause

`src/pages/learning.js` renders the `.learning-mastery-item` dashboard exclusively through `summarizeLearningProgress(lessons, categories, progress)` from `src/data/curriculum.js`. That legacy registry contains **16 guided explorations**, of which **6 are in Mechanics**. The 49 complete readers use the independent `physicslab.learning.v1` store. The UI denominator for the legacy Mechanics dashboard therefore is **6**, not **22**. Browser QA had a hard-coded expectation of 22 that was incompatible with the actual source registry. This is a test expectation bug, not evidence that the physics progress calculation is broken.

## Changes

- `scripts/browser-check.cjs`: derive the Mechanics denominator from the actual legacy discovery registry; keep the two-check / three-check assertions.
- `src/pages/learning.js`: label legacy dashboard explicitly as **Khám phá nhanh**, clarifying its separation from 49 complete readers.
- `tests/learning.test.js`: regression checks for 2/6, 3/6 and a rounded 67% average.

## QA status

In this Linux workspace: JavaScript module scanner and 281/281 unit tests passed. **Vite build, Browser QA, Offline/PWA QA were not verified locally** because the environment's provided Windows node_modules lacks the Linux native Rolldown binding. Re-run `npm run check:release` on Windows. Do not call 2.4 Stable on the strength of this fix.

## Guardrails

No change to physics models, `physicslab.progress.v1`, `physicslab.learning.v1`, or `physicslab.experiments.v1`. No commit/push/deploy.
