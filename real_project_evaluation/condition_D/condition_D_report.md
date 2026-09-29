# Condition D — Normal Claude Code Evaluation

## 1. Objective

Conditions A/B/C tested whether an evaluator could correctly judge constraint applicability once *handed* varying amounts of project information. Condition D asks a different question: when given **normal, unrestricted read access** to the real CampusConnect repository (the same access a Claude Code agent has in everyday use), does the agent **recognize on its own** when a constraint's applicability is uncertain, **investigate** the codebase to resolve that uncertainty, and does that investigation actually produce more correct answers than being told information in advance?

## 2. Experimental Setup

- Same 29 cases, same case numbering, same constraint/task text as Conditions A/B/C (drawn from `real_project_evaluation/cases.csv`).
- Three fresh, tool-equipped subagents (no access to this conversation) each handled a disjoint slice of the 29 cases (1–10, 11–19, 20–29) in parallel, working directly against the live `d:/InternShipProjects/CampusConnect` working tree with Read/Grep/Glob/Bash.
- Each agent was explicitly forbidden from: modifying/creating/deleting any file, implementing the task, reading anything under `real_project_evaluation/` (which contains the answer key), and running any git-history command (`git log`, `git show`, `git blame`, historical `git diff`) — investigation was restricted to the **current** working-tree state only, exactly as a normal agent starting a brand-new task would experience it.
- Agents recorded, per case: initial hypothesis, whether investigation was judged needed, whether it was performed, investigation depth (0–4), tools used, files/directories inspected, evidence found, final prediction, and confidence — all before any ground truth was available to them.
- Ground truth comparison and all downstream analysis in this report were performed only after all 29 Condition D predictions were finalized and returned.

## 3. Investigation Policy

Agents were told to decide, per case, whether they already had enough information or needed to investigate, and to invest only as much depth as their natural judgment called for — not to over-investigate merely to try to force a correct answer.

## 4. Overall Results

**21/29 correct — 72.4% accuracy.** 3 false activations, 5 false omissions. Precision 82.4%, Recall 73.7%, F1 77.8%.

This is the best-performing condition of the four, both in accuracy and in F1, and the only condition where false omissions did **not** rise relative to Condition A.

## 5. A/B/C/D Comparison

| Metric | A: Task Only | B: + Tree | C: + Context | D: Normal Agent |
|---|---:|---:|---:|---:|
| Accuracy | 58.6% | 62.1% | 62.1% | **72.4%** |
| False Activation Rate | 17.2% | 10.3% | 6.9% | 10.3% |
| False Omission Rate | 24.1% | 27.6% | 31.0% | **17.2%** |
| Precision | 70.6% | 78.6% | 83.3% | 82.4% |
| Recall | 63.2% | 57.9% | 52.6% | **73.7%** |
| F1 | 66.7% | 66.7% | 64.5% | **77.8%** |

**D vs. the others:**

| Metric | D − A | D − B | D − C |
|---|---:|---:|---:|
| Accuracy | +13.8 pp | +10.3 pp | +10.3 pp |
| False Activation Rate | −6.9 pp | 0.0 pp | +3.4 pp |
| False Omission Rate | −6.9 pp | −10.3 pp | −13.8 pp |
| Precision | +11.8 pp | +3.8 pp | −0.9 pp |
| Recall | +10.5 pp | +15.8 pp | +21.1 pp |
| F1 | +11.1 pp | +11.1 pp | +13.3 pp |

Unlike B and C, which only reduced false activations at the cost of *more* false omissions, real investigation with tool access reduced **both** error types relative to Condition A, and dramatically improved recall — the ability to correctly recognize when a constraint genuinely does apply.

## 6. Investigation Behavior

| Investigation Behavior | Cases | Correct | Accuracy |
|---|---:|---:|---:|
| No investigation performed | 0 | 0 | n/a |
| Investigation performed | 29 | 21 | 72.4% |

Every single case (29/29, 100%) involved the agent actually reading real source files before answering — including the one case (11, footer link) where the agent explicitly judged investigation "not strictly needed" but still opened the file to confirm before committing to an answer. Self-reported `investigation_needed = YES` occurred in 28/29 cases (96.6%).

Because there are zero "no investigation" cases, this experiment **cannot** show whether skipping investigation would have hurt accuracy — the agent simply never chose to skip it. That in itself is the headline finding of this section (see §14).

## 7. Investigation vs Correctness

