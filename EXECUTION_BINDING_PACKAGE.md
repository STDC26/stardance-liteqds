# Execution Binding Package

**Per:** PTC directive 01 — `EXECUTION_BINDING_PACKAGE`
**From:** CC · **To:** DRJ / DTC (operator-execution binding)
**Phase:** IG-1 final execution-binding preparation
**Branch:** `xas-controlled-integration` @ `e2c10b7`

> Operator-facing binding package. It maps every unresolved live dependency to
> a specific required owner action. CC has completed all engineering
> preparation; what remains is operational/governance binding by the named
> owners. No live operation is performed by this document.

## How to read this

Each binding has: the **owner action** required, the **acceptance** that
confirms the binding is done, and the **CC follow-up** (the additive
implementation step CC performs once the binding is supplied). Owner names are
placeholders pending DRJ/PTC assignment.

## Bindings

### LD-01 · Live XAS registry endpoint
- **Owner:** `<XAS_PLATFORM_OWNER>`
- **Owner action:** provide the live XAS registry endpoint, access credentials,
  and confirm the registration API contract (shape of a registration call).
- **Acceptance:** a non-mounting dry-run probe registers LiteQDS against the
  live endpoint with parity to `DryRunRegistryProvider` behavior.
- **CC follow-up:** implement a live `IXASRegistryProvider` against the
  confirmed contract — additive, no integration-code change.

### LD-02 · Feature-flag backend
- **Owner:** `<XAS_PLATFORM_OWNER>`
- **Owner action:** provision the flag system and the key
  `xas.liteqds.internal_review.enabled`, **default OFF**.
- **Acceptance:** the key reads OFF by default; a live provider activates
  cleanly inside `FeatureFlagProviderRegistry`.
- **CC follow-up:** implement + register a live `XASFeatureFlagProvider`.

### LD-03 · Telemetry backend
- **Owner:** `<XAS_OBSERVABILITY_OWNER>`
- **Owner action:** confirm an append-only, metadata-bounded telemetry backend
  and its ingestion endpoint.
- **Acceptance:** append-only verified; the bounded-metadata guard
  (`assertBoundedMetadata`) holds against the backend's schema.
- **CC follow-up:** implement a live `IXASTelemetryProvider` (still rejects
  DTO / trace / payload fields).

### LD-04 · Reviewer cohort
- **Owner:** `<DRJ>`
- **Owner action:** supply the real reviewer group id and member-ref count via
  configuration — **never individual identities in the repository**.
- **Acceptance:** `bindReviewerGroup(config)` accepts it with
  `is_placeholder: false` and no identity-like rejection.
- **CC follow-up:** none beyond consuming the injected config.

### LD-05 · Live surface access
- **Owner:** `<XAS_PLATFORM_OWNER>`
- **Owner action:** confirm `internal_review_surface` is a real running system
  and provide either CC access or a designated operator execution path.
- **Acceptance:** a real mount point for the surface exists and is reachable
  by the agreed execution path.
- **CC follow-up:** bind the adapter mount to the real insertion point.

### LD-06 · Operational execution window
- **Owner:** `<XAS_OPS_OWNER>`
- **Owner action:** schedule an IG-1 execution window and run the live rollback
  drill within it.
- **Acceptance:** the live rollback drill mirrors `ROLLBACK_DRILL_REPORT.md`
  (`recovered: true`, `final_surface_state: detached_safe`).
- **CC follow-up:** execute IG-1 phase-gated during the window, evidence-backed.

### LD-07 · PTC execution authorization
- **Owner:** `PTC`
- **Owner action:** issue IG-1 execution authorization.
- **Acceptance:** a PTC ruling moving `ig1_execution` from
  `BLOCKED_PENDING_DEPENDENCIES` to authorized.
- **CC follow-up:** none — this binding gates all of LD-01..LD-06.

## Binding order

```
   LD-07 (PTC authorization)  ── gates everything below
        │
        ├── LD-01, LD-02, LD-03, LD-05  (XAS platform / observability bindings)
        ├── LD-04                       (DRJ reviewer cohort config)
        └── LD-06                       (ops window + live rollback drill)
```

## Standing guarantee

Every CC follow-up above is **additive**: a live provider implements an
existing interface and is slotted into the existing swappable architecture.
No certified baseline file, renderer, generator, or fixture changes. Until all
bindings are supplied and LD-07 is issued, no live-capable operation exists.
