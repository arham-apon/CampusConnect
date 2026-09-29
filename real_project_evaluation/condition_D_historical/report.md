# Condition D — Historical (Pre-Commit) Repository State

## 1. Purpose

The original Condition D evaluated constraint applicability against the **current** CampusConnect repository, using ground truth derived from historical commits. That created a temporal confound: the agent could see the finished result of a change while judging whether a constraint would have blocked it. This experiment repeats Condition D against an isolated Git worktree checked out at the **immediate parent commit** of each historical commit — i.e., the repository exactly as it existed right before the relevant change was made — to see whether accuracy improves once that confound is removed.

## 2. Method

- 29 cases, 16 unique historical commits. For each unique commit, `git worktree add --detach <path> <parent-commit>` created an isolated, read-only snapshot (renamed to neutral `group01..group16` labels so no commit hash was visible to the evaluating agent).
- A fresh `general-purpose` subagent was dispatched per worktree group (one or more cases sharing the same commit), given only the constraint + task text for its case(s) and the worktree path. Agents were explicitly forbidden from running git commands (no log/diff/blame/show), builds, tests, or installs, and could not write/edit/delete files.
- Constraint and task text were extracted programmatically from `ground_truth.csv`'s `constraint`/`task` columns only (never the `ground_truth`, `constraint_target`, or `ground_truth_reason` columns), so the label itself was never seen before predictions were finalized.
- All 29 predictions were recorded before `ground_truth.csv` was opened in full.

## 3. Headline Result

| Metric | Previous Condition D (current repo) | New Condition D (pre-commit repo) | Δ |
|---|---:|---:|---:|
| Accuracy | 72.4% (21/29) | **69.0% (20/29)** | −3.4 pp |
| Correct | 21 | 20 | −1 |
| Incorrect | 8 | 9 | +1 |
| False Activations | 3 | 1 | −2 |
| False Activation Rate | 10.3% | 3.4% | −6.9 pp |
| False Omissions | 5 | 8 | +3 |
| False Omission Rate | 17.2% | 27.6% | +10.4 pp |
| Precision | 82.4% | 91.7% | +9.3 pp |
| Recall | 73.7% | 57.9% | −15.8 pp |
| F1 | 77.8% | 71.0% | −6.8 pp |

Removing the temporal confound did **not** improve accuracy — it moved sideways to slightly worse (72.4% → 69.0%). The error *shape* changed substantially: the agent became much more conservative (false activations dropped from 3 to 1, precision rose to 91.7%), but that conservatism came at the cost of missing far more real applicability cases (false omissions rose from 5 to 8, recall fell to 57.9%). The two effects roughly cancel, with a slight net loss.

## 4. Error Transition Analysis

Comparing the 8 previous-Condition-D errors {7, 8, 10, 14, 15, 16, 21, 27} against the 9 new-Condition-D errors {3, 7, 8, 15, 16, 21, 24, 27, 29}:

- **Disappeared (2): cases 10, 14.** Both were false activations in the current-repo condition, caused directly by seeing future state: case 10's `marketplace.routes.js` didn't exist yet at the pre-commit snapshot (it was genuinely created in a *later* commit, matching ground truth exactly), and case 14's per-user notification filtering was already correctly implemented in the pre-commit code (added in an earlier commit), so there was nothing left to fix. These are the clearest confound-driven errors, and removing the confound fixed them for the right reason.
- **Persisted (6): cases 7, 8, 15, 16, 21, 27.** Same wrong verdict in both conditions. Root causes are not confound-related: a same-topic-different-file default assumption (case 8, also the most persistent false activation across the original A/B/C conditions), forward-looking schema/architecture extensions the agent had no way to predict from present functionality (case 7), a component/page conflation (case 21), a create-vs-modify semantics disagreement (case 15), and two commits with incidental, task-unrelated bundled changes that no amount of repository access could reveal (cases 16, 27).
- **New (3): cases 3, 24, 29.** Did not occur in the current-repo condition, where the relevant files already contained the finished feature and were easy to match to the task. Against the leaner pre-commit state, the agent under-generalized from partial evidence: assuming an existing validator file's pattern wouldn't be extended (case 3, self-flagged LOW confidence), assuming a Prisma-only architecture ruled out a sibling Mongoose model being created for the same feature even after flagging the matching controller as APPLICABLE (case 24), and assuming existing profile endpoints were sufficient rather than being extended (case 29).