1. **How many cases required project investigation?** By the independent, task-text-only "necessity" classification carried over from Conditions A–C (`project_context_analysis.csv`), 18/29 (62%). By the agent's own real-time judgment, 28/29 (96.6%) — Claude Code investigated far more liberally than the external "is this really needed" classification would suggest was strictly necessary, including most "Clearly Applicable" cases.
2. **How many times did Claude Code recognize investigation was necessary?** 28/29 explicitly (`investigation_needed = YES`); the 29th was investigated anyway.
3. **How many cases were correctly solved WITHOUT investigation?** 0 — investigation was performed in all 29 cases, so this bucket is empty.
4. **How many cases were incorrectly solved WITHOUT investigation?** 0, same reason.
5. **How many cases were investigated but still answered incorrectly?** 8/29 (27.6%).
6. **Why did the 8 investigated-but-wrong cases fail?**

| Reason | Cases | Count |
|---|---|---:|
| Did not investigate | — | 0 |
| Investigated the wrong location | — | 0 |
| Stopped investigating too early | — | 0 |
| Found relevant evidence but interpreted it incorrectly | 8, 15, 21, 27 | 4 |
| Temporal confound — investigated a codebase where the task was already fully implemented | 7, 10, 14 | 3 |
| Other (ground truth reflects incidental, unrelated commit bundling) | 16 | 1 |

Zero errors trace back to "didn't look" or "looked in the wrong place." In every single wrong case, the agent inspected files that were, by any reasonable standard, exactly the right files to inspect. All 8 errors are reasoning/interpretation errors or artifacts of the experimental setup (see §14), not investigation-recognition or evidence-retrieval failures.

## 8. Cases Requiring Project Context

Using the 18 cases previously classified as `REQUIRED` in `project_context_analysis.csv`:

| Condition | Accuracy on the 18 REQUIRED cases |
|---|---:|
| A: Task Only | 44.4% |
| B: + Tree | 50.0% |
| C: + Context | 61.1% |
| D: Normal Agent | **61.1%** |

D ties C on exactly the cases that were hardest for A/B/C — but D's *overall* advantage comes from the other 11 cases (10 "UNNECESSARY" + 1 "HELPFUL"), where it scored 10/11 (91%) vs. C's 7/11 (64%; see §9 of the main report). Investigation with real evidence didn't just fix the hard cases C already improved on — it also avoided the new mistakes C introduced on the easy ones.

On these 18 cases specifically: Claude Code investigated all 18 (100%), and investigation led to the correct answer in 11/18 (61%). It never failed to investigate on a required case. Where it still failed (7, 8, 10, 14, 16, 21, 27 — all overlapping the REQUIRED set except 15, which is UNNECESSARY), the causes are the same three categories from §7: temporal confound (7, 10, 14), evidence misinterpretation (8, 21, 27), and incidental commit bundling (16).

## 9. False Activation Analysis

D's 3 false activations (cases 8, 10, 14) all follow the same shape: the agent found real, accurate evidence in the current codebase suggesting a file *is* the natural home for a piece of functionality, and inferred a task would need to touch it — but in the specific historical change being evaluated, either (a) a different, non-obvious location was used instead (case 8: client-side filtering rather than a controller change), or (b) the current file already fully reflects functionality added across *multiple* historical commits, making the specific commit's boundary invisible from the present-day snapshot (cases 10, 14). This is a milder version of the same "obvious-file assumption" error seen in A/B/C, but tool-backed evidence cut the overall false-activation rate roughly in half versus Condition A.

## 10. False Omission Analysis

D's 5 false omissions (cases 7, 15, 16, 21, 27) are more informative than its false activations because they occurred *despite* the agent finding and citing accurate, relevant evidence in every single instance:
- **7**: found that all fields needed for the task already exist on the model — true today, but only because the historical commit already added them (temporal confound).
- **15**: found (correctly) that the component doesn't implement filtering logic itself, then over-generalized that to "doesn't need changes."
- **16**: found (correctly) no logical connection to the task — a defensible conclusion given that the ground truth here is an incidental, unrelated change bundled into the same historical commit, not a true dependency.
- **21**: found (correctly) that the form file, not the card file, has form inputs, and took the task's word "forms" literally, even while noting the card component was a live alternative.
- **27**: found (correctly) that the frontend widget has no search/ranking logic itself, and concluded a "search relevance" task wouldn't touch it — the same frontend/backend framing bias seen in every other condition.

Notably, D's false-omission rate (17.2%) is the *lowest* of all four conditions, including Condition A — real investigation reduced false omissions where B and C made them worse.

## 11. Counterfactual Pair Analysis

Both natural counterfactual pairs identified in the main experiment were re-run under Condition D:

