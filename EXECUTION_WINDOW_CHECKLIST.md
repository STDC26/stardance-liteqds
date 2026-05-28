# Execution Window Checklist

**Per:** PTC directive 04 — `EXECUTION_WINDOW_CHECKLIST`
**Phase:** IG-1 final execution-binding preparation (planning artifact)

A one-pass operational checklist for a future, separately-authorized IG-1
execution window. It is not an authorization — it is the procedure to run
*once* IG-1 execution is authorized. Every item is a hard gate: a failed item
stops the window.

## A · Pre-window gate (all must be TRUE before the window opens)

- [ ] LD-07 — PTC IG-1 execution authorization issued.
- [ ] LD-01 — live registry endpoint validated; live `IXASRegistryProvider` implemented.
- [ ] LD-02 — feature-flag backend validated; key provisioned default OFF.
- [ ] LD-03 — telemetry backend validated; append-only + bounded-metadata confirmed.
- [ ] LD-04 — reviewer cohort config supplied (`is_placeholder: false`).
- [ ] LD-05 — live `internal_review_surface` access / operator path confirmed.
- [ ] LD-06 — execution window scheduled; live rollback drill slot reserved.
- [ ] Clean-clone replay of the certified baseline + integration branch is green.
- [ ] `git diff` vs `7d19fb9` for `src/` `fixtures/` `harness/` is empty.
- [ ] Rollback path confirmed registered (rollback-before-attach) before any attach item below.

## B · Window — phased execution (each phase gated)

- [ ] **IG-1 · registry** — register LiteQDS with the live registry; confirm
      dry-run parity. Gate VG-1. Flag remains OFF.
- [ ] **IG-2 · dark mount** — mount the adapter at `internal_review_surface`
      with the flag OFF; confirm the panel is provably not rendered. Gate VG-2.
- [ ] **Live rollback drill** — run the attach-failure → detach-recovery drill
      on the live surface; confirm `recovered`, `detached_safe`. (LD-06)
- [ ] **IG-3 · scoped enablement** — flag ON for the named reviewer cohort
      only; run XAS-INT-01..12 against the live mount. Gate VG-3.
- [ ] **IG-4 · full enablement** — flag ON for the full
      `internal_review_surface`; re-run XAS-INT; confirm mobile hard-lock and
      bounded telemetry. Gate VG-4.

## C · Continuous checks (hold throughout the window)

- [ ] `runtime_authorization` renders `not_authorized` at every step.
- [ ] All five trust signals visible whenever the panel renders.
- [ ] Every F-WIRE condition surfaces through the component-owned surface.
- [ ] Telemetry remains append-only and metadata-bounded (no DTO / trace / payload).
- [ ] No Proto-QDS promotion path appears.
- [ ] No silent state transition — every change is operator-visible.

## D · Rollback triggers (any one → execute single-step detach immediately)

- [ ] Any validation gate (VG-1..VG-4) fails.
- [ ] Any fail-closed condition fires (see `FAIL_CLOSED_EXECUTION_PROTOCOL.md`).
- [ ] Telemetry cannot record a mount.
- [ ] An unexpected reviewer-exposure or surface-drift condition is observed.
- [ ] Operator judgment call.

**Rollback action:** set `xas.liteqds.internal_review.enabled` = OFF. Single
step. Confirm the surface returns to `detached_safe`.

## E · Post-window

- [ ] Capture per-phase evidence manifests (`xas/evidence/integration/IG-*.manifest.json`).
- [ ] Confirm certified baseline still unchanged vs `7d19fb9`.
- [ ] Update the evidence index.
- [ ] Produce the IG-1 execution report (per-phase results, gate outcomes, rollback events if any).
- [ ] Return the report to PTC.

## F · Sign-off

- [ ] All phase gates passed, or the window was rolled back cleanly.
- [ ] Evidence committed and pushed.
- [ ] PTC notified of outcome.

> One pass. If any gate fails and cannot be cleared within the window, execute
> rollback (section D), close the window, and return evidence. Do not improvise
> a partial integration.
