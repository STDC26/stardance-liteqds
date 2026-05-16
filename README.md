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
REPLAY.md            Clean-clone replay instructions
```

## Replay

See [REPLAY.md](./REPLAY.md). Short form:

```bash
npm install
npx playwright install chromium
npm run test:all
```

## Scope boundary

This repo contains the LiteQDS canonical artifacts only. It does **not**
contain XAS integration, Proto-QDS, runtime deployment, DTO/trace systems, or
institutional-confidence semantics — all out of scope per the rebuild directive.
