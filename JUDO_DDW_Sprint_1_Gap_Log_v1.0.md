# JUDO DDW Sprint 1 Gap Log v1.0

**Date:** 2026-06-18
**Specification:** Spec v1.1 (APPROVED_FOR_EXECUTION)

---

## Known Gaps

### G-01: No Playwright E2E Tests for DDW UI

**Description:** Sprint 1 acceptance tests (T1–T12) run as Vitest unit tests against the store and generator. No Playwright browser tests exist for the DDW workspace UI rendering.

**Impact:** LOW — the store and generator logic is fully tested; UI rendering follows the same component patterns as the certified harness (which has full Playwright coverage). The product build compiles successfully.

**Recommended resolution:** Add Playwright E2E tests for DDW in Sprint 2 (follow existing `harness/tests/` patterns with a new `playwright.ddw.config.ts`).

### G-02: No Screenshot Evidence for DDW

**Description:** No visual evidence (screenshots) of the DDW workspace rendering. The existing evidence pipeline captures harness screenshots but does not cover the product app's DDW screen.

**Impact:** LOW — the build compiles and can be viewed via `npm run product:dev`. Visual verification is available on demand.

**Recommended resolution:** Add DDW screenshot capture to evidence pipeline in Sprint 2.

### G-03: Sprint 1 Persistence is In-Memory Only

**Description:** Per spec, Sprint 1 uses in-memory store only. Session state is lost on page reload.

**Impact:** EXPECTED — this is by design (Addendum §9.4). Backend persistence is out of scope for Sprint 1.

**Recommended resolution:** Add persistence layer in Sprint 2+ per QDS_Net_New_Estimate_v0_1.md (NN-02).

### G-04: QDS Intake Routing is Placeholder

**Description:** The "Send to QDS Intake" button enables after Gate 1 approval but performs no action. No live QDS execution occurs.

**Impact:** EXPECTED — Spec v1.1 §13.2 explicitly states Gate 2 is a placeholder in Sprint 1.

**Recommended resolution:** Wire to QDS intake in Sprint 2+ when QDS execution integration is authorized.

### G-05: Refinement Re-Emits Canonical Design

**Description:** Per Addendum §2, `requestRefinement()` returns to NEEDS_REFINEMENT. Re-running `generateDesign()` re-emits the same canonical design because Sprint 1 uses a deterministic mock with no edit support.

**Impact:** EXPECTED — Spec v1.1 §11.2 notes edit support is conditional. The refine control is wired and functional (NEEDS_REFINEMENT → generateDesign() → DESIGN_GENERATED).

**Recommended resolution:** Add design editing or LLM-backed variation in Sprint 2+.

### G-06: Workspace Layout is Responsive-First, Not Desktop-Optimized

**Description:** The Spec §6.2 layout (LEFT/CENTER/RIGHT/BOTTOM) is rendered vertically on narrow viewports and as a 2-column grid on ≥800px. Full 3-column layout is not implemented.

**Impact:** LOW — the product app uses max-width: 900px. All zones are present and visible. A wider layout with 3 columns can be added when the product app expands beyond its current 640px constraint.

**Recommended resolution:** Expand to 3-column layout when product app surface area allows.

---

## No Critical Gaps

All Sprint 1 completion criteria (Spec v1.1 §16) are met. All gaps are LOW impact or EXPECTED by design. No gap blocks the Sprint 1 Evidence Review Gate.
