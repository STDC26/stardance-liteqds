# T1 · Reviewer Intake Form

**UAT track:** U1-S1-T1 — First-Look Interpretation
**One completed copy per reviewer.** Filed as raw evidence; feeds
`T1_EVIDENCE_NORMALIZATION.md`.

> Captured **before** the reviewer sees the Qualification Card. Establishes
> reviewer background and the bias-control mix required by
> `T1_OPERATOR_SESSION_PROTOCOL.md` §2. The reviewer is identified by an
> anonymous id only — **no names, no emails, no employee identifiers**.
>
> All fields below are blank by construction. CC does not complete this form.
> It is completed at session time by the facilitator/observer with the
> reviewer.

## A · Identification

| Field | Value |
|---|---|
| Anonymous reviewer id | `R__` |
| Session date | |
| Facilitator | |
| Observer | |

## B · Background (reviewer self-report)

| Field | Value |
|---|---|
| Role / job family (general — e.g. "operations", "engineering") | |
| Years in an operator-facing or review-facing role | |
| Reviewer category (mark one): operator-minded / technical / non-author | |

## C · Familiarity declaration (bias control)

Mark the single best match for each row.

| Question | None | Some | Deep |
|---|---|---|---|
| Familiarity with LiteQDS internals (generator, F-WIRE, fixtures) | ☐ | ☐ | ☐ |
| Familiarity with the Qualification Card surface specifically | ☐ | ☐ | ☐ |
| Involvement in authoring/reviewing LiteQDS or its UAT docs | ☐ | ☐ | ☐ |
| Familiarity with STARDANCE / CORTEX governance language | ☐ | ☐ | ☐ |

**Mandatory cohort constraint:** at least one reviewer in the cohort must mark
**None** for "Familiarity with LiteQDS internals". Confirm at cohort level in
`T1_EVIDENCE_NORMALIZATION.md`, not here.

## D · Author-exclusion check

| Question | Yes | No |
|---|---|---|
| Did this reviewer write or edit any LiteQDS source, fixture, harness, or T1 document? | ☐ | ☐ |

A **Yes** disqualifies the reviewer from the "non-author reviewer" slot. Record
it; do not discard the session — note it as a background fact for normalization.

## E · Consent / conditions

| Field | Value |
|---|---|
| Reviewer understands the session is observed and recorded as anonymous evidence | ☐ confirmed |
| Reviewer understands they may stop at any time | ☐ confirmed |
| Reviewer has seen no T1 document other than this intake form | ☐ confirmed |

## F · Observer notes (optional, pre-session)

Free text — anything about session conditions that may affect interpretation
(environment, interruptions, device). No operator-comprehension data here.

```
(blank)
```
