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
| — | (none — U1 UAT not yet defined/authorized) | — | — | — |

## Mutation tracking

Every commit on `u1-uat` is logged here. Each row confirms no certified
surface was modified (verified by `git diff 7d19fb9 -- src fixtures harness`).

| Commit | Summary | Files touched | Certified surface touched? |
|--------|---------|---------------|----------------------------|
| `<this commit>` | U1 UAT branch governance preparation (4 governance docs) | `CERTIFIED_RECOVERY_STATE.md`, `U1_UAT_SCOPE_LEDGER.md`, `U1_UAT_BRANCH_GOVERNANCE.md`, `ROLLBACK_PROCEDURE.md` | NO |

## Replay / rollback references

- Branch replay validation: `U1_UAT_BRANCH_GOVERNANCE.md`.
- Rollback procedure: `ROLLBACK_PROCEDURE.md`.
- Certified recovery checkpoint: `CERTIFIED_RECOVERY_STATE.md`.
