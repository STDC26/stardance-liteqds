# Fail-Closed Execution Protocol

**Per:** PTC directive 03 — `FAIL_CLOSED_EXECUTION_PROTOCOL`
**Phase:** IG-1 final execution-binding preparation (planning artifact)

Defines the exact fail-closed behavior for every dependency failure that could
occur during IG-1 execution. The unifying rule is stated once, then applied
per dependency.

## The fail-closed rule

> **Every dependency failure resolves to the safe state: panel NOT mounted /
> detached.** The safe state is OFF. No failure mode results in a mounted
> panel, a runtime action, or an unrecorded mount.

The feature flag's default-OFF posture is the backstop: whenever the
integration cannot establish a fully valid, recorded, rollback-covered mount,
the flag-gated path simply does not render.

## Per-dependency fail-closed behavior

### Registry (LD-01)

| Failure | Fail-closed behavior |
|---|---|
| Live registry unreachable | registration does not complete → component not registered → not mounted |
| Registry returns an error | treated as `rejected` → not mounted |
| Registry returns an ambiguous / partial response | treated as rejection (no optimistic registration) → not mounted |
| Registry would accept a forbidden host | rejected at registration time (F-WIRE-06 class) → not mounted |

### Feature flag (LD-02)

| Failure | Fail-closed behavior |
|---|---|
| Flag backend unreachable | provider returns `false` → flag OFF → not mounted |
| Flag backend returns malformed state | provider returns `false` → flag OFF → not mounted |
| No flag provider active in the registry | `FeatureFlagProviderRegistry` fails closed → OFF → not mounted |
| Flag state stale / uncertain | treated as OFF → not mounted |

### Telemetry (LD-03)

| Failure | Fail-closed behavior |
|---|---|
| Telemetry backend down | the mount is not recorded → **the mount does not proceed** (no unrecorded mounts); flag-gated render is withheld |
| Event would carry a forbidden field | `assertBoundedMetadata` throws → event rejected → mount does not proceed |
| Telemetry write partially fails | treated as failure → mount withheld |

Telemetry is a **gate**, not a passive observer: a mount that cannot be
recorded as bounded metadata does not happen.

### Reviewer cohort (LD-04)

| Failure | Fail-closed behavior |
|---|---|
| Reviewer group config missing | `bindReviewerGroup` returns the placeholder (`is_placeholder: true`) → IG-3 scoped enablement does not proceed |
| Config carries identity-like values | `ReviewerGroupConfigError` thrown → enablement blocked |
| Cohort undefined for a scope | flag stays OFF for that scope → not mounted |

### Live surface (LD-05)

| Failure | Fail-closed behavior |
|---|---|
| `internal_review_surface` unavailable | no mount point → not mounted |
| Surface returns an unexpected shape | F-WIRE refusal (viewport/host/band checks) instead of a silent mis-render |
| Forbidden host encountered | F-WIRE-06 via the component-owned surface → not mounted |

### Rollback (LD-06)

| Failure | Fail-closed behavior |
|---|---|
| Attach attempted with no detach path | `RollbackBeforeAttachProtocol.prepareAttach()` throws → attach blocked |
| Attach fails post-mount | single-step detach (flag OFF) → `detached_safe` (proven by the rollback drill) |
| Flag system itself fails during rollback | default-OFF posture means the panel is already effectively detached |

### Authorization (LD-07)

| Failure | Fail-closed behavior |
|---|---|
| IG-1 execution not authorized | no live-capable operation runs at all — the precondition for every step above |

## Invariant under all failures

Across every failure path: `runtime_authorization` stays `not_authorized`, no
Proto-QDS promotion path opens, the certified baseline is untouched, and the
failure is **visible** (an empty surface, an F-WIRE refusal, or a withheld
mount) — never a silent partial state.
