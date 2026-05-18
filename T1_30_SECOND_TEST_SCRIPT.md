# T1 · 30-Second First-Look Test Script

**UAT track:** U1-S1-T1 — First-Look Interpretation
**Used by:** Facilitator only · read verbatim
**Status:** instrumentation — no operator data recorded in this file

> This is the exact script the facilitator reads aloud. The facilitator reads
> **only** the bracketed scripted lines. Everything outside `«…»` is an
> instruction to the facilitator and is **not** read aloud. The facilitator
> gives no explanation, no hints, no leading questions, and never confirms or
> corrects a reviewer answer during the session.

## 0 · Pre-conditions (facilitator checks silently)

- [ ] Reviewer has completed `T1_REVIEWER_INTAKE.md`.
- [ ] Reviewer has heard the neutral briefing from `T1_OPERATOR_PACKET.md` §2.
- [ ] The primary valid card is loaded and **hidden** (screen covered / tab not
      yet shown): `http://localhost:4319/?flag=on&fixture=qds-learn`.
- [ ] Observer is ready with `T1_OBSERVATION_CAPTURE_FORM.md` and a timer.
- [ ] Reviewer has seen no other T1 document.

## 1 · Scripted lines — timed first look

Read exactly:

> «In a moment I am going to show you a single screen. Please look at it the way
> you would if it appeared in front of you during normal work. You do not need
> to do anything — just look. I will not explain it, and I cannot answer
> questions about it during this part. Tell me out loud when you feel you have
> got your bearings. Ready?»

Wait for the reviewer to confirm ready. Then reveal the screen and **start the
timer**. Read exactly:

> «Take a look.»

**Observer:** start `time_to_orientation` on the word "look". Stop it when the
reviewer first says, unprompted, that they have their bearings (or makes a
clear equivalent statement). Record hesitation, reread, and any spoken reaction
in `T1_OBSERVATION_CAPTURE_FORM.md`.

At **30 seconds elapsed**, read exactly:

> «That is thirty seconds. You can keep looking if you like.»

Do **not** stop the reviewer at 30 seconds. The 30-second mark is a recorded
checkpoint, not a cutoff. Note whether orientation occurred before or after it.

When the reviewer indicates they are oriented (or clearly stalls), read exactly:

> «Thank you. I am going to ask you a few short questions about what you are
> looking at. Answer in your own words. There are no wrong answers, and I will
> not tell you whether an answer is right or wrong.»

Proceed to §2.

## 2 · The seven T1 questions

Ask each question once, verbatim, in order. The reviewer may keep looking at
the card. Record verbatim answers in `T1_OBSERVATION_CAPTURE_FORM.md`. Do not
rephrase a question unless the reviewer asks you to repeat it — if so, repeat
it identically.

| # | Question (read verbatim) |
|---|---|
| Q1 | «In one sentence, what is this screen telling you?» |
| Q2 | «Is the thing shown here passing, failing, or something else? What makes you say that?» |
| Q3 | «Who or what produced this result — and is it final?» |
| Q4 | «Is there anything here you are expected to act on right now? If so, what?» |
| Q5 | «Is this screen something you can change, or only something you can look at? What tells you that?» |
| Q6 | «If you saw this during normal work, would you trust it? Why or why not?» |
| Q7 | «Is there anything on this screen you do not understand, or that you would want explained?» |

After Q7, read exactly:

> «Thank you. That is the end of this part.»

Proceed to the F-WIRE check (`T1_OPERATOR_SESSION_PROTOCOL.md` §5 step 5) or to
the variation looks if the cohort schedule includes them.

## 3 · F-WIRE refusal check (scripted)

Load the F-WIRE refusal surface — `http://localhost:4319/?flag=on&variant=malformed`
— and reveal it. Read exactly:

> «Here is a different screen. Is this a system failure, or something else? And
> what would you do if you saw it?»

Record the verbatim answer. Do not explain F-WIRE. This question bears directly
on the `failure_state_interpretation` observation dimension and on the success
criterion that a governed refusal is read as governed, not as a malfunction.

## 4 · Facilitator integrity reminders

- Read scripted text only. Never paraphrase the card's meaning.
- Never confirm or correct an answer during the session.
- If the reviewer asks for help understanding the card, record it as an
  observation (it bears on the "requires external clarification" failure
  condition) and say only: «I am not able to explain it — just tell me what you
  make of it.»
- Silence is data. Do not fill pauses.
