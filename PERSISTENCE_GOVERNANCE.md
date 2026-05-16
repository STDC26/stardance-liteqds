# Persistence Governance Checklist

Tracks the PERSIST-01..07 acceptance criteria for the LiteQDS controlled rebuild.
Updated as the build progresses; final state reported in the CC completion report.

- [pending push] PERSIST-01 — canonical remote URL reported
- [pending push] PERSIST-02 — branch `rebuild/liteqds-g1-recovery-v1` pushed
- [pending push] PERSIST-03 — commit hashes reported (generator / harness / evidence index)
- [x] PERSIST-04 — tests rerunnable from a clean clone (verified via fresh clone)
- [x] PERSIST-05 — evidence pack committed (harness/evidence/screenshots + manifest.json)
- [x] PERSIST-06 — evidence manifest paths resolvable (tests/evidence-manifest.spec.ts)
- [x] PERSIST-07 — README replay instructions present (REPLAY.md)

## Append-only / governance notes

- This is a controlled rebuild; commit history starts fresh on this branch.
- No claim of recovered provenance. Prior commits f068bd4 / bc981bd / 25a6560
  are not reintroduced or referenced as executable proof.
- Evidence artifacts (screenshots, manifest) are committed, not mutated in place.
