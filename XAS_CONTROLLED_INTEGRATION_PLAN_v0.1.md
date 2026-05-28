# XAS Controlled Integration Plan — v0.1

**Document type:** Controlled integration plan (planning artifact — not an execution authorization)
**From:** CC
**To:** PTC / DRJ
**Status:** DRAFT v0.1 — submitted for PTC review
**Per:** PTC ruling `XAS_XX_VALIDATION_PREP_ACCEPTED` → `XAS_CONTROLLED_INTEGRATION_READY`
**Source branch:** `xas-xx-validation-prep` @ `59f609b`
**Immutable canonical baseline:** `rebuild/liteqds-g1-recovery-v1` @ `7d19fb9`, tag `liteqds-g1-recovered-v1`

> This is a plan. No live XAS or host surface is touched by this document.
> Execution of any phase below requires explicit PTC authorization.

---

## 1 · Objective

Define the controlled path for integrating the certified LiteQDS component into
an **actual XAS host surface** — without altering the certified LiteQDS
baseline (renderer, generator, fixtures, harness).

The XAS-XX validation preparation already produced and proved the integration
contract: registration, insertion adapter, host eligibility, and the XAS
harness (`xas/`, all XAS-01..14 passing). This plan describes mounting that
proven contract into a real surface.

## 2 · Target host surface

**Target: `internal_review_surface`.**

Rationale:
- It is an **eligible** host surface in the certified registration contract
  (`xas/registration/liteqds.registration.ts`) — not forbidden, not runtime.
- It is staffed by **human reviewers**, which aligns directly with the
  component's `human_review_required: true` invariant. LiteQDS output is meant
  to be read and dispositioned by a human; this surface is where that happens.
- It carries low-to-moderate stakes: internal audience, no customers, no
  runtime decision authority.

Surfaces explicitly **not** targeted by v0.1: `uxc_activation_surface`
(deferred to a later version), `experimental_sandbox` (already exercised by the
XAS harness), and all forbidden surfaces (`production_runtime_surface`,
`customer_facing_surface`, `governed_decision_surface`).

## 3 · Integration boundary

The boundary is the **XAS insertion adapter** (`LiteQDSXASAdapter`). It is the
single contractual seam between XAS and LiteQDS.

```
   XAS side                         │  BOUNDARY  │   LiteQDS side (certified, immutable)
   ─────────────────────────────────┼────────────┼──────────────────────────────────────
   internal_review_surface mount    │            │
   XAS registry                     │  adapter.  │  certified envelope (generator output)
   host_context provider            │  insert()  │  certified renderer components
   feature-flag gate                │            │  certified ImmutabilityGuard
   append-only telemetry sink       │            │  F-WIRE refusal surface (component-owned)
```

Boundary rules:
- XAS calls `adapter.insert(envelope, host_context)` and renders the returned
  `render_target`. It does not reach past the adapter into renderer internals.
- `host_context` is passed separately from the envelope — never folded in.
- XAS never mutates the envelope; the adapter deep-freezes before handoff.
- XAS never generates its own error UI for refusals — F-WIRE surfaces render
  through the component (`refusal_surface_owner: liteqds_component`).
- No file under `src/`, `fixtures/`, or `harness/src/` is modified. Integration
  code is additive and lives XAS-side.

## 4 · Deployment mode

**Flagged internal render — `review_only`, `non_production` posture.**

- Integration mode is **`review_only`**: the panel is presented to human
  reviewers for review. It is not an execution or decision path.
- Deployment posture is **`non_production`**: `internal_review_surface` is an
  internal, non-runtime surface; no production or customer context is involved.
- A feature flag — proposed key `xas.liteqds.internal_review.enabled` —
  gates whether the LiteQDS panel mounts in `internal_review_surface`.
- **Default: OFF.** The panel does not mount until the flag is explicitly
  enabled by an authorized operator.
- **Render-only.** The panel renders for human reviewers. It performs no
  runtime decision, no autonomous execution, no write-back to any governed
  system. The flag enables *visibility*, never *authority*.
- **Operator authority is `human_review_required`** — every LiteQDS panel on
  this surface is dispositioned by a human reviewer; the integration adds no
  automated disposition.
- Enablement is staged (see §6): flag may be scoped to a reviewer subset
  before full `internal_review_surface` enablement.

## 5 · Integration path (phased — each phase gated)

