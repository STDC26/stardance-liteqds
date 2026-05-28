# T1 Operator Session Protocol

**UAT track:** U1-S1-T1 — First-Look Interpretation
**Per:** PTC directive `U1_S1_T1_OPERATOR_EVIDENCE_PROTOCOL` (Option 1)
**Status:** instrumentation — ready for DRJ-supplied reviewers
**Branch:** `u1-uat`

> CC-prepared instrumentation. CC does not run sessions and does not supply
> reviewers. DRJ supplies the reviewer cohort and executes sessions; CC
> normalizes the resulting evidence (`T1_EVIDENCE_NORMALIZATION.md`) and
> prepares — but does not pre-decide — adjudication (`T1_ADJUDICATION_MATRIX.md`).

## 1 · Objective

Validate whether an operator can correctly interpret the certified LiteQDS
Qualification Card **within 30 seconds, without explanation** — and correctly
read a F-WIRE refusal as a governed refusal, not a malfunction.

## 2 · Reviewer cohort

| Requirement | Value |
|---|---|
| Minimum reviewers | 3 |
| Recommended reviewers | 5 |
| Required mix | operator-minded reviewer · technical reviewer · non-author reviewer |
| Mandatory constraint | at least one reviewer unfamiliar with LiteQDS internals (bias control) |

Each reviewer is identified in evidence by an anonymous id only (`R1`, `R2`,
…). Reviewer background is captured in `T1_REVIEWER_INTAKE.md`.

## 3 · Environment

The card is shown on the certified `internal_review_surface` staging harness —
no new surface is built.

```bash
npm install
npx playwright install chromium
npm run integration:preview        # serves the harness at http://localhost:4319
```

Stimuli (review_only; runtime not authorized):

| Stimulus | URL |
|---|---|
| Valid Qualification Card (primary) | `http://localhost:4319/?flag=on&fixture=qds-learn` |
| Valid card — variation A | `http://localhost:4319/?flag=on&fixture=qds-mo` |
| Valid card — variation B | `http://localhost:4319/?flag=on&fixture=qds-signal` |
| F-WIRE refusal surface | `http://localhost:4319/?flag=on&variant=malformed` |

## 4 · Roles

- **Reviewer** — the human operator under observation. Does not see this
  protocol or any LiteQDS internals beforehand.
- **Facilitator** — administers the session. Reads only the
  `T1_30_SECOND_TEST_SCRIPT.md` verbatim. **Gives no explanation, no hints, no
  leading questions.**
- **Observer** — records into `T1_OBSERVATION_CAPTURE_FORM.md`. May be the
  facilitator if recording does not disrupt timing.

## 5 · Session flow (per reviewer, ~15 minutes)

1. **Intake** — reviewer completes `T1_REVIEWER_INTAKE.md`.
2. **Briefing** — facilitator reads the neutral briefing from
   `T1_OPERATOR_PACKET.md` only. No card explanation.
3. **30-second first look** — facilitator runs the timed exercise per
   `T1_30_SECOND_TEST_SCRIPT.md` on the primary valid card. Observer records
   time-to-orientation and behavior.
4. **Seven questions** — facilitator asks the seven T1 questions; reviewer
   answers in their own words. Verbatim answers recorded.
5. **F-WIRE check** — reviewer is shown the F-WIRE refusal surface and asked:
   "Is this a system failure, or something else? What would you do?"
6. **Variation looks (optional)** — repeat the 30-second look on variation A/B
   if cohort time allows.
7. **Debrief** — reviewer free comments; any reread/hesitation noted.

## 6 · Facilitator rules (integrity)

- Read scripted text only; never paraphrase the card's meaning.
- Never confirm or correct a reviewer answer during the session.
- If a reviewer asks for help, record it as an observation (it bears on the
  "requires external clarification" failure condition) and decline to explain.
- Do not show the reviewer any other T1 document.

## 7 · Output

Each session yields one completed `T1_REVIEWER_INTAKE.md` and one completed
`T1_OBSERVATION_CAPTURE_FORM.md`. These raw artifacts feed
`T1_EVIDENCE_NORMALIZATION.md`, which produces the governance-safe findings
(`U1_COGNITION_OBSERVATIONS.md`, `U1_TRUST_SIGNAL_FINDINGS.md`,
`U1_CLARITY_FAILURES.md`, `U1_OPERATOR_QUOTES.md`) and the adjudication input
(`U1_UAT_ADJUDICATION.md`).

## 8 · Governance

`review_only` throughout · `runtime_authorization: not_authorized` ·
`human_review_required: true`. No certified surface is modified. The session
observes the certified card; it does not change it.
