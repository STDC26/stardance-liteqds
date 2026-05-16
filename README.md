# stardance-liteqds

LiteQDS canonical artifacts — **controlled rebuild (G1 recovery v1)**.

> **Certification:** PTC-certified `G1-RECOVERED` (certification tag
> `liteqds-g1-recovered-v1`). This repository is a controlled rebuild —
> a canonical reconstruction, **not** artifact recovery. This characterization
> is permanent; see the provenance notice below.

## Provenance notice — READ FIRST

This repository is a **controlled rebuild**, not recovered provenance.

The prior LiteQDS source chain — generator commit `f068bd4`, harness commit
`bc981bd`, evidence-index commit `25a6560` — was **not recoverable** in any
reachable environment (GitHub orgs STDC26 / DIO2026, global GitHub code index,
and all local git repositories were searched). See PTC directive
`liteqds_controlled_rebuild_execution v1.0.0`.

Accordingly:

- These artifacts were **rebuilt fresh** against PTC acceptance criteria.
- The commits `f068bd4` / `bc981bd` / `25a6560` are **NOT** recovered and are
  **NOT** present in this repository's history.
- This rebuild does **not** claim commit continuity with the prior chain.
- `DIO2026/docente-qds` (the Docente QDS scoring backend) was used as
  **adjacent implementation context only** — never as a canonical source,
  never as proof, and its semantics are not imported here.
- A **fresh G1** evidence chain is produced here from scratch.

## What this is

LiteQDS is a **Lite, experimental** qualification-surface component family.
Everything it emits is governed:

- `governance_class` is fixed to `lite_experimental`
- `runtime_authorization` is fixed to `not_authorized`
- `human_review_required` is fixed to `true`
- `promotion_blocking_status` is fixed to `true` (no auto-promotion to Proto)
- Confidence is **directional only** — never numeric, never institutional

## Layout

```
src/                 LiteQDS Panel Generator (schemas, generator, validation)
tests/               Generator acceptance tests (Vitest) — LCG-01..10
fixtures/            QDS-Learn / QDS-MO / QDS-Signal envelopes
harness/src/         Controlled Render Harness (React, static, no backend)
harness/tests/       G1 proof suite (Playwright) — AS / FB / UT / F-WIRE / M
harness/evidence/    G1 evidence index + manifest
xas/                 XAS-XX validation scaffolding (additive — see below)
REPLAY.md            Clean-clone replay instructions
```

## Replay

See [REPLAY.md](./REPLAY.md). Short form:

```bash
npm install
npx playwright install chromium
npm run test:all
```

## XAS validation preparation

The `xas/` directory holds **additive** XAS-XX validation scaffolding, built on
the certified G1 baseline per PTC directive `liteqds_xas_fast_track_build
v1.0.0`. It does **not** modify the renderer, generator, or fixtures.

```
xas/registration/    XAS component registration contract
xas/adapter/         XAS insertion adapter (validate → host check → freeze)
xas/host/            Host eligibility validator (dual enforcement)
xas/harness/         XAS integration harness — certified renderer via the adapter
xas/tests/           XAS-XX validation suite (Playwright) — XAS-01..14
xas/integration/     IG-0 controlled-integration scaffold (flag, telemetry, mount)
xas/integration-harness/   staging-equivalent internal_review_surface
xas/integration-tests/     XAS-INT-01..12 post-integration suite
xas/evidence/        XAS-XX evidence + IG-0 evidence (manifest, telemetry sink)
XAS_VALIDATION_REPORT.md          XAS-XX validation result
XAS_CONTROLLED_INTEGRATION_PLAN_v0.1.md   controlling integration plan
```

XAS work is staged on `xas-xx-validation-prep`; controlled-integration work
(IG-0) is on `xas-controlled-integration`. The certified rebuild branch
`rebuild/liteqds-g1-recovery-v1` remains the immutable canonical baseline.

**IG-0 status:** the staging-equivalent `internal_review_surface` mount is
built and validated (flag default OFF, review-only, single-step detach
rollback). IG-1..IG-4 (live XAS integration) are prepared but **not
authorized** — see `XAS_CONTROLLED_INTEGRATION_PLAN_v0.1.md`.

## Scope boundary

The LiteQDS canonical artifacts (`src/`, `fixtures/`, `harness/`) are the
certified G1 baseline and are not modified by XAS work. This repo does **not**
contain Proto-QDS, runtime deployment, DTO/trace systems, or
institutional-confidence semantics — all remain out of scope.
