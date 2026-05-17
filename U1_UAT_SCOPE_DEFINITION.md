# U1 UAT Scope Definition

**Status:** DRAFT — **CC PROPOSAL**, pending DRJ definition and approval
**Per:** DRJ directive `U1 UAT Scope Definition & Controlled Execution Authorization v1.0`
**Branch:** `u1-uat` @ origin `b623580` (from `xas-controlled-integration`)
**UAT slice:** `U1-S1` — Navigation + Operator Cognition Validation

> This document is a **proposal drafted by CC** for DRJ review. It is **not an
> authorization.** Per the directive: definition (steps 1–5) and execution
> authorization (step 6) remain with DRJ. CC will not begin any implementation
> work until DRJ approves this document **and** explicitly grants execution
> authorization. See §11 (Authorization status).

---

## 1 · Purpose

Define and constrain the first controlled U1 UAT execution slice — `U1-S1` —
so that navigation and operator-cognition behavior can be validated before any
deeper runtime, platform, or architecture work proceeds. Per PTC's
recommendation: validate the smallest controlled slice (cognition + navigation)
first, because it is the highest-leverage validation point and operational
trust must be established before runtime complexity expands.

## 2 · Authorized Surface Scope

`U1-S1 — Navigation + Operator Cognition Validation.` Objective: validate
Journey-Based Cognition Navigation and operator cognition flow.

Authorized scope items (per directive `recommended_first_uat_slice`):

1. Journey-Based Cognition Navigation
2. P0 ALIGN journey preview
3. Question-led progression
4. P1 INPUT operational flow
5. Theme switching
6. Quiet/calm UXC compliance
7. Journey spine visibility
8. Operator cognition continuity

### Drafting note — scope coherence (requires DRJ resolution before approval)

The eight authorized-scope items above describe a **navigation / operator-
cognition UX surface** (journey spine, P0 ALIGN / P1 INPUT phases, question-led
progression, theme switching). The current `u1-uat` branch lives in the
`stardance-liteqds` repository, whose contents are the LiteQDS Panel Generator,
the certified Render Harness (qualification-card rendering), and the XAS
integration scaffolding — **none of which contain a journey-navigation or
ALIGN/INPUT-phase surface.**

Before this scope can be approved and authorized, DRJ must confirm **the target
of U1-S1**:
- (a) the target surface lives in a **different repository** (e.g. a Docente /
  UXC frontend), and `u1-uat` should be created there instead; or
- (b) U1-S1 is to **build** the navigation surface within `stardance-liteqds`
  (this would be implementation, not UAT validation — and would need its own
  scope and authorization); or
- (c) U1-S1 should be **re-scoped** to validation of an artifact that actually
  exists in `stardance-liteqds` (e.g. the certified Qualification Card render
  and its operator-cognition / trust-signal behavior on `internal_review_surface`).

CC recommends DRJ resolve this before approval — proceeding without it risks
silent scope drift, a zero-tolerance condition.

## 3 · Explicitly Prohibited Scope

Per directive `explicitly_prohibited_scope`:

- Backend architecture expansion
- Production deployment
- Live runtime activation
- Autonomous orchestration
- Multi-operator scaling
- Ontology expansion
- Connector expansion
- Runtime optimization
- Infrastructure scaling

Plus the standing program prohibitions: no certified-baseline mutation, no
modification of certified surfaces (`src/`, `fixtures/`, `harness/`), no
modification of certified branches or the rollback anchor tag, no
`uxc_activation_surface` progression, no Proto-QDS activation, no scope
expansion beyond this document.

## 4 · Success Criteria

U1-S1 succeeds when all hold (per directive `success_criteria`):

1. Operator understands the full workflow at a glance.
2. Journey progression is cognitively clear.
3. No dashboard-theater regression.
4. UX remains quiet and calm.
5. Question-led progression is functioning.
6. Theme switching is operational.
7. No certified baseline mutation.
8. Rollback path preserved.

## 5 · Failure Conditions

U1-S1 fails if any occur (per directive `failure_conditions`):

- Navigation confusion persists.
- Workflow progression unclear.
- Dashboard density returns.
- Cognitive fragmentation introduced.
- Certified baseline mutated.
- Unauthorized scope expansion.
- UAT branch contamination.
- Rollback path compromised.

## 6 · Rollback Trigger Conditions

Any of the following triggers immediate rollback to anchor
`liteqds-full-backup-pre-u1-uat-v1` (`b623580`) per `ROLLBACK_PROCEDURE.md`:

- Regression affecting certified surfaces.
- Governance boundary violation.
- Navigation architecture degradation.
- Operator cognition failure.
- Replay reproducibility compromised.

## 7 · Mutation Permissions

- **Branch:** mutations permitted on `u1-uat` only. Certified branches
  (`rebuild/liteqds-g1-recovery-v1`, `xas-controlled-integration`) are frozen.
- **Surfaces:** no mutation of certified surfaces (`src/`, `fixtures/`,
  `harness/`). Verified each commit by `git diff 7d19fb9 -- src fixtures harness`.
- **Nature:** additive only — U1-S1 adds UAT artifacts; it does not rewrite
  certified components.
- **Tracking:** every `u1-uat` commit is logged in the
  `U1_UAT_SCOPE_LEDGER.md` mutation table (commit, summary, files,
  certified-surface-touched = NO).
- **Concrete mutation set:** TBD — pending the §2 scope-coherence resolution.

## 8 · Required Evidence Capture

Mandatory (per directive `required_evidence_capture`):

- Before/after screenshots
- Journey cognition validation
- Operator flow continuity
- Navigation comprehension validation
- Theme behavior validation
- Regression test results
- Mutation ledger
- Rollback verification

Evidence is captured to a `u1-uat`-branch evidence directory and manifested,
consistent with the program's evidence-continuity discipline.

## 9 · Operator Review Requirements

- A human operator/reviewer validates U1-S1 directly — the slice is about
  operator cognition, so operator review is the primary acceptance signal.
- The operator must confirm success criteria 1, 2, 4, 5 (comprehension,
  clarity, calm, question-led progression) by direct review, not by automated
  assertion alone.
- Operator review outcome is recorded in the evidence capture (§8).
- `human_review_required` remains `true` throughout — U1-S1 does not introduce
  any automated disposition.

## 10 · Promotion Gate Requirements

U1-S1 may be considered passed / promotable only when:

- All §4 success criteria are met.
- No §5 failure condition is present.
- All §8 evidence is captured and manifested.
- The `U1_UAT_SCOPE_LEDGER.md` mutation table is complete and shows no
  certified-surface mutation.
- The rollback path is verified intact (anchor tag + procedure).
- A fresh-clone replay of `u1-uat` is green.
- **DRJ sign-off** is recorded. There is no auto-promotion; promotion past
  U1-S1 (to any further slice, surface, or runtime work) requires a separate
  DRJ/PTC authorization.

## 11 · Authorization status

| Gate | State |
|---|---|
| Document authored | CC draft proposal — **complete** |
| §2 scope-coherence resolved by DRJ | **pending** |
| DRJ definition finalized (steps 1–5) | **pending** |
| DRJ execution authorization (step 6) | **NOT GRANTED** |
| CC implementation | **FROZEN** until authorization is explicitly granted |

CC will not begin U1-S1 implementation until this document is approved and
execution authorization is explicitly issued by DRJ.
