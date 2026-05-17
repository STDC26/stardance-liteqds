# Backup Manifest — LiteQDS Full GitHub Backup

**Per:** PTC directive `FULL_GITHUB_BACKUP_DIRECTIVE`
**Backup point:** pre-U1-UAT
**Generated:** 2026-05-17
**Backup tag:** `liteqds-full-backup-pre-u1-uat-v1`

## Remote

| Field | Value |
|---|---|
| Repository | `STDC26/stardance-liteqds` (private) |
| Remote URL | `git@github.com:STDC26/stardance-liteqds.git` |
| Web | https://github.com/STDC26/stardance-liteqds |

## Branches

| Branch | Tip commit | Role |
|---|---|---|
| `rebuild/liteqds-g1-recovery-v1` | `7d19fb9` | Immutable certified G1 baseline — branch-protected |
| `xas-xx-validation-prep` | `a4cd39f` | XAS-XX validation + integration plan |
| `xas-controlled-integration` | `<backup commit>` (this commit) | Active branch — IG-0, IG-1 prep, execution-binding, this backup |

No `U1 UAT` branch exists — U1 UAT preparation has not begun (prohibited until
authorized). When created, it will branch from `xas-controlled-integration`.

## Tags

| Tag | Points to | Type |
|---|---|---|
| `liteqds-g1-recovered-v1` | `7d19fb9` | Certification tag — G1-RECOVERED |
| `liteqds-full-backup-pre-u1-uat-v1` | `<backup commit>` | Annotated backup tag (this backup) |

## Evidence artifacts

| Path | Content |
|---|---|
| `harness/evidence/manifest.json` + `screenshots/` | G1 evidence — 12 screenshots |
| `xas/evidence/manifest.json` + `screenshots/` | XAS-XX evidence — 12 screenshots |
| `xas/evidence/integration/IG-0.manifest.json` + `screenshots/` | IG-0 evidence — 7 screenshots |
| `xas/evidence/integration-events.jsonl` | IG-0 append-only telemetry sink |
| `xas/evidence/ig1/IG1-PREP.manifest.json` | IG-1 preparation evidence manifest |
| `xas/evidence/ig1/dry-run-insertion.json` | IG-1 dry-run insertion simulation |
| `xas/evidence/ig1/rollback-drill.json` | attach-failure → detach-recovery drill |

## Governance / report documents

`README.md` · `REPLAY.md` · `PERSISTENCE_GOVERNANCE.md` ·
`XAS_VALIDATION_REPORT.md` · `XAS_CONTROLLED_INTEGRATION_PLAN_v0.1.md` ·
`IG1_PREPARATION_REPORT.md` · `IG1_EXECUTION_READINESS_PACKET.md` ·
`ROLLBACK_DRILL_REPORT.md` · `UXC_SURFACE_BOUNDARY_MAP.md` ·
`OPERATOR_VISIBILITY_MATRIX.md` · `LIVE_DEPENDENCY_LEDGER.md` ·
`EXECUTION_BINDING_PACKAGE.md` · `LIVE_ATTACH_RISK_MATRIX.md` ·
`FAIL_CLOSED_EXECUTION_PROTOCOL.md` · `EXECUTION_WINDOW_CHECKLIST.md`

## Replay instructions

```bash
git clone git@github.com:STDC26/stardance-liteqds.git
cd stardance-liteqds
git checkout liteqds-full-backup-pre-u1-uat-v1   # or a branch
npm install
npx playwright install chromium
npm run test:all
```

`test:all` runs: Vitest (generator + XAS + integration + IG-1) → harness build
+ Playwright G1 suite → XAS build + XAS-XX suite → integration build + XAS-INT
suite. Expected: all green.

## Known prohibited scopes

No certified renderer / generator / fixture / certified harness modification ·
no U1 UAT implementation · no live XAS integration / live attach · no runtime
authorization · no production deployment · no `uxc_activation_surface`
progression · no Proto-QDS activation. All future work additive-only.

## Current program state

`ARCHITECTURALLY_COMPLETE_PENDING_OPERATIONAL_BINDINGS`. Phases
`g1_recovered` / `xas_xx_validation` certified; `ig0` / `ig1_preparation` /
`ig1_execution_readiness` / `ig1_execution_binding` all `CLOSED_PASS`.
`ig1_execution` is `BLOCKED_PENDING_DEPENDENCIES` (LD-01..LD-07, see
`LIVE_DEPENDENCY_LEDGER.md`).

## Next authorized phase

None for CC at this time. The next step is owned by DRJ/DTC: resolve the
operational bindings. U1 UAT and IG-1 execution each require explicit
authorization before any work proceeds.
