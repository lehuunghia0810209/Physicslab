# QA tester report

## Result

No P0 was reproduced. One P1 and three P2 items were found. Fresh isolated Chromium evidence had no page errors, console errors, or failed requests.

| Criterion (0–5) | Score | Evidence |
|---|---:|---|
| Functional correctness | 4 | 275 unit tests; 13 live routes opened; model controls sampled |
| Stability | 4 | Browser report lists no runtime/network errors; animation cleanup is covered by existing Browser QA |
| Navigation | 3 | Home→Learning works, but catalog exposes 16 legacy choices rather than the 49 complete lesson records |
| Data integrity | 4 | Existing tests cover progress, storage corruption, quota and backup; fresh note persisted through reload |
| Responsive | 4 | Existing suite checks 320–1920; independent 390 px lesson had no horizontal overflow |
| Accessibility | 3 | Automated names/44 px targets pass; keyboard was sampled. No real screen-reader or Firefox/WebKit acceptance |
| Performance | 3 | Lazy chunks verified; observed route changes were 24–50 ms on local dev server. No FPS/heap/Core Web Vitals claim. |

## Issues

| ID | Severity | Reproduction and evidence | Recommendation |
|---|---|---|---|
| AUD-001 | P1 | Fresh profile: `#/learning` shows 16 `[data-lesson]` choices while `COMPLETE_LESSONS.length` is 49. `catalog` in `src/pages/learning.js` prefers legacy records with matching IDs, so routes such as `#/learning/10-newton` fall back rather than render the new reader. | Make the 49 canonical reader records the catalog source, preserve legacy discovery activities as explicitly linked activities, and add a browser test counting 49 reachable lesson readers. |
| AUD-002 | P2 | A learner crosses between legacy discovery and Learning 3.0 reader routes. Labels and progress models differ. | Declare one primary lesson flow; expose the other as a compact “Khám phá nhanh” card. |
| AUD-003 | P2 | Lab landing had 24 visible select options, but the generic selector was hidden in the sampled landing composition. | Give the Lab landing one clear start action and group stations by grade/topic. |
| AUD-004 | P2 | Full screen-reader, reduced-motion and cross-browser behavior were not executable in this audit environment. | Add NVDA/VoiceOver and Firefox/WebKit acceptance cases before stable release. |

### AUD-001 — canonical curriculum is not discoverable (verified)

- **Area / persona / severity / confidence:** Learning catalog; QA and student personas; P1; high.
- **Evidence:** `work/audit-2026-10-14/evidence.json`, first-use scenario; `COMPLETE_LESSONS.length === 49`; the live `#/learning` UI exposed 16 `[data-lesson]` choices.
- **Reproduce:** open a fresh profile → Home → Học tập → compare the rendered catalog with the 49-item curriculum map → navigate directly to a matching curriculum ID such as `#/learning/10-newton`.
- **Expected / actual:** every advertised complete lesson should open its Lesson Reader. The catalog first uses legacy `lessons` entries and excludes complete records with colliding IDs; unmatched curriculum routes fall back to the first legacy lesson.
- **Root cause:** verified in `src/pages/learning.js:18–22`, not a rendering timing issue.
- **Fix / effort:** establish canonical reader entries before legacy discovery entries and migrate route resolution deliberately; medium, with compatibility review.
- **Regression test:** fresh-browser test asserts 49 reachable links, direct loads for one lesson per grade, and no legacy bookmark loses its flow.

No data-destructive test was run against a user profile; all UI evidence uses a fresh browser context.
