# T1 · Adjudication Matrix

**UAT track:** U1-S1-T1 — First-Look Interpretation
**Status:** instrumentation — adjudication **logic** only; **no verdict issued**
**Branch:** `u1-uat`

> This document defines the logic by which T1 evidence is judged PASS /
> CONDITIONAL / FAIL. It does **not** issue a verdict. Per directive
> `U1_S1_T1_OPERATOR_EVIDENCE_PROTOCOL` (Option 1), CC prepares — but does not
> pre-decide — adjudication. No final T1 adjudication is issued before reviewer
> sessions exist. The verdict column stays empty until DRJ/PTC adjudicate on
> normalized evidence (`T1_EVIDENCE_NORMALIZATION.md`).

## 1 · What T1 is judging

Whether an operator can correctly interpret the certified LiteQDS Qualification
Card **within 30 seconds, without explanation**, and correctly read a F-WIRE
refusal as a governed refusal rather than a malfunction.

## 2 · Success criteria (S1–S7)

Adjudication is evaluated against the seven T1 success criteria. Each maps to
evidence from normalization.

| ID | Success criterion | Primary evidence |
|---|---|---|
| S1 | Operator orients within 30 seconds without explanation | `time_to_orientation`; oriented-before-checkpoint flag |
| S2 | Operator correctly states what the card is telling them | Q1 verbatim; `misinterpretation_frequency` |
| S3 | Operator correctly reads pass/fail/qualification status | Q2 verbatim |
| S4 | Operator correctly identifies the result's source and finality | Q3 verbatim; `perceived_authority_level` |
| S5 | Operator correctly reads the card as review-only, not editable | Q5 verbatim; `review_only_comprehension` |
| S6 | Operator notices the governance/trust signals | Q6 verbatim; `trust_signal_visibility` |
| S7 | Operator reads a F-WIRE refusal as a governed refusal, not a malfunction | F-WIRE verbatim; `failure_state_interpretation` |

## 3 · Failure conditions (F1–F7)

Any of the following, observed across the cohort, weighs against a PASS.

| ID | Failure condition | Detected by |
|---|---|---|
| F1 | Operator cannot orient within 30 seconds | `time_to_orientation` > 30 s; stall flag |
| F2 | Operator misinterprets what the card is telling them | wrong Q1/Q2 answers; `misinterpretation_frequency` |
| F3 | Operator requires external clarification to interpret the card | observation §F clarification requests |
| F4 | Operator misreads the result's authority or finality | wrong Q3 answer |
| F5 | Operator thinks the card is editable / a runtime control | wrong Q5 answer; `review_only_comprehension` = no |
| F6 | Operator misses the governance/trust signals entirely | `trust_signal_visibility` = no |
| F7 | Operator reads a F-WIRE governed refusal as a malfunction | `failure_state_interpretation` = malfunction |

## 4 · Adjudication bands

The verdict is one of three. Bands are assessed **per criterion** and then
**overall**. CC records the logic; DRJ/PTC apply it to evidence.

| Band | Per-criterion meaning | Overall rule |
|---|---|---|
| **PASS** | criterion met by the clear majority of the cohort with no failure-condition trigger | all of S1–S7 at PASS, no F-condition recurring across reviewers |
| **CONDITIONAL** | criterion met but with a recorded weakness (hesitation, reread, single misinterpretation, prompted signal visibility) | one or more criteria CONDITIONAL, none at FAIL — remediation note required |
| **FAIL** | criterion not met, or a failure condition recurs across the cohort | any criterion at FAIL |

A criterion with **insufficient admissible evidence** (cohort below minimum,
missing mix, bias-control unmet) is recorded as **NOT ADJUDICABLE** — never
defaulted to PASS or FAIL.

## 5 · Adjudication table (empty until evidence + DRJ/PTC ruling)

| ID | Criterion | Cohort evidence summary | Verdict | Notes |
|---|---|---|---|---|
| S1 | 30-second orientation | _(pending)_ | _(pending)_ | |
| S2 | States card meaning correctly | _(pending)_ | _(pending)_ | |
| S3 | Reads pass/fail status correctly | _(pending)_ | _(pending)_ | |
| S4 | Identifies source + finality | _(pending)_ | _(pending)_ | |
| S5 | Reads card as review-only | _(pending)_ | _(pending)_ | |
| S6 | Notices trust/governance signals | _(pending)_ | _(pending)_ | |
| S7 | Reads F-WIRE as governed refusal | _(pending)_ | _(pending)_ | |
| — | **Overall T1 verdict** | _(pending)_ | _(pending)_ | |

## 6 · Adjudication procedure

1. Confirm `T1_EVIDENCE_NORMALIZATION.md` admissibility check passed.
2. For each criterion S1–S7, populate the cohort evidence summary from the
   normalized findings — verbatim/observed values only.
3. DRJ/PTC assign each criterion a band per §4. CC does not assign verdicts.
4. Derive the overall verdict by the §4 overall rule.
5. CONDITIONAL or FAIL criteria carry a remediation note into
   `U1_UAT_ADJUDICATION.md`.
6. The completed matrix and `U1_UAT_ADJUDICATION.md` are the T1 adjudication
   record.

## 7 · Integrity constraints

- No verdict is entered before reviewer sessions exist and evidence is
  normalized.
- CC populates evidence summaries; **DRJ/PTC assign bands and the overall
  verdict**.
- Automated test results (Vitest/Playwright) are not admissible as cognition
  evidence and never substitute for a session.
- A thin or contradictory cohort yields NOT ADJUDICABLE criteria, not a
  manufactured verdict.

## 8 · Governance

`review_only` · `runtime_authorization: not_authorized` ·
`human_review_required: true`. Certified surfaces untouched. Adjudication logic
only — no T1 outcome is decided by this document.
