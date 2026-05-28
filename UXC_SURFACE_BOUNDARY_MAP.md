# UXC Surface Boundary Map

**Per:** PTC directive 03 — `UXC_SURFACE_BOUNDARY_MAP`
**Phase:** IG-1 execution-readiness (planning artifact)

Documents the exact state boundaries between the `review_only` integration
mode, the `internal_review_surface` host, and the `uxc_activation_surface`
host — so the IG-1 execution scope is unambiguous.

## 1 · The three concepts are different kinds of thing

- **`review_only`** is an **integration mode** — a property of *how* LiteQDS is
  integrated. It is not a surface.
- **`internal_review_surface`** is a **host surface** — *where* LiteQDS is
  mounted in IG-1.
- **`uxc_activation_surface`** is a **different host surface** — explicitly
  **out of scope** for IG-1.

IG-1 = `review_only` mode on `internal_review_surface`. Nothing else.

## 2 · Integration mode boundary — `review_only`

| Property | `review_only` (IG-1) | NOT `review_only` (out of scope) |
|---|---|---|
| Panel is shown to a human | yes | — |
| Human reviewer dispositions the panel | yes | — |
| Component performs a decision | **no** | (would be a decision/runtime mode) |
| Autonomous execution | **no** | — |
| Write-back to a governed system | **no** | — |
| `runtime_authorization` | `not_authorized` | — |

`review_only` means: render for a human, who decides. The component never
acts. Any mode in which the component acts is **not** authorized and is not
part of IG-1.

## 3 · Host surface boundary

| Surface | Eligible? | IG-1 target? | Stakes | Authorized by |
|---|---|---|---|---|
| `experimental_sandbox` | yes | no (IG-0 used it) | lowest | — |
| `internal_review_surface` | yes | **YES** | low–moderate | IG-1 plan v0.1 |
| `uxc_activation_surface` | yes | **no** | moderate | requires separate cert gate |
| `production_runtime_surface` | **forbidden** | no | — | never |
| `customer_facing_surface` | **forbidden** | no | — | never |
| `governed_decision_surface` | **forbidden** | no | — | never |

Eligibility is enforced at registration time and insertion time
(`xas/host/hostEligibility.ts`). Forbidden surfaces fail closed with F-WIRE-06.

## 4 · The `internal_review_surface` → `uxc_activation_surface` boundary

This is the boundary that matters most for IG-1 scope discipline.

```
   ┌─────────────────────────────┐        ┌─────────────────────────────┐
   │  internal_review_surface    │        │  uxc_activation_surface     │
   │  ───────────────────────    │  ════  │  ───────────────────────    │
   │  IG-1 target                │  CERT  │  NOT in IG-1 scope          │
   │  internal reviewers         │  GATE  │  UXC activation flow        │
   │  review_only                │  ════  │  requires its own plan      │
   │  non_production             │        │  + its own PTC cert gate    │
   └─────────────────────────────┘        └─────────────────────────────┘
```

**Promotion rule (binding):** a successful IG-1 integration into
`internal_review_surface` does **not** authorize integration into
`uxc_activation_surface`. Crossing that boundary requires:

1. a separate controlled integration plan for `uxc_activation_surface`;
2. a separate PTC certification gate;
3. its own validation + evidence chain.

No code path, flag, or configuration in this repository bridges the two
surfaces. `uxc_activation_surface` remains eligible-but-untargeted.

## 5 · State boundary summary

| State dimension | IG-1 (in scope) | Out of scope |
|---|---|---|
| Mode | `review_only` | decision / runtime modes |
| Surface | `internal_review_surface` | uxc_activation / production / customer / governed |
| Posture | `non_production` | production |
| Authority | `human_review_required`, `not_authorized` | runtime / autonomous |
| Promotion | blocked (`promotion_blocking_status: true`) | Proto-QDS promotion |
