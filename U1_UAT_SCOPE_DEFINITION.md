# U1 UAT Scope Definition — U1-S1

**Slice name:** Qualification Card Operator Trust + Review Flow UAT
**Status:** DRAFT — **CC PROPOSAL (rescoped)**, pending DRJ definition and approval
**Per:** PTC directive `U1_UAT_SCOPE_REMEDIATION` (Option C selected)
**Branch:** `u1-uat` @ origin `b623580` (from `xas-controlled-integration`)

> Rescoped per PTC's Option-C decision: U1-S1 validates only the **certified
> LiteQDS Qualification Card behavior that already exists in this repo**. The
> earlier journey-navigation / ALIGN-INPUT / theme-switching / journey-spine
> language is removed (Options A and B were rejected).
>
> This document is a **CC proposal** for DRJ review. It is **not an
> authorization.** CC will not begin any UAT implementation until DRJ approves
> this document **and** explicitly grants execution authorization (see §13).

---

## 1 · Purpose

Validate operator comprehension, trust-signal interpretation, the review-only
posture, failure-state cognition, and rollback-safe review flow for the
**certified LiteQDS Qualification Card** — the card produced by the certified
generator and drawn by the certified renderer. U1-S1 is a cognition/clarity
UAT of behavior that already exists; it builds no new functionality.

## 2 · Authorized Surface Scope

U1-S1 validates the certified LiteQDS Qualification Card **only**.

| Parameter | Value |
|---|---|
| Subject | the certified LiteQDS Qualification Card (certified renderer output) |
| Review mount | `internal_review_surface` (controlled review mount) |
| Interaction mode | `review_only` — the only permitted mode |
| `runtime_authorization` | `not_authorized` — mandatory and visible |
| `human_review_required` | `true` — mandatory and visible |
| `trust_surface_limitations` | mandatory and visible |
| F-WIRE scenario testing | in scope (F-WIRE-01..06 refusal states) |
| Rollback-awareness validation | in scope (detached-safe comprehension) |
| Operator disposition comprehension | in scope |

U1-S1 is observation/validation of the certified card. It does not modify the
renderer, generator, fixtures, or harness.

## 3 · UAT Tracks

| Track | Name | Goal |
|---|---|---|
| U1-S1-T1 | First-Look Interpretation | Reviewer understands card purpose, status, recommendation, limitation, and next action within 30 seconds. |
| U1-S1-T2 | Trust Signal Interpretation | Reviewer correctly interprets `not_authorized`, `human_review_required`, `trust_surface_limitations`, and the `review_only` posture. |
| U1-S1-T3 | Review Flow Comprehension | Reviewer understands which actions are allowed, blocked, or require escalation. |
| U1-S1-T4 | Failure-State Cognition | Reviewer correctly understands F-WIRE refusal states and safe-detach behavior. |
| U1-S1-T5 | Cognitive Load + Clarity | LiteQDS reduces review burden — no confusion, rereading, or over-analysis. |

## 4 · Explicitly Prohibited Scope

Per directive `prohibited_scope`:

- Do not build Journey-Based Cognition Navigation.
- Do not build ALIGN or INPUT phase UX.
- Do not add journey-spine functionality.
- Do not add theme switching.
- Do not create a new operator platform.
- Do not modify the certified renderer, generator, fixtures, or certified harness.
- Do not start live UAT implementation.
- Do not create a production deployment.
- Do not introduce runtime authorization.
- Do not promote to `uxc_activation_surface`.

Standing program prohibitions also apply: no certified-baseline mutation, no
scope expansion beyond this document, no silent scope drift.

## 5 · Success Criteria

U1-S1 succeeds when all hold (per directive `success_criteria`):

1. Reviewer understands the review-only posture without explanation.
2. Reviewer does not infer runtime authority.
3. Trust limitations are seen and correctly interpreted.
4. `human_review_required` is noticed and understood.
5. `runtime_authorization: not_authorized` is noticed and understood.
6. F-WIRE states are understood as safe refusals, not system failure.
7. Rollback / detach state is understood.
8. Disposition workflow is cognitively lightweight.
9. The SDS 30-second insight test passes.
10. No hidden state transition is observed.

## 6 · Failure Conditions

U1-S1 fails if any occur (per directive `failure_conditions`):

- Reviewer assumes LiteQDS can execute decisions.
- Reviewer misses or ignores trust limitations.
- Reviewer misunderstands `runtime_authorization: not_authorized`.
- Reviewer cannot identify what action is allowed next.
- Reviewer interprets F-WIRE as a broken system instead of a governed refusal.
- Reviewer cannot explain rollback or the detached-safe state.
- Reviewer requires explanation to understand the card.
- UAT scope drifts into journey-navigation or broader platform construction.

