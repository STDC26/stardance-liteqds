# U1 UAT Scope Ledger

**Per:** DRJ directive `Certified Recovery State Governance v1.0` — phase 3
**Branch:** `u1-uat` · **Origin:** `xas-controlled-integration` @ `b623580`

The ledger of record for U1 UAT scope and for every mutation made on the
`u1-uat` branch. It is updated as U1 UAT work is defined and performed.

## Status

U1 UAT **implementation is not yet authorized**. The current directive
authorized only: (1) creating the `u1-uat` branch, and (2) preparing UAT
governance. This ledger therefore establishes scope *boundaries* and the
*tracking structure*; concrete UAT scope items are added once U1 UAT is
defined and authorized.

## Scope boundaries

### In scope (once U1 UAT is authorized)

- UAT validation activities performed on the `u1-uat` branch.
- Additive UAT artifacts (test plans, UAT fixtures-of-reference, UAT harness
  wrappers) that do not modify certified surfaces.
- Operator/reviewer-facing UAT of the already-certified, review-only behavior.

### Out of scope (zero tolerance)

- Production deployment.
- Live runtime activation / runtime authorization.
- Live XAS integration / live attach.
- Modification of certified surfaces (`src/`, `fixtures/`, `harness/`).
- Modification of certified branches or the rollback anchor tag.
- `uxc_activation_surface` progression.
- Proto-QDS activation.
- Any scope expansion beyond an authorized U1 UAT definition.

## Scope item ledger

Concrete U1 UAT scope items are recorded here once defined. Each item:
in/out of scope, status, authorizing directive.

| ID | Scope item | In/Out | Status | Authorized by |
|----|------------|--------|--------|---------------|
| U1-S1 | Qualification Card Operator Trust + Review Flow UAT (certified card, `internal_review_surface`, `review_only`) | IN | DEFINED — proposal pending DRJ approval + execution authorization | PTC `U1_UAT_SCOPE_REMEDIATION` (Option C) |
| — | Journey-navigation / ALIGN / INPUT / theme-switching / cognition-platform | OUT | Rejected — Options A & B rejected; removed from scope | PTC `U1_UAT_SCOPE_REMEDIATION` |

## Mutation tracking

Every commit on `u1-uat` is logged here. Each row confirms no certified
surface was modified (verified by `git diff 7d19fb9 -- src fixtures harness`).

| Commit | Summary | Files touched | Certified surface touched? |
|--------|---------|---------------|----------------------------|
| `97955bd` | U1 UAT branch governance preparation (4 governance docs) | `CERTIFIED_RECOVERY_STATE.md`, `U1_UAT_SCOPE_LEDGER.md`, `U1_UAT_BRANCH_GOVERNANCE.md`, `ROLLBACK_PROCEDURE.md` | NO |
| `a549c69` | U1 UAT scope definition — CC draft proposal (governance doc only; no implementation) | `U1_UAT_SCOPE_DEFINITION.md`, `U1_UAT_SCOPE_LEDGER.md` | NO |
| (this commit) | U1-S1 scope remediation — rescope to LiteQDS Qualification Card UAT per PTC Option C; journey-navigation / ALIGN-INPUT / theme-switching language removed. Documentation-only; certified baseline untouched. | `U1_UAT_SCOPE_DEFINITION.md`, `U1_UAT_SCOPE_LEDGER.md` | NO |

## Replay / rollback references

- Branch replay validation: `U1_UAT_BRANCH_GOVERNANCE.md`.
- Rollback procedure: `ROLLBACK_PROCEDURE.md`.
- Certified recovery checkpoint: `CERTIFIED_RECOVERY_STATE.md`.
