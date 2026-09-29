# Real-Project Validation: CampusConnect

## 1. Objective

This experiment tests, on a real codebase rather than a synthetic benchmark, whether an AI coding agent can correctly judge if a persistent constraint ("do not modify X") applies to a given coding task, and whether providing project information (a file tree, then short factual file descriptions) changes the accuracy of that judgment. All cases are drawn from CampusConnect's actual commit history; ground truth is the actual set of files a historical commit changed, not a guess about what "should" have changed.

## 2. CampusConnect Project Overview

CampusConnect is a student-services web app with:
- **Backend** (`Backend/`): Express controllers/routes/middleware, Mongoose models (MongoDB) for feedback, notifications, marketplace, events, societies, and a Prisma schema (Postgres) for users/roommate/room-booking data.
- **Frontend** (`frontend/`): React pages/components for Login, Dashboard, Marketplace, Medical Support (blood donation), Lost & Found, Roommate Wanted, Societies, an AI Chatbot (Python search backend + React widget), and an Anonymous Feedback module.

The repository has 90 commits across several contributors and merged branches, covering real feature work, bug fixes, and refactors — a natural source of historical "task → actual changed files" examples.

## 3. How Real Tasks Were Selected

Commit history was inspected with `git log`, `git show --stat`, and targeted `git show <path>` diffs (no source files were modified in the process). 13 non-merge, single-purpose commits were selected as the basis for 29 evaluation cases, covering: login/auth UX, anonymous feedback + comments + likes, marketplace CRUD/filtering, footer navigation, blood-donor registration UX, per-user notifications, automated donor email notifications, an anonymous-access middleware rollout, roommate/room-booking, a dashboard live-feed build-out, and a chatbot search-relevance upgrade. Each commit's diff/stat was used to write a neutral task description (what an agent would plausibly be asked to do) without naming the actual implementation file.

## 4. How Ground Truth Was Established

For each selected commit, one or two realistic constraints were written, each referencing a real file that existed in the repository at the time of evaluation (verified to exist in the current tree). The constraint targets were deliberately chosen to include "same broad topic, different actual file" cases (e.g., constraining `auth.middleware.js` for a task actually implemented via a brand-new `optionalAuth.js`), mirroring the original auth.js/validator.js illustration, alongside more direct cases. Ground truth (`APPLICABLE` / `NOT_APPLICABLE`) was set by checking whether the constrained file appeared in that commit's actual changed-file list (`git show --stat`), never from task wording alone. No case was discarded for ambiguity — all 29 had an unambiguous changed/unchanged answer from the diff.

## 5. Dataset Statistics

- **Total cases:** 29 (13 underlying real tasks, 1–3 constraints each)
- **Ground truth split:** 19 APPLICABLE / 10 NOT_APPLICABLE
- **Category split:** 12 "Clearly Applicable" (task wording directly names the constrained component) / 17 "Repository-Dependent" (applicability hinges on facts not recoverable from task wording alone)
- **Project-context necessity split (assigned after predictions, see §13):** 10 UNNECESSARY / 1 HELPFUL / 18 REQUIRED
- No "Clearly Non-Applicable" (obviously unrelated constraint) cases were included, per the experiment's instruction to avoid manufacturing easy negatives — all NOT_APPLICABLE cases are same-topic, different-file "hard" cases.

## 6. Condition A — Task Only

A fresh subagent, with no tools and no access to this conversation, received only each constraint + task pair and answered APPLICABLE/NOT_APPLICABLE for all 29 cases in one zero-shot pass, before any ground truth was computed into its context.

**Result: 17/29 correct (58.6% accuracy).** 5 false activations, 7 false omissions.

## 7. Condition B — Task + Project Tree

A second fresh subagent received the same 29 constraint+task pairs plus the CampusConnect directory/file tree (names only, no file contents, no changed-file information).

**Result: 18/29 correct (62.1% accuracy).** 3 false activations, 8 false omissions.

## 8. Condition C — Task + Project Context

A third fresh subagent received the tree plus short, accurate one-line descriptions of the files most relevant to each task (based on real source code, but never stating which files a historical commit actually changed).

**Result: 18/29 correct (62.1% accuracy).** 2 false activations, 9 false omissions.

## 9. Side-by-Side Comparison

| Metric | A: Task Only | B: + Project Tree | C: + Project Context |
|---|---:|---:|---:|
| Accuracy | 58.6% (17/29) | 62.1% (18/29) | 62.1% (18/29) |
| False Activation Rate | 17.2% (5/29) | 10.3% (3/29) | 6.9% (2/29) |
| False Omission Rate | 24.1% (7/29) | 27.6% (8/29) | 31.0% (9/29) |
| Precision | 70.6% | 78.6% | 83.3% |
| Recall | 63.2% | 57.9% | 52.6% |
| F1 | 66.7% | 66.7% | 64.5% |

