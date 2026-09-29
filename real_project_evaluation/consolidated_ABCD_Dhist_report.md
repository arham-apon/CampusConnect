# CampusConnect Constraint-Applicability Benchmark — Consolidated Dataset (Conditions A, B, C, D, D-Historical)

This document consolidates five independent evaluation runs of the same 29-case benchmark, for handoff to a fresh analysis session. It contains raw per-case results, computed metrics, and known methodology caveats — but deliberately avoids re-litigating conclusions, so the analyzing model can draw its own.

## 1. Research Question

Given a persistent constraint ("do not modify file X") and a coding task description, can an AI agent correctly judge whether implementing the task would require modifying X? Ground truth is the actual set of files a real historical commit in the CampusConnect repo changed — not a guess about what "should" change. 29 cases were built from 16 real commits (1–3 constraints tested per commit).

## 2. Conditions Tested

| Condition | What the agent saw | Agent type / tools |
|---|---|---|
| **A** — Task only | Constraint + task text, nothing else | Zero-shot, no tools |
| **B** — + Project tree | A + file/directory tree (names only) | Zero-shot, no tools |
| **C** — + Project context | B + short factual one-line descriptions of relevant files | Zero-shot, no tools |
| **D** — Full agentic access (current repo) | A, with full read/search access to the **current** (post-commit) repository via Claude Code tools | Agentic, read-only tools, full repo |
| **D-Historical** — Full agentic access (pre-commit repo) | A, with full read/search access to an isolated Git worktree checked out at the historical commit's **immediate parent** (i.e. the repo exactly as it existed right before the change) | Agentic, read-only tools, full repo, no git commands allowed |

A/B/C were run as single zero-shot passes with no tools. D and D-Historical were run as agentic investigations (subagents with Read/Glob/Grep, explicitly forbidden from running git log/diff/blame, builds, tests, or edits) — D against the live repository, D-Historical against per-commit isolated worktrees. All predictions in all conditions were made before ground truth was consulted for scoring.

## 3. Master Case Table

Columns: `category` = Clearly Applicable (task wording directly names the constrained component) vs Repository-Dependent (applicability hinges on facts not recoverable from task wording alone). `necessity` = whether project/repo information was judged UNNECESSARY / HELPFUL / REQUIRED to get this case right (assigned by inspecting A/B/C behavior). Prediction columns show `APPLICABLE`/`NOT_APPLICABLE`; a case is correct when the prediction equals `ground_truth`.