| Phase | Name | Action | Gate to exit |
|---|---|---|---|
| IG-0 | Baseline re-confirm | Clean-clone replay of `7d19fb9` and `59f609b`; confirm 56 Vitest + 138 + 90 Playwright green | VG-0 |
| IG-1 | Registry wiring | Register LiteQDS with the live XAS registry via the certified registration contract; flag OFF | VG-1 |
| IG-2 | Adapter mount | Mount `LiteQDSXASAdapter` at the `internal_review_surface` insertion point; flag OFF (not yet visible) | VG-2 |
| IG-3 | Scoped enablement | Enable the flag for a named reviewer subset only | VG-3 |
| IG-4 | Full enablement | Enable the flag for the full `internal_review_surface` | VG-4 |

Each phase is a separate PTC-authorized step. No phase begins until the prior
phase's validation gate passes and its evidence is captured.

## 6 · Validation gates

A gate passes only when its checks pass **and** its evidence is captured and
manifested.

- **VG-0 — Baseline integrity.** Certified baseline + XAS prep both replay
  green from clean clone. Determinism hash unchanged
  (`592691cc74a8efac40baffd3d10454df9922ec70741d2fd0332e1b8de221b20e`).
- **VG-1 — Registration.** LiteQDS registers; forbidden-host configs rejected
  at registration time; certification metadata present in the live registry.
- **VG-2 — Mount, dark.** Adapter mounted; with flag OFF the panel is provably
  not rendered and not reachable; insertion-time host check active.
- **VG-3 — Scoped render.** With flag ON for the subset: XAS-01..14 pass
  against the live mount; all five trust signals visible; F-WIRE surfaces
  component-owned; rollback (flag OFF) unmounts cleanly.
- **VG-4 — Full render.** XAS-01..14 pass at full `internal_review_surface`
  scope; mobile hard-lock holds; telemetry confirmed append-only and bounded.

## 7 · Rollback path

Rollback requirement: **single-step detach** — instantaneous, zero-data-loss.

1. **Primary rollback — single-step detach (IG-3 / IG-4):** set
   `xas.liteqds.internal_review.enabled` to OFF. This single step detaches the
   LiteQDS panel from `internal_review_surface`; it unmounts immediately.
   Because the integration is `review_only` and holds no mutable state, there
   is nothing to unwind. No multi-step teardown is required or permitted —
   the detach is one action.
2. **Deeper rollback (IG-2):** unmount the adapter from the
   `internal_review_surface` insertion point.
3. **Full rollback (IG-1):** unregister LiteQDS from the XAS registry.

Steps 2–3 are deeper teardown for earlier phases; the operational rollback for
a live (flag-ON) integration is always the single-step flag detach (step 1).

Rollback safety properties:
- No envelope, fixture, or renderer file is ever modified, so rollback never
  needs to restore LiteQDS state.
- Telemetry is append-only (§9) — rollback leaves prior records intact and
  simply stops new ones.
- The certified baseline branch is immutable; rollback never touches it.

Every rollback drill is itself an evidenced step (a VG check).

## 8 · Runtime prohibition preservation

The integration **must not** create a runtime authorization path. Preserved by
construction:
- `runtime_authorization` remains `not_authorized` in every envelope and is
  rendered as such (XAS-08).
- `internal_review_surface` is an eligible, **non-runtime** surface; the
  forbidden runtime/governed/customer surfaces remain rejected at both
  registration and insertion time (XAS-02, XAS-03).
- The feature flag enables *render visibility only* — it is not a runtime
  authorization toggle and must never be wired to one.
- No Proto-QDS promotion path is introduced; `promotion_blocking_status`
  stays `true` (XAS-14).
- `human_review_required` stays `true`; the surface is a human-review context.
- No DTO, trace, or institutional-confidence semantics are emitted (XAS-13).

A VG check at every gate explicitly re-asserts these.

## 9 · Evidence continuity requirements

- The G1 evidence chain (`harness/evidence/`) and the XAS-XX evidence
  (`xas/evidence/`) are **immutable**. Integration evidence is **appended**,
  never overwritten.
- Each IG phase produces its own evidence manifest, proposed location
  `xas/evidence/integration/IG-<n>.manifest.json`, with screenshots/logs for
  that phase.
- The certified baseline branch `rebuild/liteqds-g1-recovery-v1` stays
  protected and immutable; integration work continues on a dedicated branch
  (proposed `xas-controlled-integration`) cut from `xas-xx-validation-prep`.
