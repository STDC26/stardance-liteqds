# Certified Recovery State

**Per:** DRJ directive `Certified Recovery State Governance v1.0`
**Status:** Certified Recovery State Doctrine — **LOCKED**
**Recorded:** 2026-05-17

## Definition

A **Certified Recovery State** is a reproducible, replay-verified, immutable
operational checkpoint of the LiteQDS program — a state the program can always
be returned to.

## Current certified recovery state

| Field | Value |
|---|---|
| Rollback anchor (tag) | `liteqds-full-backup-pre-u1-uat-v1` |
| Anchor commit | `b623580` |
| Repo | `STDC26/stardance-liteqds` |
| Certified G1 baseline branch | `rebuild/liteqds-g1-recovery-v1` @ `7d19fb9` (protected) |
| Certification tag | `liteqds-g1-recovered-v1` @ `7d19fb9` |
| Certified integration baseline | `xas-controlled-integration` @ `b623580` |

## Doctrine — mandatory requirements (all currently met)

A state is a Certified Recovery State only when **all eight** hold:

| Requirement | Current state |
|---|---|
| Tagged | `liteqds-full-backup-pre-u1-uat-v1` |
| Pushed | on `origin` |
| Replay verified | fresh-clone replay PASS (branch + tag) |
| Fresh clone tested | `npm run test:all` → 397 passed, 0 failed |
| Test suite validated | 129 Vitest + 138 + 90 + 40 Playwright |
| Scope frozen | prohibited scopes documented and held |
| Rollback proven | attach-failure → detach-recovery drill (`recovered`) |
| Baseline immutable | `src/`/`fixtures/`/`harness/` byte-identical to `7d19fb9` |

## Required before

A Certified Recovery State must exist **before** any of:

- UAT
- Integration (live)
- Partner demos
- External operator access
- Architecture mutation
- Runtime experimentation

The current certified recovery state satisfies this precondition for the
controlled U1 UAT branch.

## Immutability rule

The rollback anchor `liteqds-full-backup-pre-u1-uat-v1` and the certified
branches (`rebuild/liteqds-g1-recovery-v1`, and `xas-controlled-integration` as
the certified integration baseline) are **frozen**. No work modifies them.
All forward work occurs on the `u1-uat` branch. See
[U1_UAT_BRANCH_GOVERNANCE.md](./U1_UAT_BRANCH_GOVERNANCE.md) and
[ROLLBACK_PROCEDURE.md](./ROLLBACK_PROCEDURE.md).
