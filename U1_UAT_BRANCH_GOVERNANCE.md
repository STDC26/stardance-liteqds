# U1 UAT Branch Governance

**Per:** DRJ directive `Certified Recovery State Governance v1.0` — phase 2/3
**Branch:** `u1-uat`

## Branch identity

| Field | Value |
|---|---|
| Branch name | `u1-uat` |
| Origin branch | `xas-controlled-integration` (the certified integration baseline) |
| Origin commit SHA | `b623580b4ef08f0d4e11fd7ac7dee442d5572abc` |
| Origin rollback anchor | tag `liteqds-full-backup-pre-u1-uat-v1` (`b623580`) |
| Purpose | Host controlled U1 UAT governance preparation, and — once separately authorized — U1 UAT work, isolated from the certified baseline |

The branch was created **only** from `xas-controlled-integration`, per the
directive's `required_source_branch`.

## Standing rules

1. **No work on certified branches.** `rebuild/liteqds-g1-recovery-v1` and
   `xas-controlled-integration` are frozen. All U1 work happens on `u1-uat`.
2. **No certified-surface mutation.** `src/` (generator), `fixtures/`, and
   `harness/` (certified renderer + harness) are not modified. Any change is
   caught by `git diff` against `7d19fb9`.
3. **Additive only.** U1 UAT work adds files / branches; it does not rewrite
   certified components.
4. **All mutations tracked.** Every change on `u1-uat` is recorded in
   `U1_UAT_SCOPE_LEDGER.md` (mutation tracking section).
5. **No scope expansion.** Work stays within the U1 UAT scope ledger.
6. **No runtime / production / live integration.** Creating this branch
   implies no runtime authorization and no live activation.
7. **No merge back without authorization.** `u1-uat` does not merge into a
   certified branch without explicit PTC/DRJ authorization.

## Prohibited (directive phase-2 `prohibited`)

No production deployment · no live runtime activation · no unauthorized
integrations · no certified surface mutation · no scope expansion.

## Mutation tracking

Every commit on `u1-uat` is logged as a row in the
`U1_UAT_SCOPE_LEDGER.md` mutation table: commit SHA, summary, files touched,
and confirmation that no certified surface was modified.

## Branch replay validation

The `u1-uat` branch is replay-verifiable exactly as the certified state:

```bash
git clone git@github.com:STDC26/stardance-liteqds.git
cd stardance-liteqds
git checkout u1-uat
npm install
npx playwright install chromium
npm run test:all
```

Expected: all suites green. A `u1-uat` checkpoint is only valid when it
replays clean from a fresh clone — the same standard as a Certified Recovery
State (see `CERTIFIED_RECOVERY_STATE.md`).

## Rollback

If `u1-uat` work must be abandoned, roll back to the anchor
`liteqds-full-backup-pre-u1-uat-v1` per `ROLLBACK_PROCEDURE.md`. The certified
baseline is unaffected by anything done on `u1-uat`.