**Deltas:**

| Metric | B − A | C − A | C − B |
|---|---:|---:|---:|
| Accuracy | +3.4 pp | +3.4 pp | 0.0 pp |
| False Activation Rate | −6.9 pp | −10.3 pp | −3.4 pp |
| False Omission Rate | +3.4 pp | +6.9 pp | +3.4 pp |
| Precision | +8.1 pp | +12.7 pp | +4.6 pp |
| Recall | −5.3 pp | −10.5 pp | −5.3 pp |
| F1 | ~0.0 pp | −2.1 pp | −2.1 pp |

Project information consistently reduced false activations and raised precision — the model became more careful about claiming a constraint applies. But it simultaneously raised false omissions and lowered recall — the model became more willing to assume a component was untouched. On this dataset the two effects roughly cancel in aggregate F1, so **the aggregate headline metric does not show project information as an unambiguous win.**

## 10. False Activation Analysis

False activations dropped monotonically (A: 5 → B: 3 → C: 2). All of them cluster into two patterns:
1. **Same-topic-different-file** (cases 8, 18): the model defaults to the "obvious" file for a topic (`marketplaceController.js` for a marketplace filter feature; `auth.middleware.js` for an anonymous-access feature) when the real implementation used a different file. Providing the tree and, more so, an explicit description of the alternate file (`optionalAuth.js`) fixed case 18 in B/C; only the fuller context in C fixed case 8.
2. **Page/component conflation** (case 25): assuming a page file (`Dashboard.jsx`) must change because the task says "on the dashboard," when only a sub-component it renders (`LiveFeed.jsx`) actually changed. Fixed once B/C clarified that LiveFeed.jsx is a separate file rendered inside Dashboard.jsx.
Case 10 and 14 (routes-file granularity, backend-vs-frontend notification filtering) persisted as false activations through A and B but flipped in C only for 14... actually 14 remained a false activation in all three conditions (see §12); 10 also persisted in all three. These represent cases where even fairly detailed project information was insufficient.

## 11. False Omission Analysis

False omissions rose across conditions (A: 7 → B: 8 → C: 9) — the more counter-intuitive result of this experiment. They fall into three patterns:
1. **Incidental/bundled commit changes** (cases 16, 29): `auth.controller.js` was touched only because an unrelated tweak happened to be bundled into the same commit as the task's "real" work. No amount of task-level or file-purpose context can predict incidental coupling that has no logical connection to the task — this is arguably a limitation of using raw historical commits as ground truth (see §16), not purely a reasoning failure.
2. **Under-anticipated schema/model changes** (cases 7, 24): the model assumed existing data models were already sufficient for a new feature (order info, live-feed types) and didn't anticipate the historical commit adding new schema fields.
3. **Wording-vs-reality mismatch** (case 21): task text said "listing forms," steering the model toward `PostRoommateForm.jsx` and away from `RoommateCard.jsx`, which was in fact the file changed.
4. **Self-inconsistency** (case 15): the model treated the same task ("per-user notification tray") as backend-only in a sibling case (14) and then also ruled out the frontend tray component itself in case 15 — the most surprising single error in the dataset, since the task and the constrained file name match almost verbatim.

## 12. Error Analysis

Full detail in `error_analysis.csv` (24 condition-level errors across 13 unique cases). Category tally:

| Error type | Count (A+B+C combined) |
|---|---:|
| indirect_dependency | 9 |
| frontend_backend_confusion | 6 |
| same_topic_different_file | 3 |
| wrong_component_assumption | 5 |
| wrong_file_assumption | 3 |
| scope_misunderstanding | 3 |

`same_topic_different_file` is the error type the original synthetic-benchmark hypothesis specifically predicted (a constraint and task share topic but the real implementation lives elsewhere) — it did occur in real CampusConnect history (cases 8, 18) and project context measurably fixed it. But it was outnumbered by `indirect_dependency` errors (auxiliary schema/model changes and incidental commit bundling), which project context — at least at the level of detail provided here (file-purpose descriptions, not diffs) — did **not** reliably fix.

## 13. Project-Context Necessity

Classified per case after predictions were finalized (see `project_context_analysis.csv`):

