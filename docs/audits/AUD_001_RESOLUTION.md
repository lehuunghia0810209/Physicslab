# AUD-001 — Canonical Learning Catalog Recovery (2026-10-14)

**Source:** `Physicslab(3).zip`, audit `docs/audits/QA_TESTER_REPORT.md`, `PHYSICSLAB_REAL_WORLD_AUDIT.md`.
**Version:** 2.4.0-dev; **release state:** pending Windows Vite/Chromium/Offline verification.

## Confirmed root cause

`src/pages/learning.js` built `catalog=[...lessons, ...completeOnly]`, dropping any full-reader lesson that shared an ID with legacy discovery. Its rendered `.learning-catalog` listed just 16 legacy records. Full-reader route resolution also depended on `lesson.readerOnly` rather than a full-content match, so collision `newton-discovery` opened legacy discovery instead of the Lesson Reader. The code's 49-item `COMPLETE_LESSONS` was intact but hidden behind conflicting entry paths.

## Changes

1. `src/core/learning-catalog.js`: a **single** validated catalog ordered by `THPT_PROGRAM`, mapping exactly one full-reader record per program ID. Strict duplicate, missing, unlinked, or cross-grade data checks. Explicit precedence: full reader over legacy when a slug collides.
2. `src/app/learning-overview.js`: main `#/learning` route shows **17 / 16 / 16** entries by grade, with All Classes (**49**) mode, grouped topics, accent-insensitive search, topic dropdown, grade tabs, reset, a real attempt indicator, and a continue-learning link from existing saved progress. The same front-end does not invent completion when a student has only opened a lesson.
3. Legacy discoveries are accessible under `#/learning/explore-<legacy-id>` from a clearly separate expandable **Khám phá nhanh** section; noncolliding legacy bookmarks stay functional. For a collision like `#/learning/newton-discovery`, the reader wins, and the guided legacy path remains `#/learning/explore-newton-discovery`. No localStorage migrations.
4. Reader route automatically sets active lesson to support resume, uses actual `physicslab.learning.v1` attempt data in its sidebar instead of mixing in legacy discovery scores, and can link to the companion guided legacy activity when one exists.
5. UX: larger touch controls, clear educational information hierarchy, grouped content, mobile stacked layouts, keyboard focus, reduced-motion, light/dark via existing design tokens; no new dependencies.
6. New `tests/learning-catalog.test.js` and browser regression assertions covering all 49 rendered links, actual reader routes, collision handling, grade filter counts, search, reset, and legacy access. Updates to old browser scripts reflect the canonical landing page and namespaced discovery routes rather than disabling test coverage.

## Verification actually performed in the authoring environment

- `node scripts/check.mjs`: **PASS**, 205 JS modules, 444 imports, 576 named exports.
- `node --test tests/*.test.js`: **280/280 PASS**.
- `node --check scripts/browser-check.cjs`: **PASS**.
- Vite production build: **NOT VERIFIED**. The ZIP's `node_modules` contains only a Windows Rolldown native binding; Linux `@rolldown/binding-linux-x64-gnu` is not included and the build could not initialize. This is not a proven application build regression.
- Browser QA & PWA: **NOT VERIFIED** for this patch. The added Playwright assertions are ready to run on Windows.

## Windows acceptance

```powershell
cd D:\EduLab\physicslab
npm ci
npm run check:release
npm run dev -- --port 5188
```

Manual flow: open `#/learning` → choose grades 10/11/12/All → search `cam ung dien tu` → click a lesson → back to catalog → expand `16 hoạt động khám phá nhanh` → open legacy Newton → open canonical `#/learning/newton-discovery` and verify the reader appears. Check saved notes and quiz history after reload; run mobile/touch, Firefox, NVDA and PWA multi-tab separately where hardware is available.

## Residual limitations

This fixes **catalog discoverability and precedence**; it does **not** constitute external academic validation of all 49 lessons. 49 structured lesson records, 98 examples and 245 questions reflect the project data, not guaranteed alignment to every official curriculum outcome. Before Stable release, require external physics-teacher review and independent cross-browser, assistive technology, PWA multi-tab and real-device checks.

No commit, push, tag, deploy, data deletion, or schema changes were performed.
