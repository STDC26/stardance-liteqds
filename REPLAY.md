# REPLAY — LiteQDS controlled rebuild

Reproduce the full build and G1 proof from a clean clone.

## Prerequisites

- Node.js 20+ (built and verified on Node 25)
- npm 10+

## Clean-clone replay

```bash
git clone git@github.com:STDC26/stardance-liteqds.git
cd stardance-liteqds
git checkout rebuild/liteqds-g1-recovery-v1

npm install
npx playwright install chromium

npm run test:all
```

`npm run test:all` runs, in order:

1. `test:generator` — Vitest. Panel Generator (LCG-01..10), fixture
   validation, and the G1 evidence-manifest check.
2. `harness:build` — production build of the Render Harness.
3. `test:harness` — Playwright G1 proof suite (AS / FB / UT / F-WIRE / M)
   across the desktop and mobile projects.

Expected: all suites green.

## Regenerating artifacts

Both regeneration steps are deterministic.

```bash
npm run fixtures:generate     # rebuild fixtures/ from the generator
npm run evidence:manifest     # rebuild harness/evidence/manifest.json
```

`fixtures:generate` is deterministic — each input carries a fixed
`generated_at`, so regenerated fixtures are byte-identical. `evidence:manifest`
verifies every referenced screenshot resolves before writing.

## Individual suites

```bash
npm run test:generator     # Vitest only
npm run harness:dev        # serve the harness at http://localhost:4317
npm run test:harness       # Playwright only (auto-builds + previews)
```

## Harness URL parameters

The harness is URL-driven (used by the G1 suite):

- `?fixture=qds-learn | qds-mo | qds-signal`
- `?variant=valid | malformed | missing-field | non-lite | band-violation`
- `?host=<surface>` — a forbidden surface triggers F-WIRE-06

Example: `http://localhost:4317/?fixture=qds-mo&variant=band-violation`
