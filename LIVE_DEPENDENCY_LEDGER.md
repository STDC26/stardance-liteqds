# Live Dependency Ledger

**Per:** PTC directive 05 — `LIVE_DEPENDENCY_LEDGER`
**Phase:** IG-1 execution-readiness (planning artifact)
**Status:** all live dependencies UNRESOLVED — IG-1 execution blocked

Explicit ledger of every dependency that must be resolved before any
attach-capable (live) operation. Each row carries an ownership placeholder;
real owners are assigned by DRJ/PTC.

## Ledger

| ID | Dependency | Needed for | Current state | Resolution required | Owner (placeholder) |
|---|---|---|---|---|---|
| LD-01 | Live XAS registry endpoint + access | IG-1 registry insertion | abstraction only (`IXASRegistryProvider`, dry-run impl) | a live `IXASRegistryProvider` impl + endpoint + credentials | `<XAS_PLATFORM_OWNER>` |
| LD-02 | XAS feature-flag infrastructure | flag-gated mount | abstraction only (`XASFeatureFlagProvider`, local impl) | a live flag provider registered in the swappable architecture; flag key confirmed | `<XAS_PLATFORM_OWNER>` |
| LD-03 | Telemetry backend | append-only insertion telemetry | local JSONL sink only | a live append-only `IXASTelemetryProvider`; backend confirmed; still non-outbound-of-bounds | `<XAS_OBSERVABILITY_OWNER>` |
| LD-04 | Reviewer cohort / group config | IG-3 scoped enablement | placeholder group `liteqds_internal_review_alpha` | real reviewer group id + member-ref count via config (no identities hardcoded) | `<DRJ>` |
| LD-05 | `internal_review_surface` host access | IG-2 dark mount | staging-equivalent harness only | confirmation the surface is a real running system + CC/operator access path | `<XAS_PLATFORM_OWNER>` |
| LD-06 | Operational rollback drill on the live surface | IG-1 execution gate | simulated drill complete (`rollback-drill.json`) | the same drill executed against the live surface | `<XAS_OPS_OWNER>` |
| LD-07 | IG-1 execution authorization | any live operation | `ig1_execution: NOT_AUTHORIZED` | explicit PTC execution-authorization issuance | `<PTC>` |

## Dependency classes

- **Infrastructure (LD-01, LD-02, LD-03, LD-05)** — external systems the
  abstractions are designed to slot into. None are connected.
- **Configuration (LD-04)** — reviewer cohort, supplied via config at execution.
- **Operational (LD-06)** — a live rollback drill, mirroring the simulated one.
- **Governance (LD-07)** — PTC authorization; gates everything above.

## Blocking relationship

```
   LD-07 (PTC authorization)
        └── gates ──> LD-01..LD-06
   LD-01..LD-03, LD-05 (infrastructure)  ──> required for IG-1/IG-2
   LD-04 (reviewer config)               ──> required for IG-3
   LD-06 (live rollback drill)           ──> required before IG-1 execution sign-off
```

## Standing rule

No live-capable operation is implemented or attempted while any LD row is
unresolved. The IG-1 abstractions are deliberately vendor-agnostic so that
resolving LD-01..LD-03 is an additive implementation step — no integration
code changes when a live provider is slotted in.
