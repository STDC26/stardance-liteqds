# Rollback Drill Report

**Per:** PTC directive 02 — `ROLLBACK_DRILL_SIMULATION`
**Phase:** IG-1 execution-readiness (dry-run only)
**Branch:** `xas-controlled-integration`
**Simulation:** `xas/ig1/rollbackDrill.ts` · evidence `xas/evidence/ig1/rollback-drill.json`

## Purpose

Demonstrate, deterministically, that an **attach failure** during IG-1
execution is recovered by a **single-step detach** that returns the surface to
a safe detached state — with no live side effects.

## Scenario

`attach_failure_to_detach_recovery`. The attach failure is an **injected
fault**: the post-attach health check is forced to fail so the recovery path
is exercised every run. The drill uses the real IG-1 abstractions
(`RollbackBeforeAttachProtocol`, the feature-flag provider, the
`internal_review_surface` mount) — nothing is stubbed.

## Drill sequence

| # | Step | Surface state | Outcome |
|---|---|---|---|
| 1 | Register detach path | `detached` | single-step detach registered **before** any attach |
| 2 | Prepare attach (rollback verified first) | `detached` | attach prepared |
| 3 | Attach — flag ON, mount panel | `attached` | panel mounted |
| 4 | Post-attach health check | `attach_failed` | **INJECTED FAULT** — attach declared unhealthy |
| 5 | Detach recovery — single-step flag OFF | `detached_safe` | panel unmounted; surface returned to detached_safe |

## Result

| Property | Value |
|---|---|
| `detach_registered_before_attach` | `true` |
| `attach_attempted` | `true` |
| `attach_failed` | `true` (injected) |
| `detach_executed` | `true` |
| `final_surface_state` | `detached_safe` |
| `recovered` | `true` |
| `live_side_effects` | `false` |
| telemetry | bounded-metadata only, non-outbound |

**Outcome: PASS.** An attach failure is fully recovered by the single-step
detach. The rollback-before-attach invariant holds — the detach path was
registered and verified before attach was prepared.

## Properties demonstrated

- **Rollback exists before attach.** Step 1 precedes step 2; `prepareAttach()`
  would throw if it did not.
- **Single-step detach.** Recovery is one action — set the feature flag OFF.
- **Safe terminal state.** After recovery the surface is `detached_safe`: the
  panel is unmounted and not reachable.
- **No residue.** The integration is review-only and holds no mutable state;
  recovery leaves nothing to unwind.
- **Determinism.** Identical result across runs (fixed timestamps).

## Evidence

`xas/evidence/ig1/rollback-drill.json` — full step trace + telemetry.
Regenerate with `npm run ig1:evidence`. Verified by
`xas/ig1/rollbackDrill.spec.ts` (6/6).
