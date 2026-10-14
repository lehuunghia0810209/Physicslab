# ChemLab / PhysicsLab UX comparison

ChemLab source was accessible at `D:\EduLab\ChemLab`; no ChemLab browser run was performed in this audit, so this is source-informed only.

| Criterion | ChemLab source evidence | PhysicsLab observed evidence | Proposal |
|---|---|---|---|
| Learning organization | Grade 10/11/12 guided experiment modules and curriculum data | 49 structured records but 16 live catalog choices | Use one canonical grade→topic→lesson index in each product. |
| Learning/lab coupling | `lab/experiments` has curriculum and engine modules | Reader links to live simulation/lab when declared | Retain subject-specific apparatus, but show the learning action and lab action in one predictable place. |
| Progress | Dedicated progress storage module | Separate legacy progress and Learning v1 storage | Keep data schemas separate but present one learner-facing progress summary. |
| Responsive/accessibility | CSS modules and accessibility module exist | 390 px sample and automated target checks pass | Establish shared acceptance criteria, not shared UI code. |

Do not copy ChemLab UI wholesale: chemistry should foreground substances/reactions; PhysicsLab should foreground quantities, models, graphs and measurement.
