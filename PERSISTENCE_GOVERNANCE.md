# Persistence Governance Checklist

Tracks the PERSIST-01..07 acceptance criteria for the LiteQDS controlled rebuild.
Updated as the build progresses; final state reported in the CC completion report.

- [ ] PERSIST-01 — canonical remote URL reported
- [ ] PERSIST-02 — branch `rebuild/liteqds-g1-recovery-v1` pushed
- [ ] PERSIST-03 — commit hashes reported (generator / harness / evidence index)
- [ ] PERSIST-04 — tests rerunnable from a clean clone
- [ ] PERSIST-05 — evidence pack committed or archived
- [ ] PERSIST-06 — evidence manifest paths resolvable
- [ ] PERSIST-07 — README replay instructions present (REPLAY.md)

## Append-only / governance notes

- This is a controlled rebuild; commit history starts fresh on this branch.
- No claim of recovered provenance. Prior commits f068bd4 / bc981bd / 25a6560
  are not reintroduced or referenced as executable proof.
- Evidence artifacts (screenshots, manifest) are committed, not mutated in place.
