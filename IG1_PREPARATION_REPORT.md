# IG-1 Preparation Report

**Phase:** IG-1 PREPARATION (dry-run only)
**From:** CC
**To:** PTC / DRJ
**Per:** PTC ruling `IG0_ACCEPTED` → `next_phase_directive: IG-1 PREPARATION`
**Branch:** `xas-controlled-integration`
**Certified baseline:** `STDC26/stardance-liteqds` @ `7d19fb9`, tag `liteqds-g1-recovered-v1`

> IG-1 preparation only. No live registry was contacted, no real XAS surface
> mounted, no live flag activated, no production telemetry bound. No
> attach-capable operation against a live system exists in this package.

## Objective

Prepare the live-registry-integration package — abstractions, schema, preflight
suite, dry-run simulation, and operational safety protocol — so that IG-1
execution, when separately authorized, has a validated, vendor-agnostic,
rollback-safe foundation. Everything here is additive and dry-run.

## Deliverables

| Deliverable | Location |
|---|---|
| `IXASRegistryProvider` interface + dry-run provider | `xas/ig1/IXASRegistryProvider.ts` |
| `IXASTelemetryProvider` interface (append-only, non-outbound) | `xas/ig1/IXASTelemetryProvider.ts` |
| Swappable feature-flag provider architecture | `xas/ig1/featureFlagProviders.ts` |
| Reviewer-group config binding (no hardcoded identities) | `xas/ig1/reviewerGroupConfig.ts` |
| Registry insertion manifest schema | `xas/ig1/registryInsertionManifest.ts` |
| Rollback-before-attach protocol | `xas/ig1/rollbackBeforeAttach.ts` |
| Dry-run insertion simulation | `xas/ig1/dryRunInsertion.ts` |
| IG1-PREFLIGHT-01..15 suite | `xas/ig1/ig1-preflight.spec.ts` |
| Dry-run insertion evidence | `xas/evidence/ig1/dry-run-insertion.json` |
| IG-1-prep evidence manifest | `xas/evidence/ig1/IG1-PREP.manifest.json` |

## Design properties

- **Vendor-agnostic.** Registry, telemetry, and feature-flag providers are
  interfaces. The dry-run/in-memory implementations carry no vendor coupling.
  A live provider is added later by implementing the interface — no
  integration-code change.
- **No live provider implemented.** Only `DryRunRegistryProvider` exists.
  Connecting to a live registry is structurally absent from this package.
- **Append-only, non-outbound telemetry.** `IXASTelemetryProvider.outbound` is
  `false` for every provider here; events are validated as bounded metadata
  (no DTO / trace / payload / confidence fields).
- **Fail-closed flags.** Every flag provider defaults OFF; the swappable
  registry fails closed when no provider is active.
- **Reviewer identities never hardcoded.** The reviewer group is config-injected;
  identity-like values (emails, names, dotted handles) are rejected.
- **Rollback before attach.** `RollbackBeforeAttachProtocol.prepareAttach()`
  throws unless a single-step detach path was registered first — an attach
  cannot be prepared without a rollback path.

## IG1-PREFLIGHT results — 15/15 PASS

| Check | Result |
|---|---|
| IG1-PREFLIGHT-01 · registry provider in dry_run mode | PASS |
| IG1-PREFLIGHT-02 · registration contacts no live registry | PASS |
| IG1-PREFLIGHT-03 · dry-run registration succeeds for internal_review_surface | PASS |
| IG1-PREFLIGHT-04 · dry-run registration rejects forbidden hosts | PASS |
| IG1-PREFLIGHT-05 · telemetry provider is append-only | PASS |
| IG1-PREFLIGHT-06 · telemetry provider is non-outbound | PASS |
| IG1-PREFLIGHT-07 · telemetry events are metadata-bounded | PASS |
| IG1-PREFLIGHT-08 · feature flag defaults OFF across providers | PASS |
| IG1-PREFLIGHT-09 · feature flag provider is swappable | PASS |
| IG1-PREFLIGHT-10 · reviewer group config-injected, no hardcoded identities | PASS |
| IG1-PREFLIGHT-11 · insertion manifest validates a well-formed manifest | PASS |
| IG1-PREFLIGHT-12 · manifest missing rollback protocol is rejected | PASS |
| IG1-PREFLIGHT-13 · rollback-before-attach — detach must precede attach | PASS |
| IG1-PREFLIGHT-14 · dry-run insertion produces no live side effects | PASS |
| IG1-PREFLIGHT-15 · runtime prohibition intact in the insertion manifest | PASS |

## Dry-run insertion simulation

`runDryRunInsertion()` simulates the full IG-1 sequence — build+validate
manifest → register detach path → prepare attach (rollback verified first) →
dry-run registry registration → bind feature flag (default OFF). Result:

- `mode: dry_run`, `live_side_effects: false`
- `manifest_valid: true`, `registry_status: registered`
- `flag_state_at_insertion: off`
- `rollback_ready_before_attach: true`
- `telemetry_outbound: false`, 2 bounded-metadata events

Evidence: `xas/evidence/ig1/dry-run-insertion.json`.

## Rollback-before-attach protocol

The operational safety rule: **a detach path must exist before an attach path.**
`RollbackBeforeAttachProtocol` enforces it in code — `prepareAttach()` throws a
`RollbackBeforeAttachViolation` unless `registerDetach()` (with a single-step
detach) was called first. The IG-1 detach path is the single-step flag
toggle: `set xas.liteqds.internal_review.enabled = OFF`.

## Governance constraints — all held

Additive only · no certified baseline mutation (`git diff 7d19fb9` clean for
`src/`, `fixtures/`, `harness/`) · no renderer rewrite · no runtime authority
path · no Proto-QDS activation · no silent behavior (every step is recorded) ·
all integration actions evidence-backed.

## Unresolved prerequisites for IG-1 EXECUTION (not authorized)

IG-1 execution remains blocked on:

1. **Live XAS registry endpoint + access** — to implement and bind a live
   `IXASRegistryProvider`.
2. **XAS feature-flag system** — to implement a live `XASFeatureFlagProvider`
   and register it in the swappable architecture.
3. **Production telemetry backend** — to implement a live (still append-only)
   `IXASTelemetryProvider` once the XAS owner confirms a backend.
4. **Reviewer identities / real group config** — DRJ to supply the real
   reviewer group configuration (currently the placeholder
   `liteqds_internal_review_alpha`).
5. **IG-1 execution authorization** — PTC ruling currently
   `ig1: AUTHORIZED_FOR_PREPARATION_ONLY`.

---

**End of IG-1 Preparation Report. IG-1 execution is not authorized.**
