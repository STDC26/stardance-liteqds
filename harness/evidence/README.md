# G1 Evidence Index — LiteQDS controlled rebuild

This directory is the **fresh G1 evidence chain** for the LiteQDS controlled
rebuild. It does **not** reference or reuse the prior, unrecoverable evidence
chain (commit `25a6560`), and makes no claim of recovered provenance.

## Contents

- `manifest.json` — evidence index. Maps E1 (desktop) and E2 (mobile)
  render artifacts for all three fixtures, plus the six F-WIRE artifacts.
- `screenshots/` — captured PNGs.
- `build-manifest.ts` — regenerates `manifest.json` and verifies every
  referenced artifact resolves on disk (fails if any is missing).

## How the evidence is produced

1. `npm run test:harness` runs the Playwright G1 suite. `evidence.spec.ts`
   asserts the `qualification-card` element is visible, then screenshots that
   element — under the `desktop` (1280×900) and `mobile` (Pixel 5, 393×851)
   projects. F-WIRE surfaces are captured under `desktop`.
2. `npm run evidence:manifest` aggregates the screenshots into `manifest.json`
   and verifies each artifact exists and is non-trivial.

`contains_rendered_card` is `true` for each fixture mapping because the capture
target is the `qualification-card` element and the suite asserts that element
visible before the screenshot is taken — a non-rendered card fails the suite.

## Replay

The committed `manifest.json` + `screenshots/` are the evidence of record.
`tests/evidence-manifest.spec.ts` (run by `npm run test:generator`) verifies
the committed manifest's paths all resolve and that `contains_rendered_card`
is `true` for all six fixture mappings.
