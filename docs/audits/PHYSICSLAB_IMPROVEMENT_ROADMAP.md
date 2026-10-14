# Improvement roadmap

| Priority | Work | Value / acceptance condition | Likely modules | Risk |
|---|---|---|---|---|
| Fix immediately | Resolve AUD-001 catalog precedence | All 49 advertised reader routes open from Learning; count is browser-tested; legacy content remains reachable | `pages/learning.js`, curriculum data, browser test | Progress-link compatibility |
| Fix immediately | Declare canonical lesson flow | No duplicate/conflicting discovery and reader entry points | Learning page, docs | Learner bookmarks |
| Learning quality | Add graph/diagram prompts to formula-heavy lessons | Each sample has a visual observation tied to a stated quantity | lesson data, reader CSS | Content review workload |
| Learning quality | Extend question diagnostics | Misconception-tagged feedback and mixed difficulty without duplicates | question data, revision engine | Must preserve stored attempts |
| UI/UX | Simplify Lab start route | A student finds a grade-relevant apparatus in <=2 decisions | lab page/styles | Avoid hiding expert tools |
| QA | Add actual assistive-tech/browser matrix | NVDA/Chrome, VoiceOver/Safari, Firefox and WebKit results recorded | QA scripts/docs | Environment availability |
| Advanced | Teacher lesson sequence templates | Teacher can launch a 45-minute sequence from one route | Teacher Studio/Learning | Do after catalog repair |

Top ten value items are represented by the first two rows, visual scaffolding, diagnostic questions, Lab entry simplification, accessibility matrix, mobile hardware test, 45-minute templates, learner next-step prompts, and teacher academic review. No AI/chatbot or gamification work is proposed before these fundamentals.
