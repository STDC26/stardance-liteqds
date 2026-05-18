# T1 · Operator Packet

**UAT track:** U1-S1-T1 — First-Look Interpretation
**Audience:** the reviewer (human operator under observation)
**Status:** instrumentation — reviewer-facing

> This is the **only** T1 document a reviewer sees, and they see only §1–§2 of
> it, read by the facilitator. It contains the neutral briefing and nothing
> that explains, primes, or interprets the Qualification Card. The rest of the
> packet (§3 onward) is facilitator reference and is not shown to the reviewer.

## 1 · What this is (read to the reviewer)

> «Thank you for helping with this review. We are checking whether a screen we
> have built makes sense to someone seeing it for the first time. You are here
> as a fresh pair of eyes. There is nothing to prepare and nothing to study.»

## 2 · Neutral briefing (read to the reviewer, verbatim)

> «In a few minutes I will show you one screen. I will ask you to look at it and
> then answer a few short questions about what you make of it. I will not
> explain the screen, and during the looking part I cannot answer questions
> about it. There are no wrong answers — we are testing the screen, not you. If
> at any point you want to stop, just say so. Do you have any questions before
> we begin? (Answer only logistics questions — nothing about the screen.)»

That is the entire briefing. The facilitator must not add context, purpose,
terminology, or expectations about the card.

## 3 · Facilitator reference — session at a glance

Not read to the reviewer. Full procedure is in `T1_OPERATOR_SESSION_PROTOCOL.md`.

| Step | Document | Notes |
|---|---|---|
| Intake | `T1_REVIEWER_INTAKE.md` | before any card is shown |
| Briefing | this packet §1–§2 | verbatim, no additions |
| 30-second first look | `T1_30_SECOND_TEST_SCRIPT.md` §1 | observer times orientation |
| Seven questions | `T1_30_SECOND_TEST_SCRIPT.md` §2 | verbatim answers recorded |
| F-WIRE check | `T1_30_SECOND_TEST_SCRIPT.md` §3 | governed-refusal reading |
| Variation looks (optional) | `T1_30_SECOND_TEST_SCRIPT.md` | if schedule allows |
| Debrief | `T1_OBSERVATION_CAPTURE_FORM.md` §H | free comments |

## 4 · Facilitator reference — stimuli

Served by the certified `internal_review_surface` staging harness
(`npm run integration:preview` → http://localhost:4319). `review_only`;
runtime not authorized.

| Stimulus | URL | Use |
|---|---|---|
| Valid Qualification Card (primary) | `?flag=on&fixture=qds-learn` | first look + seven questions |
| Valid card — variation A | `?flag=on&fixture=qds-mo` | optional variation look |
| Valid card — variation B | `?flag=on&fixture=qds-signal` | optional variation look |
| F-WIRE refusal surface | `?flag=on&variant=malformed` | F-WIRE check |

## 5 · Facilitator reference — integrity rules

- Read scripted text only; never paraphrase the card's meaning.
- Never confirm or correct a reviewer answer during the session.
- A request for help is an observation, not a prompt for explanation — record
  it and decline to explain.
- Show the reviewer no other T1 document.
- The session observes the certified card; it does not change it. `review_only`
  throughout · `runtime_authorization: not_authorized` ·
  `human_review_required: true`.

## 6 · What the reviewer does not receive

For the record: the reviewer does **not** see the session protocol, the
observation form, the evidence-normalization document, the adjudication matrix,
the seven success criteria, the failure conditions, or any LiteQDS internal
documentation. First-look validity depends on the reviewer being genuinely
unprimed.
