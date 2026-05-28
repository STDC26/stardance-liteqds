# Rollback Procedure

**Per:** DRJ directive `Certified Recovery State Governance v1.0` — phase 3
**Scope:** how to return the LiteQDS program to its Certified Recovery State.

## Rollback anchor

| Field | Value |
|---|---|
| Anchor tag | `liteqds-full-backup-pre-u1-uat-v1` |
| Anchor commit | `b623580` |
| Certified G1 baseline | `rebuild/liteqds-g1-recovery-v1` @ `7d19fb9` |

The anchor is immutable. It is the guaranteed-good state every rollback below
returns to.

## When to roll back

- U1 UAT work on `u1-uat` must be abandoned.
- A `u1-uat` checkpoint fails fresh-clone replay.
- Any zero-tolerance condition occurs (certified-branch mutation, untracked
  architectural mutation, unauthorized runtime activation, silent scope drift).
- Operator/PTC judgment call.

## Procedure A — abandon `u1-uat` work, return to the anchor

`u1-uat` is isolated; the certified baseline is never affected by it. To
discard `u1-uat` work:

```bash
# Inspect what would be discarded
git checkout u1-uat && git log --oneline xas-controlled-integration..u1-uat

# Option 1 — reset u1-uat back to the anchor (keeps the branch)
git checkout u1-uat
git reset --hard liteqds-full-backup-pre-u1-uat-v1

# Option 2 — delete the branch entirely and recreate from the anchor
git checkout xas-controlled-integration
git branch -D u1-uat
git checkout -b u1-uat liteqds-full-backup-pre-u1-uat-v1
```

Destructive git operations (`reset --hard`, `branch -D`) require explicit
DRJ/PTC authorization before execution.

## Procedure B — restore a clean working copy from the anchor

```bash
git clone git@github.com:STDC26/stardance-liteqds.git
cd stardance-liteqds
git checkout liteqds-full-backup-pre-u1-uat-v1
npm install
npx playwright install chromium
npm run test:all          # expect 397 passed, 0 failed
```

## Procedure C — integration rollback (single-step detach)

For a live integration attach (IG-1+, when authorized), the operational
rollback is the single-step feature-flag detach — set
`xas.liteqds.internal_review.enabled` to `OFF`. This is proven by the
attach-failure → detach-recovery drill (`ROLLBACK_DRILL_REPORT.md`,
`xas/evidence/ig1/rollback-drill.json`).

## Post-rollback verification

After any rollback, confirm the Certified Recovery State holds:

- [ ] `git rev-parse liteqds-full-backup-pre-u1-uat-v1^{}` = `b623580`
- [ ] `git rev-parse rebuild/liteqds-g1-recovery-v1` = `7d19fb9`
- [ ] `git diff --quiet 7d19fb9 -- src fixtures harness` (certified surfaces clean)
- [ ] `npm run test:all` green (397 passed, 0 failed)
- [ ] working tree clean

If all pass, the program is back in its Certified Recovery State.