**Pair 1 — `Backend/controllers/notification.controller.js`:**
- Case 14 (task: per-user notification tray) — D predicted **APPLICABLE**; ground truth is **NOT_APPLICABLE**. Investigated (depth 2): found the controller already implements correct recipient-based filtering, and inferred the task must touch this file.
- Case 22 (task: dashboard live activity feed) — D predicted **APPLICABLE**; ground truth is **APPLICABLE**. Investigated (depth 3): found `LiveFeed.jsx` fetches directly from this controller's endpoint.
- **Did Claude Code correctly distinguish them? No** — it predicted APPLICABLE for both, so it got 22 right and 14 wrong, the same split every other condition (A/B/C) also produced. Both investigations were genuine and found real evidence in the same file; the failure is that "this file already correctly implements the described behavior" doesn't reliably tell you whether *this specific task* needed to change it, especially against an already-finished codebase (see §14).

**Pair 2 — `Backend/middleware/sanitize.js`:**
- Case 3 (task: feedback submission with comments) — D predicted **APPLICABLE**; ground truth is **APPLICABLE**. Investigated (depth 3): found `validateComment`'s `author` field is specifically wired for anonymous comment authoring.
- Case 6 (task: feedback like/unlike) — D predicted **NOT_APPLICABLE**; ground truth is **NOT_APPLICABLE**. Investigated (depth 2): found the like/unlike routes use only `optionalAuth`, bypassing `sanitize.js` entirely.
- **Did Claude Code correctly distinguish them? Yes** — both predictions match ground truth. This is the one pair where investigation cleanly resolved the ambiguity in both directions (Condition C also got both of these right; A and B got case 3 wrong).

## 12. Error Analysis

Full detail in `condition_D_error_analysis.csv`. Summary: 8 errors, 3 false activations + 5 false omissions, zero attributable to "didn't investigate" or "investigated the wrong file." 4 are genuine reasoning/interpretation gaps despite correct evidence; 3 are attributable to a structural confound in how Condition D's investigation target (the current, fully-merged codebase) relates to historical, already-completed ground truth; 1 reflects ground truth noise from incidental commit bundling that no investigation of current code could have surfaced.

## 13. What the Agent Actually Did