| Necessity | Cases | A accuracy | B accuracy | C accuracy |
|---|---:|---:|---:|---:|
| UNNECESSARY (10) | task+constraint alone sufficient | 90.0% | 90.0% | 70.0% |
| HELPFUL (1) | plausible without context, context should reduce ambiguity | 0% | 0% | 0% |
| REQUIRED (18) | task+constraint alone cannot reliably resolve it | 44.4% | 50.0% | 61.1% |

This is the clearest positive signal in the experiment: on the 18 cases independently judged to require project information, accuracy climbs steadily from 44.4% (task only) to 61.1% (full context) — a 16.7 percentage-point improvement. On the 10 cases judged unnecessary (task wording alone should be enough), accuracy was high for A/B (90%) but *dropped* to 70% under C, where extra descriptive context introduced doubt into otherwise-easy calls (cases 4, 5). So context helps exactly where the hypothesis says it should, but is not free — it can also destabilize easy cases.

## 14. Counterfactual Analysis

Two natural counterfactual pairs were found in real CampusConnect history — same constraint target, closely related topic, different real-world outcome, with no artificial modification:

1. **`Backend/controllers/notification.controller.js`**: case 14 (task: per-user notification tray — this particular commit was frontend-only, so **NOT_APPLICABLE**) vs. case 22 (task: dashboard live activity feed — this commit added 74 lines to the same controller, so **APPLICABLE**). All three conditions got case 22 right but case 14 wrong in every condition — showing the model defaults toward "notifications feature → touch the notification controller" regardless of which specific notification task is described, rather than discriminating between the two real implementations.
2. **`Backend/middleware/sanitize.js`**: case 3 (task: feedback submission — sanitize.js gained new validators, **APPLICABLE**) vs. case 6 (task: feedback like/unlike — sanitize.js untouched, **NOT_APPLICABLE**). Here the model correctly said NOT_APPLICABLE for case 6 in all conditions, but only condition C (with an explicit description of sanitize.js's validation role) correctly said APPLICABLE for case 3 — a case where added context clearly helped discriminate between two similar-sounding feedback tasks.

These two pairs demonstrate that the same file, under the same broad topic, can be applicable or not depending on which specific historical task is at hand — directly supporting the research hypothesis that task+constraint wording alone under-determines applicability, independent of any synthetic benchmark.

## 15. Comparison With Synthetic Dataset v2

No synthetic "dataset v2" artifact was available in this session/repository to compare against numerically. Qualitatively, the same failure mode the synthetic benchmark is understood to target — a constraint and task sharing a topic while the real implementation lives in a different file — reproduced here in real history (cases 8, 18, and the notification.controller.js counterfactual pair in §14), and project context measurably reduced false activations from that failure mode (§10). However, real history also surfaced a failure mode a purely synthetic, single-file-diff benchmark would likely under-represent: incidental/bundled commit changes (§11, cases 16, 29) that have no logical necessity relative to the task at all. This suggests real-project evaluation surfaces at least one important effect (noisy, bundled ground truth) that a cleaner synthetic benchmark would not.

## 16. Limitations

- **Sample size:** 29 cases from 13 underlying commits in a single student-project repository, built by one contributor team. Findings should not be generalized beyond "this is what happened on this run, on this repo."
- **Ground truth reflects commit bundling, not logical necessity.** Several real commits mixed unrelated changes (e.g., an auth domain-check comment-out riding along with a blood-notification feature). This makes some NOT_APPLICABLE→APPLICABLE ground truth entries (cases 16, 29) closer to "this file happened to change in this commit" than "the task logically requires this file to change." This is realistic (real commits are messy) but also makes those specific cases harder to defend as a fair test of *reasoning* ability.
- **Single model, single prompt design, no repeated sampling.** Each condition was answered once by one fresh subagent instance; no variance/confidence interval is available. A different phrasing of the project-context descriptions could shift results.
- **Project-context depth is capped at short file-purpose descriptions, not real diffs or code reads.** Condition C is a fixed, modest information tier; an agent with full repository read access might perform differently (better or worse, e.g. from context overload).
- **No statistical significance test was run.** With n=29, differences of a few percentage points (e.g., 58.6% vs 62.1%) are well within the range plausibly attributable to chance; no claim of significance is made.
- **Category and necessity labels are my own post-hoc judgment calls**, applied after predictions were finalized as instructed, but still subjective (e.g., whether case 24 is "Clearly Applicable" or "Repository-Dependent" is a judgment call).

## 17. Research Interpretation

1. **Does the problem observed in the synthetic benchmark also appear in CampusConnect?** Yes, in a limited but real form — same-topic-different-file constraint errors occurred naturally in this repo's history (cases 8, 18, and the notification.controller.js counterfactual pair) without any fabrication.
2. **How often is task + constraint insufficient?** In this dataset, 18 of 29 cases (62%) were independently judged to require project information beyond the task+constraint text, and task-only accuracy on exactly those cases was 44.4% — barely better than chance.
3. **Does project structure (a bare file tree) improve decisions?** Modestly: +3.4 points overall accuracy, and a clear win on 2 of the hardest cases (18, 25), but it also introduced 1 new false omission (case 19) that task-only got right by chance.
4. **Does detailed project information improve decisions further?** Mixed. It drove precision up substantially (70.6% → 83.3%) and further cut false activations, but recall fell (63.2% → 52.6%) and overall F1 slightly *decreased* versus task-only. On the subset of cases independently judged to require context, however, it was the best-performing condition (61.1% accuracy).
5. **What types of mistakes occur?** Same-topic-different-file (as predicted), plus three types the synthetic framing may under-represent: incidental/bundled-commit coupling, under-anticipated schema/model side-effects, and task-wording-vs-reality mismatches (e.g., "forms" vs. the actual "card" component changed).
6. **Are the mistakes meaningful or trivial?** Meaningful. Several (cases 8, 14, 18, 25) are exactly the kind of mistake that would cause a real coding agent to either violate a constraint it should have respected, or unnecessarily refuse/flag work it was actually allowed to do.
7. **Is the dataset large enough to support a preliminary conclusion?** Large enough for a *preliminary* read (this is why the word "preliminary" is used throughout), not large enough for a statistically robust one.
8. **What limitations prevent strong claims?** See §16 — small n, single model/run, noisy real-world ground truth, no significance testing.
9. **Does this provide enough evidence to continue to a larger real-project benchmark?** See Final Decision below.

## 18. Recommendation

Continue investigating this problem on real repositories, but change two things before scaling up: (a) filter out or separately flag "incidental commit bundling" ground-truth cases, since they are not really testing constraint-applicability reasoning; and (b) specifically study *why* richer context increased false omissions here — that regression, not the (expected) false-activation improvement, is the more novel and actionable finding from this run.

---

## Final Decision

**B. Interesting but benchmark needs improvement.**

Rationale: The core phenomenon motivating this research — task+constraint text alone under-determining applicability — did reproduce on real CampusConnect history, and project context clearly helped on the subset of cases (62% of the dataset) independently judged to need it, with accuracy rising from 44.4% to 61.1% as more context was added. That is a real, non-trivial signal worth pursuing. However, the aggregate, whole-dataset picture is genuinely mixed: overall accuracy gains from context were small (+3.4 points) and overall F1 was flat-to-slightly-negative, driven by a rise in false omissions that the original hypothesis did not anticipate and that this run cannot fully explain. Combined with the small sample (29 cases, single run, no significance testing) and the discovery that some ground truth reflects incidental commit bundling rather than clean logical necessity, the evidence supports refining the benchmark methodology (larger, cleaner sample; repeated sampling; separating "bundled" from "logically required" cases) before treating this as validated enough to scale into a larger real-project benchmark as-is.

---

## Final Safety Check

- CampusConnect source code was not modified. ✅ (only reads and `git show`/`git log` were used; no edits to `Backend/`, `frontend/`, or any tracked file)
- Git history was not modified. ✅ (no `git commit`, `git reset`, `git rebase`, or history-altering commands were run)
- No commits were created. ✅
- No artificial tasks were invented. ✅ (all 13 underlying tasks are derived from real, verified commits: ea072fc, c716333, 2405b0b, 8e42a80, 167801f, fae7428, 3696eea, e75a98f, a75b45a, dcfea1d, b2bfb59, 873f05b, e3e03e4, b80f049, 2f4aae1, d5877a2)
- No artificial counterfactual pairs were created. ✅ (the two pairs in §14 both arise from independently-selected real commits sharing a constraint target)
- Ground truth came from actual historical changes. ✅ (`git show --stat` file lists for each commit; see `ground_truth.csv`)
- Predictions were made before ground truth was exposed. ✅ (Conditions A/B/C were each answered by a fresh subagent with no access to this conversation, no tools, and no ground-truth data in its prompt; ground truth was only compiled into CSVs after all three prediction sets returned)
- Conditions A, B and C used exactly the same 29 cases, same case numbering, same task/constraint text. ✅
- No few-shot examples were used. ✅ (each subagent prompt defined APPLICABLE/NOT_APPLICABLE abstractly, with no worked example tied to any answer)
- All experiment outputs are inside `real_project_evaluation/`. ✅