- The determinism hash is carried forward and re-verified at VG-0.
- Telemetry persistence is append-only and bounded to metadata — no payload
  content, no DTO-like records, no subject-level traces.

## 10 · Post-integration validation suite

Proposed suite `XAS-INT-01..12`, run against the **live** `internal_review_surface`
mount at VG-3 and VG-4:

| Check | Description |
|---|---|
| XAS-INT-01 | Flag OFF → LiteQDS panel not mounted, not reachable |
| XAS-INT-02 | Flag ON → panel mounts in `internal_review_surface` |
| XAS-INT-03 | XAS-01..14 all pass against the live mount |
| XAS-INT-04 | All five trust signals visible on the live surface |
| XAS-INT-05 | Mobile trust hard-lock holds on the live surface |
| XAS-INT-06 | F-WIRE-01..06 render through the component-owned surface |
| XAS-INT-07 | Forbidden host surfaces still rejected from the live registry |
| XAS-INT-08 | `runtime_authorization` renders `not_authorized` live |
| XAS-INT-09 | No Proto promotion / runtime path reachable from the live mount |
| XAS-INT-10 | Telemetry is append-only and metadata-bounded |
| XAS-INT-11 | Rollback drill: flag OFF unmounts cleanly, zero residue |
| XAS-INT-12 | Certified baseline unchanged (git diff vs `7d19fb9` empty) |

## 11 · Acceptance criteria

**This plan (v0.1)** is accepted when PTC confirms the target surface,
integration boundary, deployment mode, gates, rollback rules, and the
post-integration suite.

**The integration itself** is accepted, per phase, when:
- the phase's validation gate (VG-n) passes;
- the phase's evidence manifest is committed;
- the integration branch is pushed;
- scope control holds (no renderer/generator/fixture mutation);
- runtime prohibition is re-confirmed.

### Success definition

The integration succeeds when all six conditions hold:

1. **Stable additive rendering** — the LiteQDS panel renders stably on
   `internal_review_surface`; all integration code is additive.
2. **Trust signal preservation in operator context** — all five trust signals
   remain visible to the human reviewer on the live surface.
3. **Zero renderer mutation** — `src/`, `fixtures/`, and `harness/src/` are
   byte-identical to the certified baseline `7d19fb9`.
4. **Clean rollback** — single-step detach unmounts the panel with zero
   residue, proven by a rollback drill (XAS-INT-11).
5. **Evidence continuity maintained** — prior G1 + XAS-XX evidence untouched;
   per-phase integration evidence appended (§9).
6. **Operator review flow validated** — a human reviewer can view a LiteQDS
   panel and complete a review disposition on `internal_review_surface`.

## 11a · Promotion rule

**No progression to `uxc_activation_surface` without a separate certification
gate.** Successful v0.1 integration into `internal_review_surface` does not
authorize integration into `uxc_activation_surface` (or any other surface).
Each subsequent target surface requires its own controlled integration plan
and its own PTC certification gate. v0.1 is scoped to `internal_review_surface`
only.

## 12 · Prohibited scope (carried forward)

No production deployment · no runtime authorization · no Proto-QDS promotion ·
no renderer rewrite · no generator mutation · no fixture mutation · no
institutional-confidence semantics · no DTO/trace exposure · no customer-facing
or governed-decision surface.

## 13 · Open questions for PTC

1. **Integration branch** — confirm a new `xas-controlled-integration` branch
   cut from `xas-xx-validation-prep`, keeping the prep branch stable.
2. **Feature-flag system** — what flag infrastructure does XAS use? The key
   `xas.liteqds.internal_review.enabled` is a placeholder pending that answer.
3. **Reviewer subset for IG-3** — who defines the named subset for scoped
   enablement?
4. **Telemetry sink** — which XAS telemetry backend receives the append-only
   insertion metadata, so the metadata-bound check (XAS-INT-10) can be wired?
5. **"Live XAS host surface"** — is `internal_review_surface` a real running
   system CC will have access to, or a staging equivalent? This determines
   whether IG-1+ are executable by CC or require DRJ/operator action.

---

**End of XAS Controlled Integration Plan v0.1.**
**Planning artifact only — no live integration performed.**
**Awaiting PTC review before any phase IG-0+ is authorized.**