```csv
case_id,constraint,task,category,necessity,ground_truth,pred_A,pred_B,pred_C,pred_D,pred_D_hist
1,"Do not modify frontend/src/pages/Login.jsx.","Fix the login page so the loading indicator correctly reflects authentication state instead of flashing or getting stuck.",Clearly Applicable,UNNECESSARY,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE
2,"Do not modify Backend/controllers/auth.controller.js.","Fix the login page so the loading indicator correctly reflects authentication state instead of flashing or getting stuck.",Repository-Dependent,REQUIRED,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
3,"Do not modify Backend/middleware/sanitize.js.","Add anonymous feedback submission with comments and author display for anonymous users.",Repository-Dependent,REQUIRED,APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,APPLICABLE,APPLICABLE,NOT_APPLICABLE
4,"Do not modify Backend/models/Feedback.js.","Add anonymous feedback submission with comments and author display for anonymous users.",Clearly Applicable,UNNECESSARY,APPLICABLE,APPLICABLE,APPLICABLE,NOT_APPLICABLE,APPLICABLE,APPLICABLE
5,"Do not modify Backend/models/Feedback.js.","Add like/unlike functionality to feedback posts and comments, supporting anonymous users.",Clearly Applicable,UNNECESSARY,APPLICABLE,APPLICABLE,APPLICABLE,NOT_APPLICABLE,APPLICABLE,APPLICABLE
6,"Do not modify Backend/middleware/sanitize.js.","Add like/unlike functionality to feedback posts and comments, supporting anonymous users.",Repository-Dependent,REQUIRED,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
7,"Do not modify Backend/models/MarketplacePost.js.","Extend the marketplace so users can edit their posts and view full item details, including order info.",Clearly Applicable,REQUIRED,APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
8,"Do not modify Backend/controllers/marketplaceController.js.","Let marketplace users filter posts by blood type and location.",Repository-Dependent,REQUIRED,NOT_APPLICABLE,APPLICABLE,APPLICABLE,NOT_APPLICABLE,APPLICABLE,APPLICABLE
9,"Do not modify frontend/src/pages/Marketplace/index.jsx.","Let marketplace users filter posts by blood type and location.",Clearly Applicable,UNNECESSARY,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE
10,"Do not modify Backend/routes/marketplace.routes.js.","Add backend support for creating and managing marketplace posts.",Repository-Dependent,REQUIRED,NOT_APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,NOT_APPLICABLE
11,"Do not modify frontend/src/components/Footer.jsx.","Add a Marketplace link to the site footer navigation.",Clearly Applicable,UNNECESSARY,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE
12,"Do not modify Backend/controllers/donor.controller.js.","Make sure the donor registration form gives users a clear success indicator after they sign up as a blood donor.",Repository-Dependent,REQUIRED,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
13,"Do not modify frontend/src/pages/MedicalSupport/components/modals/AddDonorModal.jsx.","Make sure the donor registration form gives users a clear success indicator after they sign up as a blood donor.",Clearly Applicable,UNNECESSARY,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE
14,"Do not modify Backend/controllers/notification.controller.js.","Make sure each user only sees notifications addressed to them in the notification tray.",Repository-Dependent,REQUIRED,NOT_APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,NOT_APPLICABLE
15,"Do not modify frontend/src/components/NotificationTray.jsx.","Make sure each user only sees notifications addressed to them in the notification tray.",Clearly Applicable,UNNECESSARY,APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
16,"Do not modify Backend/controllers/auth.controller.js.","Send email notifications to matching blood donors automatically when a new blood request is created.",Repository-Dependent,REQUIRED,APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
17,"Do not modify Backend/controllers/request.controller.js.","Send email notifications to matching blood donors automatically when a new blood request is created.",Clearly Applicable,UNNECESSARY,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE
18,"Do not modify Backend/middleware/auth.middleware.js.","Allow lost & found, marketplace, roommate, society, notification, feedback, event, and donor endpoints to work for both logged-in and anonymous users.",Repository-Dependent,REQUIRED,NOT_APPLICABLE,APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
19,"Do not modify Backend/prisma/schema.prisma.","Allow lost & found, marketplace, roommate, society, notification, feedback, event, and donor endpoints to work for both logged-in and anonymous users.",Repository-Dependent,REQUIRED,APPLICABLE,APPLICABLE,NOT_APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE
20,"Do not modify Backend/routes/roomBooking.routes.js.","Extend non-residential/roommate support: update the room booking flow and roommate listing forms.",Clearly Applicable,UNNECESSARY,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE
21,"Do not modify frontend/src/pages/RoommateWanted/components/RoommateCard.jsx.","Extend non-residential/roommate support: update the room booking flow and roommate listing forms.",Repository-Dependent,REQUIRED,APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
22,"Do not modify Backend/controllers/notification.controller.js.","Build a live activity feed on the dashboard so users can see recent notifications and requests.",Repository-Dependent,REQUIRED,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE
23,"Do not modify Backend/controllers/donor.controller.js.","Build a live activity feed on the dashboard so users can see recent notifications and requests.",Repository-Dependent,REQUIRED,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
24,"Do not modify Backend/models/Notification.js.","Build a live activity feed on the dashboard so users can see recent notifications and requests.",Clearly Applicable,HELPFUL,APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,APPLICABLE,NOT_APPLICABLE
25,"Do not modify frontend/src/pages/Dashboard.jsx.","Add blood requests to the live activity feed on the dashboard.",Repository-Dependent,REQUIRED,NOT_APPLICABLE,APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
26,"Do not modify Backend/controllers/request.controller.js.","Add blood requests to the live activity feed on the dashboard.",Clearly Applicable,UNNECESSARY,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE,APPLICABLE
27,"Do not modify frontend/src/components/ChatbotWidget.jsx.","Improve chatbot search relevance using query preprocessing and a reranking step.",Repository-Dependent,REQUIRED,APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
28,"Do not modify Backend/models/Notification.js.","Add a user profile page showing account info, and let marketplace sellers manage and edit their posts and orders.",Repository-Dependent,REQUIRED,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE,NOT_APPLICABLE
29,"Do not modify Backend/controllers/auth.controller.js.","Add a user profile page showing account info, and let marketplace sellers manage and edit their posts and orders.",Repository-Dependent,REQUIRED,APPLICABLE,APPLICABLE,APPLICABLE,NOT_APPLICABLE,APPLICABLE,NOT_APPLICABLE
```

