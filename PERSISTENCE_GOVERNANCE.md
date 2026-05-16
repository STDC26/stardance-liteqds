# Persistence Governance Checklist

Tracks the PERSIST-01..07 acceptance criteria for the LiteQDS controlled rebuild.
Updated as the build progresses; final state reported in the CC completion report.

- [x] PERSIST-01 — canonical remote URL reported: https://github.com/STDC26/stardance-liteqds
- [x] PERSIST-02 — branch `rebuild/liteqds-g1-recovery-v1` pushed
- [x] PERSIST-03 — commit hashes reported: generator `d1a02fb` / harness `6da0111` / evidence index `4575775`
- [x] PERSIST-04 — tests rerunnable from a clean clone (verified via fresh clone)
- [x] PERSIST-05 — evidence pack committed (harness/evidence/screenshots + manifest.json)
- [x] PERSIST-06 — evidence manifest paths resolvable (tests/evidence-manifest.spec.ts)
- [x] PERSIST-07 — README replay instructions present (REPLAY.md)

## PERSISTENCE_GOVERNANCE_GATE — mandatory (PTC, certification v1.0.0)

Per PTC ruling `liteqds_rebuild_certification v1.0.0`, this gate is **mandatory
for all future canonical builds**. No build may be declared complete without:

1. Pushed remote commits.
2. Replay validation from a clean clone.
3. Evidence persistence (committed or durably archived).
4. Canonical branch identification.

Root cause this gate addresses: `MULTI_MACHINE_ARTIFACT_CONTINUITY_FAILURE` —
the prior LiteQDS source chain became unrecoverable because artifacts lived
only on machines that were no longer reachable.

## Append-only / governance notes

- This is a controlled rebuild; commit history starts fresh on this branch.
- No claim of recovered provenance. Prior commits f068bd4 / bc981bd / 25a6560
  are not reintroduced or referenced as executable proof.
- Evidence artifacts (screenshots, manifest) are committed, not mutated in place.
- Certified by PTC as `G1-RECOVERED`; certification tag `liteqds-g1-recovered-v1`.