Net: 2 errors fixed, 3 new errors introduced, 6 unchanged.

## 5. Investigation Quality

- All 29 cases show `investigation_performed = YES` with depth 2–3 (one case at depth 3 involving 9 route-file reads for a genuinely repo-wide constraint). No case shows signs of unnecessary investigation — agents stopped once they found a clear structural answer (e.g., "file does not exist", "field absent from schema", "empty stub file"), and none re-opened the same file repeatedly or explored unrelated modules.
- In all 9 remaining error cases, the agent inspected the objectively correct and sufficient files (including the constrained file itself in every case). None of the 9 errors stem from failing to look in the right place — they stem from **interpretation** of correctly-gathered evidence: assuming current functionality is "finished" rather than about to be extended, assuming component boundaries that don't match the actual diff, or facing information that genuinely isn't present in any repository snapshot (bundled incidental commits).

## 6. Reasoning-Type Breakdown of Remaining Errors (9 total)

| Type | Count | Cases |
|---|---:|---|
| Reasoning error (existing-functionality-is-sufficient / component-boundary assumption) | 6 | 3, 7, 8, 21, 24, 29 |
| Unknowable bundled/incidental commit change | 2 | 16, 27 |
| Create-vs-modify semantic ambiguity | 1 | 15 |

Roughly two-thirds of the remaining errors are genuine applicability-reasoning failures — the agent has all the facts it needs and draws the wrong inference about scope. About a fifth (2/9) are not solvable by any repository state, since the ground-truth commits bundled task-unrelated edits alongside the feature work. One case reflects a definitional disagreement about whether creating a not-yet-existing file counts as "modifying" it under a "do not modify X" constraint — arguably a benchmark-labeling question rather than an agent capability question.

## 7. Conclusion

**Answer to "does the constraint-applicability problem still exist after removing the temporal confound?": Conclusion B — the temporal confound explains some errors, but a genuine applicability problem remains.**

Evidence:
- The confound was real and demonstrably caused errors: 2 of the 8 original errors were confound-driven false activations, fixed cleanly once the agent saw the actual pre-commit state (correct-file-doesn't-exist-yet; requirement-already-satisfied).
- But removing the confound did not raise the accuracy ceiling — it was roughly a wash (72.4% → 69.0%, within noise for n=29 but directionally flat-to-worse), because pre-commit repository states introduce their own class of hard cases (leaner codebases require more extrapolation about what a feature "would" require) that the finished, current-repo state didn't have.
- The dominant error category in the pre-commit condition (6/9, ~67%) is the same kind of applicability-reasoning failure documented in the original Conditions A/B/C: same-topic-different-file defaults, component/page conflation, and "existing code looks sufficient" assumptions. These are not artifacts of seeing the future; they reproduce even when the agent is looking at exactly the code that existed at decision time.
- A residual ~7% of cases (2/29) are not answerable from any repository state, since the ground-truth commits contain incidental, task-unrelated edits bundled alongside the feature work — a benchmark-noise ceiling rather than an agent-capability gap.

The research hypothesis that the temporal confound was the primary or sole driver of the 72.4%-vs-100% gap is **not supported** by this data — the confound accounts for a real but small (2/29 ≈ 7 pp of the original error budget) share of errors, and the constraint-applicability problem persists at essentially the same magnitude once it is removed.

## 8. Final Safety Check

- 29/29 cases evaluated, blind, before `ground_truth.csv` was opened.
- No previous predictions, error analysis, or prior Condition D results were read until all 29 new predictions were recorded.
- No source files modified; no commits created; no branches changed in the original working tree.
- All investigation happened in isolated `git worktree` snapshots outside the project directory (under the session scratchpad), removed via `git worktree remove` after use.
- No builds, tests, or installs were run.
- Files created: `predictions.csv`, `investigation_log.csv`, `error_analysis.csv`, `report.md` under `real_project_evaluation/condition_D_historical/`.