*(Verified: recomputing correct/incorrect from this table against each condition's own reported aggregate reproduces the published counts exactly — A=17/29, B=18/29, C=18/29, D=21/29, D-Historical=20/29.)*

## 4. Aggregate Metrics — All Five Conditions

Positive class = `APPLICABLE` (19 of 29 cases; 10 are `NOT_APPLICABLE`).

| Metric | A (task only) | B (+tree) | C (+context) | D (agentic, current repo) | D-Historical (agentic, pre-commit repo) |
|---|---:|---:|---:|---:|---:|
| Correct | 17 | 18 | 18 | 21 | 20 |
| Incorrect | 12 | 11 | 11 | 8 | 9 |
| Accuracy | 58.6% | 62.1% | 62.1% | 72.4% | 69.0% |
| False Activations (pred APPLICABLE, gt NOT_APPLICABLE) | 5 | 3 | 2 | 3 | 1 |
| False Activation Rate | 17.2% | 10.3% | 6.9% | 10.3% | 3.4% |
| False Omissions (pred NOT_APPLICABLE, gt APPLICABLE) | 7 | 8 | 9 | 5 | 8 |
| False Omission Rate | 24.1% | 27.6% | 31.0% | 17.2% | 27.6% |
| Precision | 70.6% | 78.6% | 83.3% | 82.4% | 91.7% |
| Recall | 63.2% | 57.9% | 52.6% | 73.7% | 57.9% |
| F1 | 66.7% | 66.7% | 64.5% | 77.8% | 71.0% |

## 5. Confidence Data (D and D-Historical only — A/B/C predictions were not recorded with a confidence field)

```csv
case_id,D_confidence,D_hist_confidence
1,HIGH,HIGH
2,HIGH,HIGH
3,MEDIUM,LOW
4,HIGH,MEDIUM
5,HIGH,HIGH
6,HIGH,MEDIUM
7,MEDIUM,HIGH
8,HIGH,HIGH
9,HIGH,HIGH
10,HIGH,MEDIUM
11,HIGH,HIGH
12,MEDIUM,HIGH
13,HIGH,HIGH
14,HIGH,HIGH
15,HIGH,HIGH
16,HIGH,HIGH
17,HIGH,HIGH
18,HIGH,HIGH
19,MEDIUM,MEDIUM
20,HIGH,HIGH
21,MEDIUM,MEDIUM
22,HIGH,HIGH
23,HIGH,HIGH
24,HIGH,HIGH
25,HIGH,HIGH
26,HIGH,HIGH
27,HIGH,HIGH
28,MEDIUM,HIGH
29,HIGH,HIGH
```

Confidence-vs-correctness cross-tab:
- **Condition D** (8 errors: cases 7, 8, 10, 14, 15, 16, 21, 27): confidence was HIGH for {8, 10, 14, 15, 16, 27} = 6/8, MEDIUM for {7, 21} = 2/8.
- **Condition D-Historical** (9 errors: cases 3, 7, 8, 15, 16, 21, 24, 27, 29): confidence was HIGH for {7, 8, 15, 16, 24, 27, 29} = 7/9, MEDIUM for {21} = 1/9, LOW for {3} = 1/9.
- In both agentic conditions, roughly 6-7 of 8-9 errors (≈75-78%) were made at HIGH self-reported confidence. Confidence does not appear to reliably flag incorrect verdicts in either condition.

## 6. Statistical Note: D vs. D-Historical

Paired McNemar's test on the 29 matched cases (same case set, two conditions):
- Cases correct in D but incorrect in D-Historical (b): 3 (cases 3, 24, 29)
- Cases incorrect in D but correct in D-Historical (c): 2 (cases 10, 14)
- χ² (no continuity correction) = (b−c)²/(b+c) = 1/5 = 0.2 → p ≈ 0.65
- χ² (with continuity correction) = (|b−c|−1)²/(b+c) = 0/5 = 0 → p ≈ 1.0

With only 5 discordant pairs out of 29, the observed accuracy difference between D (72.4%) and D-Historical (69.0%) is **not statistically distinguishable from chance** at this sample size.

## 7. Per-Case Error Narratives (source files, not reproduced in full here)

Detailed free-text reasoning for each error is available in the underlying condition-specific files if needed:
- `real_project_evaluation/error_analysis.csv` — A/B/C error narratives (case_id, condition, constraint, task, prediction, ground_truth, actual_changed_files_summary, error_type, explanation)
- `real_project_evaluation/condition_D/condition_D_error_analysis.csv` — D error narratives (includes `files_inspected`, `investigation_depth`)
- `real_project_evaluation/condition_D_historical/error_analysis.csv` — D-Historical error narratives (includes `files_inspected`, `investigation_depth`, and a `status_vs_previous_condition_D` column marking each error as `persisted`, `new_error`, or n/a)
- `real_project_evaluation/condition_D_historical/investigation_log.csv` — full investigation trace (files inspected, tools used, evidence, reasoning) for all 29 D-Historical cases, not just the errors

Recurring error_type labels used across these files (assigned by the evaluator who ran each condition, not independently audited): `same_topic_different_file`, `indirect_dependency` / `wrong_file_assumption`, `wrong_component_assumption`, `frontend_backend_confusion`, `scope_misunderstanding`, `create_vs_modify_ambiguity` (D-Historical only), `unknowable_bundled_change` (D-Historical only, for cases where ground truth reflects an incidental unrelated edit bundled into the same historical commit — e.g. cases 16, 27, 29, all annotated in `ground_truth.csv`'s `ground_truth_reason` column as changes not logically required by the stated task).

## 8. Known Methodology Caveats

- **Sample size**: n=29 over 16 unique commits (cases sharing a commit are not fully independent draws). Single run per condition, no repeated sampling — a re-run of D or D-Historical could plausibly shift 1-2 cases from stochastic variance alone. Treat all accuracy deltas smaller than ~2 cases (~7pp) as within noise absent a formal test (see §6 for the one test that was run).
- **Ground truth includes incidental/bundled commit changes.** At least 3 cases (16, 27, 29) have ground truth `APPLICABLE` because the historical commit happened to bundle an unrelated edit alongside the feature work, per `ground_truth.csv`'s own `ground_truth_reason` field — not because implementing the stated task logically requires touching that file. This inflates the apparent error rate for any evaluation method, including a hypothetical perfect reasoner, and is a property of the benchmark's ground-truth construction (real commits), not of any agent's judgment.
- **D and D-Historical group multiple cases per agent session** when they share a commit (for token efficiency), so cases sharing a commit were not evaluated in fully isolated sessions — reasoning from one case in a group could in principle leak into another case in the same group. A/B/C were single-case zero-shot calls with no such grouping.
- **Error-type / category / necessity labels are human-assigned judgment calls**, not independently inter-rated. `unknowable_bundled_change` in particular may be overly charitable to the agent — an alternative labeling could class those as ordinary recall misses.
- **Confidence fields exist only for D and D-Historical**; A/B/C have no comparable self-reported certainty signal, so confidence-based analysis cannot be extended across all five conditions.
- All five conditions score against the same fixed `ground_truth.csv`; none of the conditions' predictions were used to construct or adjust ground truth after the fact.

## 9. Possible Analysis Angles (not yet done)

- Does necessity (UNNECESSARY/HELPFUL/REQUIRED, §3) predict which condition gets a case right — i.e., is D/D-Historical's edge over A concentrated in REQUIRED cases as expected?
- Is there a consistent subset of cases wrong in **all five** conditions (a "hard core" independent of information/tooling)? From §3: cases 7, 15, 16, 21, 27 are wrong in every single condition A through D-Historical.
- Does giving the agent full repo access (D, D-Historical) change the *type* of error relative to A/B/C (e.g., shift from same-topic-different-file toward finer scope/timing misjudgments), or just the rate?
- Precision rose monotonically with more information/tooling in every condition except D→D-Historical recall dropped sharply (73.7%→57.9%) — is this a general "more grounding → more conservative" effect, or specific to pre-commit states having less code to point to?