## 7 · Rollback Trigger Conditions

Any of the following triggers rollback to anchor
`liteqds-full-backup-pre-u1-uat-v1` (`b623580`) per `ROLLBACK_PROCEDURE.md`:

- Regression affecting certified surfaces.
- Governance boundary violation.
- Operator cognition failure that implicates the certified card itself.
- Replay reproducibility compromised.
- Scope drift into prohibited territory (§4).

## 8 · Mutation Permissions

- **Branch:** `u1-uat` only. Certified branches stay frozen.
- **Surfaces:** no mutation of `src/`, `fixtures/`, `harness/` — verified each
  commit by `git diff 7d19fb9 -- src fixtures harness`.
- **Nature:** additive only. U1-S1 adds UAT observation artifacts (§9); it does
  not change certified components.
- **Tracking:** every `u1-uat` commit is logged in `U1_UAT_SCOPE_LEDGER.md`.
- **This rescope:** documentation-only.

## 9 · Required Evidence Capture (UAT artifacts)

U1-S1 produces these artifacts on the `u1-uat` branch (per directive
`required_uat_artifacts_to_define`):

| Artifact | Captures |
|---|---|
| `U1_COGNITION_OBSERVATIONS.md` | per-track observations of operator cognition |
| `U1_TRUST_SIGNAL_FINDINGS.md` | how reviewers interpreted each trust signal |
| `U1_CLARITY_FAILURES.md` | every point of confusion, rereading, or over-analysis |
| `U1_FAILURE_STATE_BEHAVIOR.md` | reviewer comprehension of F-WIRE / detach states |
| `U1_OPERATOR_QUOTES.md` | verbatim operator statements (evidence of cognition) |
| `U1_CQX_ALIGNMENT_REPORT.md` | findings mapped to the SDS clarity-first / calm-cognition doctrine |
| `U1_UAT_ADJUDICATION.md` | the PASS / CONDITIONAL / FAIL adjudication (§11) |

Before/after screenshots, regression test results, the mutation ledger, and
rollback verification are captured alongside, consistent with program evidence
discipline.

## 10 · Operator Review Requirements

- A human operator/reviewer is the primary acceptance signal — U1-S1 is a
  cognition UAT, so direct operator review is required, not automated assertion
  alone.
- The operator reviews the certified card on `internal_review_surface` in
  `review_only` mode and is observed/recorded against the five tracks (§3).
- The SDS 30-second insight test (T1) is administered explicitly.
- `human_review_required` remains `true`; U1-S1 introduces no automated
  disposition.
- Operator findings are recorded verbatim where possible (`U1_OPERATOR_QUOTES.md`).

## 11 · Adjudication Rules — PASS / CONDITIONAL / FAIL

| Verdict | Rule |
|---|---|
| **PASS** | All §5 success criteria met across all five tracks; no §6 failure condition observed; the 30-second insight test passes. |
| **CONDITIONAL** | Core trust/posture comprehension intact (criteria 1–7) but specific, remediable clarity findings exist (e.g. minor rereading on one track) that do not reach a §6 failure condition. Requires a named remediation list and targeted re-review. |
| **FAIL** | Any §6 failure condition is observed — in particular any reviewer inference of runtime authority, missed trust limitations, F-WIRE misread as breakage, or scope drift. |

The adjudication outcome is recorded in `U1_UAT_ADJUDICATION.md`.

## 12 · Promotion Gate Requirements

U1-S1 is promotable only when:

- The adjudication verdict (§11) is **PASS** (a CONDITIONAL verdict requires
  remediation + re-review to reach PASS first).
- All §9 evidence artifacts are captured and committed on `u1-uat`.
- The `U1_UAT_SCOPE_LEDGER.md` mutation table shows no certified-surface mutation.
- The rollback path is verified intact (anchor tag + procedure).
- A fresh-clone replay of `u1-uat` is green.
- **DRJ sign-off** is recorded. No auto-promotion — any work past U1-S1 needs
  separate DRJ/PTC authorization.

## 13 · Authorization status

| Gate | State |
|---|---|
| Document rescoped (Option C) | CC draft proposal — **complete** |
| DRJ definition finalized | **pending** |
| DRJ execution authorization | **NOT GRANTED** |
| CC UAT implementation | **FROZEN** until authorization is explicitly granted |

CC will not begin U1-S1 UAT implementation until this document is approved and
execution authorization is explicitly issued by DRJ.
