# Operator Visibility Matrix

**Per:** PTC directive 04 — `OPERATOR_VISIBILITY_MATRIX`
**Phase:** IG-1 execution-readiness (planning artifact)
**Operator context:** human reviewer on `internal_review_surface`, `review_only`

Maps everything an operator (reviewer) sees during IG-1 execution. No state is
hidden — every transition is operator-visible (PTC governance constraint:
"no silent state transitions").

## 1 · Surface-level visible states

| State | Trigger | What the operator sees | `data-testid` |
|---|---|---|---|
| Surface banner | always | `internal_review_surface · staging-equivalent`, flag state, `review_only` | `irs-banner` |
| Not mounted | feature flag OFF | "LiteQDS panel not mounted — flag OFF" empty card | `internal-review-surface-empty` |
| Panel rendered | flag ON + valid envelope | the LiteQDS Qualification Card | `qualification-card` |
| Refusal rendered | flag ON + F-WIRE condition | the component-owned F-WIRE surface | `fwire-failure-surface` |

The flag state (`ON`/`OFF`) is printed in the banner — the operator can always
see whether the panel is mounted and why.

## 2 · Trust signals (visible whenever the panel renders)

| Trust signal | Operator sees | `data-testid` | Hard-locked on mobile |
|---|---|---|---|
| Governance class | "Lite · experimental" badge | `governance-class-badge` | yes |
| Runtime authorization | "Not authorized for runtime" badge | `runtime-authorization-indicator` | yes |
| Human review required | "Human review required" badge | `human-review-required` | yes |
| Trust-surface limitation | first limitation, always visible | `trust-indicator-always-visible` | yes |
| Trust limitations (full) | expandable list | `trust-limitation-expand` / `-item` | — |
| Directional read | word-only directional confidence | `directional-confidence` | — |
| Recourse path | recourse instruction line | `recourse-path` | — |

All five constitutional trust signals (governance class, runtime
authorization, human review, trust limitations, recourse) are visible in the
operator context — confirmed by `xas-int.spec.ts` XAS-INT-04 and the mobile
hard-lock by XAS-INT-05.

## 3 · Failure conditions (each renders through the component-owned surface)

| Failure | Trigger | Operator sees | `fwire-code` |
|---|---|---|---|
| F-WIRE-01 | malformed envelope | refusal surface + operator message | `F-WIRE-01_MALFORMED_ENVELOPE` |
| F-WIRE-02 | required field missing | refusal surface + operator message | `F-WIRE-02_REQUIRED_FIELD_MISSING` |
| F-WIRE-03 | non-lite governance class | refusal surface + operator message | `F-WIRE-03_NON_LITE_GOVERNANCE_CLASS` |
| F-WIRE-04 | viewport too small | refusal surface + operator message | `F-WIRE-04_VIEWPORT_TOO_SMALL` |
| F-WIRE-05 | band rendering violation | refusal surface + operator message | `F-WIRE-05_BAND_RENDERING_VIOLATION` |
| F-WIRE-06 | forbidden host surface | refusal surface + operator message | `F-WIRE-06_FORBIDDEN_HOST_SURFACE` |

Every refusal carries `data-surface-owner="liteqds_component"` — the operator
sees the component's own refusal, never an XAS-branded error page.

## 4 · Reviewer-visible governance banners

| Banner | Always shown? | Content |
|---|---|---|
| Surface banner (`irs-banner`) | yes | surface id, flag state, `review_only` mode |
| Governance signal strip (`governance-signal-strip`) | yes (when panel renders) | the three governance badges (§2) |
| F-WIRE refusal tag | on refusal | "LiteQDS refusal" + code + operator message |

## 5 · State-transition visibility guarantee

| Transition | Operator-visible signal |
|---|---|
| flag OFF → ON | banner flips to `flag: ON`; empty card → panel |
| flag ON → OFF (rollback) | banner flips to `flag: OFF`; panel → empty card |
| valid → F-WIRE | panel → F-WIRE refusal surface with code |
| any render | telemetry event recorded (bounded metadata) |

No transition is silent: every flag flip, mount, and refusal changes a
visible element and emits a recorded telemetry event.

## 6 · What the operator never sees (by construction)

- No numeric or institutional confidence value.
- No DTO, decision trace, or subject-level payload.
- No Proto-QDS promotion control.
- No runtime / activation / "approve to production" control.