Across all 29 cases, the agent read an average of roughly 2–3 real files per case (range: 1 file at depth 2 to 5 files at depth 4), used `Read` as its primary tool supplemented by `Grep`/`Glob`/`Bash` for structural search, and in several cases (17, 18, 19, 22, 25, 26, 28) found and cited the *exact* line of code responsible for the behavior in question (e.g., the `setImmediate(() => transformBloodRequestToNotification(...))` call in `request.controller.js` for case 17, or the already-present `'blood'` entry in `LiveFeed.jsx`'s `TYPE_META` for case 25). This is qualitatively different from Conditions A/B/C, which reasoned about plausible file purposes without ever seeing actual code.

## 14. Research Interpretation

Which of the five scenarios is best supported?

- **Scenario 2 (fails to investigate) is not supported.** Investigation occurred in 29/29 cases.
- **Scenario 3 (investigates the wrong evidence) is not supported.** In all 8 error cases, the files inspected were the objectively relevant ones.
- **Scenario 4 (investigates correctly but still reasons incorrectly) is partially supported.** 4 of 8 errors (8, 15, 21, 27) are pure reasoning gaps on top of accurate evidence — task wording biased the final call even when the evidence pointed elsewhere or was ambiguous.
- **Scenario 5 (the problem is primarily caused by something else) is also strongly supported, and is arguably the most important finding of Condition D.** 3 of 8 errors (7, 10, 14) and part of the pair-1 counterfactual failure trace back to a structural property of this specific experimental design: Condition D investigates the repository **as it exists today**, i.e., *after* every historical commit (including the "future" one the task describes) has already happened and merged. A normal agent asked "would implementing X require touching file Y" against a codebase where X is already fully implemented will often find "Y already has what's needed" — which is accurate evidence, but doesn't cleanly answer whether Y was the file that *originally* had to change for that specific historical commit. Conditions A/B/C never had this problem because they had no access to implementation detail to be confused by. A/B/C's own errors (same-topic-different-file, frontend/backend confusion) still show up here too (case 27 in particular is identical in nature to Condition A/B/C's case 27 error), but they are now the minority cause rather than the majority one.
- **Scenario 1 (solves reliably) is not fully supported** — 72.4% accuracy and 8 residual errors is a clear improvement but not "reliable" in any strong sense, and the improvement is partly an artifact of §14's confound rather than pure reasoning capability.

**Best-supported conclusion:** normal Claude Code, given real tool access, investigates almost universally and that investigation measurably and substantially improves both accuracy and F1 over every synthetic-context condition (A/B/C) — but a meaningful share of the residual errors are not about investigation behavior at all. They stem from a mismatch between what Condition D can observe (a finished, present-day codebase) and what the ground truth actually tests (a specific historical commit's boundary), plus a smaller number of genuine task-wording-driven reasoning biases that persisted despite correct evidence.

## 15. Limitations

- **The temporal-confound issue is the dominant limitation of this specific run.** Because Condition D was restricted (by the experiment's own git-history ban) from checking out the repository state *before* each historical commit, the agent could only ever investigate the fully-merged present-day tree. For at least 3 of the 8 errors (and arguably contributing to a 4th, case 16, and the pair-1 failure), this materially changes what "investigation" can reveal, in a way that has no equivalent in Conditions A/B/C. This is not a flaw in the agent's behavior — it is a flaw in how directly Condition D's results can be compared to A/B/C on a like-for-like basis.
- **Batching**: 29 cases were split across 3 parallel agent instances (10/9/10) rather than 29 fully independent sessions, for cost/time reasons; some within-batch carry-over is possible, though each case was explicitly instructed to be treated independently and the investigation logs show no obvious cross-case bleed.
- **Single run, single model, no repeated sampling** — same caveat as the main experiment; no confidence intervals or significance testing were computed.
- **Small n (29 cases)** — same caveat as the main experiment.
- **Confidence self-reports are the agent's own, uncalibrated** — e.g., several wrong answers were reported at HIGH confidence (8, 14, 16, 27), meaning confidence was not a reliable signal for catching these errors in this run.

## 16. Recommendation

**D. Results are inconclusive; improve the benchmark first.**

This is not a rejection of Claude Code's investigation behavior — quantitatively, Condition D was the strongest of the four conditions by a clear margin (72.4% accuracy, 77.8% F1, best-in-class on both false-activation and false-omission rate simultaneously), and the qualitative evidence is unambiguous that the agent investigates thoroughly and reads the objectively correct files essentially every time it is uncertain. Recommendations B and C ("investigation is inconsistent," "evidence selection is problematic") are **not** well supported by this data — investigation was consistent (29/29) and evidence selection was accurate in all 8 error cases.

The reason the recommendation is still "improve the benchmark" rather than "A: investigation is sufficient, reconsider the research direction" is that this run surfaced a genuine confound in how Condition D's ground truth was constructed: it asks whether a task "requires" touching a file, but lets the investigating agent see a codebase where that task is already finished. At least 3 of 8 errors, and likely a contributing factor in a 4th, are attributable to this confound rather than to any real limitation in the agent's investigation or reasoning. Before treating "does normal investigation solve this" as answered, the benchmark should be re-run with the confound removed — most directly, by investigating a `git worktree` checked out to the commit immediately *before* each selected historical commit (which the current experiment's constraints explicitly disallowed) so the agent is investigating a codebase where the task genuinely has not yet been done.

---

## Final Safety Check

- No CampusConnect source files modified. ✅ (only `Read`/`Grep`/`Glob`/read-only `Bash` were used by all three investigation subagents; no `Edit`/`Write` calls were made against `Backend/` or `frontend/`)
- No commits created. ✅
- No Git history modified. ✅ (subagents were explicitly instructed not to run any git commands at all)
- A/B/C files not overwritten. ✅ (`cases.csv`, `ground_truth.csv`, `predictions_task_only.csv`, `predictions_project_tree.csv`, `predictions_project_context.csv`, `error_analysis.csv`, `project_context_analysis.csv`, `report.md`, `project_tree.txt` are untouched; all Condition D work is new files under `condition_D/`)
- Exactly the same 29 cases used, same case_id numbering, same constraint/task text as A/B/C. ✅
- No few-shot examples used. ✅ (each investigation prompt defined APPLICABLE/NOT_APPLICABLE abstractly with no worked example tied to an answer)
- Ground truth was hidden during prediction. ✅ (investigation subagents were explicitly forbidden from reading anything under `real_project_evaluation/`, and had no access to this conversation or its history)
- Previous predictions were hidden during prediction. ✅ (same mechanism — subagents never read `predictions_*.csv` or `error_analysis.csv`)
- All 29 predictions were finalized before comparison. ✅ (ground truth comparison and all metrics in this report were computed only after all three investigation batches returned their complete 29-case results)
- All Condition D outputs are inside `condition_D/`. ✅
