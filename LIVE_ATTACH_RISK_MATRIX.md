# Live Attach Risk Matrix

**Per:** PTC directive 02 — `LIVE_ATTACH_RISK_MATRIX`
**Phase:** IG-1 final execution-binding preparation (planning artifact)

Formal risk matrix for the live attach (IG-1 execution). Covers registry,
feature flags, telemetry, rollback, reviewer exposure, and surface-state
drift. Likelihood/impact are assessed *given the IG-1 design* — the
abstractions and fail-closed posture are the standing mitigations.

## Scale

- Likelihood / Impact: LOW · MODERATE · HIGH
- Residual = risk remaining **after** the listed mitigation.

## Matrix

### R-01 · Registry attach risk
- **Trigger:** the live XAS registry rejects, errors, or is unreachable during
  insertion.
- **Likelihood:** LOW–MODERATE · **Impact:** LOW
- **Mitigation:** dry-run parity probe before live insert; registration fails
  closed — a failed registration yields no mount; forbidden hosts rejected at
  registration time.
- **Residual:** LOW. A registry failure leaves the surface detached.
- **Owner:** `<XAS_PLATFORM_OWNER>`

### R-02 · Feature-flag risk
- **Trigger:** the flag backend returns ON unexpectedly, serves stale state, or
  is unreachable.
- **Likelihood:** LOW · **Impact:** MODERATE
- **Mitigation:** every provider fails closed (default OFF);
  `FeatureFlagProviderRegistry` fails closed when no provider is active; the
  flag enables visibility only, never authority.
- **Residual:** LOW. An unreachable/ambiguous flag reads OFF → not mounted.
- **Owner:** `<XAS_PLATFORM_OWNER>`

### R-03 · Telemetry risk
- **Trigger:** telemetry backend is down, or an event would carry payload /
  DTO / trace content.
- **Likelihood:** LOW–MODERATE · **Impact:** LOW–MODERATE
- **Mitigation:** `assertBoundedMetadata` rejects forbidden fields by
  construction; provider abstraction is append-only and non-outbound; a mount
  that cannot be recorded does not proceed (see Fail-Closed Protocol).
- **Residual:** LOW–MODERATE — backend *availability* is the residual; payload
  leakage residual is LOW (structurally blocked).
- **Owner:** `<XAS_OBSERVABILITY_OWNER>`

### R-04 · Rollback risk
- **Trigger:** detach fails, or an attach is attempted with no rollback path.
- **Likelihood:** LOW · **Impact:** HIGH (if unmitigated)
- **Mitigation:** `RollbackBeforeAttachProtocol` makes attach impossible
  without a registered single-step detach; rollback is one flag toggle; the
  rollback drill proves attach-failure → detach-recovery.
- **Residual:** LOW. If the flag system itself fails, default-OFF means the
  panel is already effectively detached.
- **Owner:** `<XAS_OPS_OWNER>`

### R-05 · Reviewer-exposure risk
- **Trigger:** the panel is shown to the wrong or an over-broad reviewer
  audience.
- **Likelihood:** LOW · **Impact:** MODERATE
- **Mitigation:** flag default OFF; staged enablement (IG-3 scoped cohort
  before IG-4 full); reviewer group is config-injected, not hardcoded;
  `review_only` — reviewers review, the component does not act.
- **Residual:** MODERATE — depends on the correctness of the reviewer cohort
  config (LD-04). Mitigated by IG-3 being a small named subset first.
- **Owner:** `<DRJ>`

### R-06 · Surface-state drift risk
- **Trigger:** `internal_review_surface` changes shape, or the panel renders
  in an unexpected state (wrong viewport, wrong host).
- **Likelihood:** LOW–MODERATE · **Impact:** LOW–MODERATE
- **Mitigation:** certified renderer unchanged; F-WIRE viewport (04) and host
  (06) checks fail closed; Operator Visibility Matrix defines every expected
  state; XAS-INT suite re-validates on the live mount.
- **Residual:** LOW–MODERATE — external surface evolution is the residual;
  detected by F-WIRE refusal rather than silent mis-render.
- **Owner:** `<XAS_PLATFORM_OWNER>`

## Aggregate

| Risk | Likelihood | Impact | Residual |
|---|---|---|---|
| R-01 registry | LOW–MOD | LOW | LOW |
| R-02 feature flag | LOW | MOD | LOW |
| R-03 telemetry | LOW–MOD | LOW–MOD | LOW–MOD |
| R-04 rollback | LOW | HIGH | LOW |
| R-05 reviewer exposure | LOW | MOD | MOD |
| R-06 surface drift | LOW–MOD | LOW–MOD | LOW–MOD |

**Aggregate residual: LOW–MODERATE, operational not architectural.** Every
risk resolves toward the safe state (detached / not mounted) under failure.
The two MODERATE residuals (R-05, R-06) are bound to external inputs — the
reviewer cohort config and surface stability — not to the integration design.
