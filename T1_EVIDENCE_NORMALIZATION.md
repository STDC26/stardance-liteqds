# T1 · Evidence Normalization

**UAT track:** U1-S1-T1 — First-Look Interpretation
**Status:** instrumentation — normalization method only; **no evidence present**
**Branch:** `u1-uat`

> This document defines **how** raw T1 session evidence is turned into
> governance-safe findings. It does **not** contain evidence. It is run by CC
> **only after** DRJ supplies the reviewer cohort and the sessions have been
> executed. Until then every results table below is empty by construction.
>
> Per directive `U1_S1_T1_OPERATOR_EVIDENCE_PROTOCOL` (Option 1): CC normalizes
> evidence; CC does not run sessions, does not supply reviewers, and does not
> fabricate observations, quotes, hesitation data, reread behavior, or PASS
> outcomes.

## 1 · Inputs

Normalization consumes only completed raw artifacts:

| Input | One per | Source |
|---|---|---|
| `T1_REVIEWER_INTAKE.md` | reviewer | facilitator/observer at session time |
| `T1_OBSERVATION_CAPTURE_FORM.md` | reviewer | observer during/after session |

No other input is admissible. Automated test results are **not** evidence of
human comprehension and are never substituted for a session artifact.

## 2 · Pre-normalization admissibility check

Before any finding is derived, CC verifies the raw set:

- [ ] At least 3 completed reviewer artifact pairs exist (cohort minimum).
- [ ] The cohort mix is present: operator-minded · technical · non-author.
- [ ] At least one reviewer marked **None** for LiteQDS-internals familiarity
      (bias control, `T1_REVIEWER_INTAKE.md` §C).
- [ ] Each observation form is internally complete (no missing timed-look or
      verbatim-answer fields).

If any check fails, normalization **halts** and the gap is reported as an open
dependency — no findings are produced from an inadmissible set.

## 3 · Normalization procedure

1. **Transcribe, do not interpret.** Copy verbatim answers and observed values
   exactly as recorded. No paraphrase, no inference of intent.
2. **Per-dimension roll-up.** For each of the 10 observation dimensions,
   tabulate the recorded values across reviewers (§4).
3. **Anonymity scrub.** Confirm every reference is `R1`, `R2`, … — strip any
   name, role detail, or identifier that could de-anonymize a reviewer.
4. **Quote selection.** Carry only verbatim reviewer statements into
   `U1_OPERATOR_QUOTES.md`. No CC-authored quotes. Mark each quote with its
   reviewer id and the question/step it answered.
5. **Clarity-failure extraction.** Every recorded request-for-clarification and
   every misinterpretation becomes a row in `U1_CLARITY_FAILURES.md`.
6. **No verdict here.** Normalization produces findings, not a PASS/FAIL.
   Adjudication is `T1_ADJUDICATION_MATRIX.md`.

## 4 · Per-dimension roll-up (empty until evidence exists)

| # | Dimension | Roll-up across cohort |
|---|---|---|
| 1 | `time_to_orientation` | _(pending sessions)_ |
| 2 | `hesitation_behavior` | _(pending sessions)_ |
| 3 | `reread_behavior` | _(pending sessions)_ |
| 4 | `misinterpretation_frequency` | _(pending sessions)_ |
| 5 | `trust_signal_visibility` | _(pending sessions)_ |
| 6 | `review_only_comprehension` | _(pending sessions)_ |
| 7 | `next_action_clarity` | _(pending sessions)_ |
| 8 | `failure_state_interpretation` | _(pending sessions)_ |
| 9 | `perceived_authority_level` | _(pending sessions)_ |
| 10 | `cognitive_load` | _(pending sessions)_ |

## 5 · Outputs

Normalization produces these governance-safe findings documents. Each is
created **only** when admissible evidence exists; none is created speculatively.

| Output | Content | Derived from |
|---|---|---|
| `U1_COGNITION_OBSERVATIONS.md` | per-dimension findings across the cohort | §4 roll-up |
| `U1_TRUST_SIGNAL_FINDINGS.md` | how reviewers read governance/trust signals | dims 5, 8, 9 |
| `U1_CLARITY_FAILURES.md` | misinterpretations + clarification requests | observation §F, dim 4 |
| `U1_OPERATOR_QUOTES.md` | verbatim reviewer quotes, anonymized | observation §D, §E, §H |
| `U1_UAT_ADJUDICATION.md` | adjudication input — findings mapped to T1 criteria | all of the above + the matrix |

## 6 · Integrity constraints

- Findings contain only what reviewers said or did. Nothing is invented,
  extrapolated, averaged into existence, or smoothed.
- A small or imperfect cohort is reported as-is; CC does not backfill to reach
  a target n.
- If evidence is thin or contradictory, the finding records that — it is not
  resolved in CC's favor or against it.
- CC does not issue the T1 verdict. CC prepares the adjudication input; DRJ/PTC
  adjudicate.

## 7 · Governance

`review_only` · `runtime_authorization: not_authorized` ·
`human_review_required: true`. Certified surfaces untouched. This document is
method only until DRJ supplies the reviewer cohort.
