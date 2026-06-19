# QDS Net-New Estimate v0.1

**Classification:** Pre-Build Audit / Net-New Scoping
**Authority:** DRJ / DTC
**Date:** 2026-06-18
**Reference:** QDS_Asset_Reuse_Audit_Report_v0_1.md

---

## 1. Summary

The JUDO AI Qualification Designer requires **5 net-new capabilities** not present in the current QDS codebase. These capabilities represent approximately **12-19% of the projected total codebase** — well within the 10-15% net-new target (with minor upside variance).

All net-new work is **additive**. No existing asset requires deletion, replacement, or breaking modification.

---

## 2. Net-New Capabilities

### NN-01: AI Generation Orchestration Layer

**What:** The core AI capability — accepts natural language descriptions or structured specifications and produces valid `QDSDefinition` objects (or `LiteQDSGeneratorInput` for direct envelope generation).

**Why Net-New:** No LLM integration exists in the current codebase. This is the defining capability of the AI Qualification Designer.

**Scope:**
- LLM provider integration (API client, model selection, token management)
- Prompt engineering pipeline (system prompt, few-shot examples from presets, output schema enforcement)
- Output parsing and validation (LLM response → `QDSDefinition` via `validateDefinition()`)
- Retry logic for malformed LLM output (re-prompt with error context)
- Confidence-aware generation (directional only, never numeric — enforced by prompt + post-validation)

**Integration Points:**
- Consumes `QDSDefinition` schema from `product/src/types.ts` (REUSE_AS_IS)
- Validates output via `validateDefinition()` (REUSE_AS_IS)
- Uses presets from `product/src/presets.ts` as few-shot examples (REUSE_AS_IS)
- Respects `FORBIDDEN_OUTPUT_FIELD_PATTERNS` from `src/validation.ts` (REUSE_AS_IS)

**Estimated Effort:** 300-500 lines | 5-8 days
**Risk:** MODERATE — LLM output quality depends on prompt engineering; mitigated by existing Zod validation catching non-compliant output.

---

### NN-02: Definition Persistence / Storage

**What:** Durable storage for AI-generated `QDSDefinition` objects so they survive page reloads and can be shared, versioned, and recalled.

**Why Net-New:** Current product uses React `useState` (in-memory only). Presets are hardcoded constants. No persistence layer exists.

**Scope:**
- Storage abstraction interface (get, list, save, delete)
- Local storage implementation (browser localStorage or IndexedDB)
- Optional: API-backed implementation for multi-device access
- Definition metadata (created_at, source: "ai_generated" | "manual" | "preset", generation_prompt)

**Integration Points:**
- Stores `QDSDefinition` objects from `product/src/types.ts` (REUSE_AS_IS)
- Gallery (`product/src/screens/Gallery.tsx`) loads from storage (REUSE_WITH_ADAPTATION)
- App orchestrator (`product/src/App.tsx`) manages persistence lifecycle (REUSE_WITH_ADAPTATION)

**Estimated Effort:** 100-200 lines | 2-3 days
**Risk:** LOW — well-understood problem; existing schema provides clear storage contract.

---

### NN-03: AI-Assisted Weight Optimization

**What:** AI suggests initial scoring weights (0-10) for the answer-pathway weight matrix, based on domain context, question intent, and pathway semantics.

**Why Net-New:** Current Builder requires fully manual weight entry. For AI-generated definitions with many pathways and questions, manual weight entry is friction.

**Scope:**
- Weight suggestion prompt (given pathways + questions + answers, suggest weight matrix)
- Weight normalization (ensure suggested weights are within 0-10 range)
- Human override UI (show AI suggestions with edit capability in existing weight matrix)
- Optional: weight explanation (why AI assigned weight X to answer Y for pathway Z)

**Integration Points:**
- Enhances Builder (`product/src/screens/Builder.tsx`) weight matrix step (REUSE_WITH_ADAPTATION)
- Uses scoring engine thresholds from `product/src/scoring.ts` for calibration reference (REUSE_AS_IS)
- Shares LLM client with NN-01 orchestration layer

**Estimated Effort:** 100-150 lines | 2-3 days
**Risk:** MODERATE — weight quality affects scoring accuracy; mitigated by human review step and tunable confidence thresholds.

---

### NN-04: Batch Generation / Template Cloning

**What:** Generate multiple qualification variants from a single specification (e.g., "Create growth-fit qualifications for SaaS, fintech, and healthcare verticals").

**Scope:**
- Variant specification input (base spec + variation dimensions)
- Batch LLM calls with domain-specific context injection
- Variant comparison view (side-by-side or tabular diff)
- Bulk save to persistence layer

**Integration Points:**
- Uses NN-01 orchestration layer for individual generation
- Stores via NN-02 persistence layer
- Validates each variant via existing `validateDefinition()` (REUSE_AS_IS)

**Estimated Effort:** 50-100 lines | 1-2 days
**Risk:** LOW — compositional over NN-01; no new integration patterns.

---

### NN-05: Definition Version Control / Diff

**What:** Track version history of AI-generated definitions, showing what changed between human edits and AI regenerations.

**Scope:**
- Version metadata (version_number, parent_version, change_source: "ai" | "human", timestamp)
- Structural diff (pathway added/removed, question modified, weight changed)
- Version list UI with rollback capability
- Diff display (inline or side-by-side)

**Integration Points:**
- Extends NN-02 persistence layer with version chain
- Enhances Gallery (`product/src/screens/Gallery.tsx`) with version indicator (REUSE_WITH_ADAPTATION)
- Builder review step shows diff from prior version

**Estimated Effort:** 100-150 lines | 2-3 days
**Risk:** LOW — well-understood pattern; `QDSDefinition` is a flat-enough structure for straightforward diffing.

---

## 3. Effort Summary

| ID | Capability | Lines (est.) | Days (est.) | Risk |
|----|-----------|-------------|------------|------|
| NN-01 | AI Generation Orchestration | 300-500 | 5-8 | MODERATE |
| NN-02 | Definition Persistence | 100-200 | 2-3 | LOW |
| NN-03 | AI Weight Optimization | 100-150 | 2-3 | MODERATE |
| NN-04 | Batch Generation | 50-100 | 1-2 | LOW |
| NN-05 | Definition Versioning | 100-150 | 2-3 | LOW |
| **Total** | | **650-1,100** | **12-19 days** | **LOW-MODERATE** |

---

## 4. Percentage Analysis

| Category | Lines | % of Projected Total |
|----------|-------|---------------------|
| Existing: REUSE_AS_IS | ~2,100 | 36% |
| Existing: REUSE_WITH_ADAPTATION | ~2,000 | 34% |
| Existing: REFERENCE_ONLY (code) | ~800 | 14% |
| Existing: Adaptation work (modifications) | ~350 | 6% |
| **Net-New** | **650-1,100** | **11-19%** |
| **Projected Total** | **~5,900-6,350** | **100%** |

**Net-new ratio: 11-19%** — within or near the 10-15% target range.

The upside variance (up to 19%) is driven by NN-01 (AI orchestration), which is inherently variable depending on prompt complexity and LLM provider integration requirements. If a well-abstracted AI SDK is used (e.g., Vercel AI SDK), NN-01 could compress to the lower bound.

---

## 5. Dependency Chain

```
NN-01 (AI Orchestration)  ←  No dependencies; can start immediately
    ↓
NN-02 (Persistence)       ←  Independent; can start in parallel with NN-01
    ↓
NN-03 (Weight Optimization) ← Depends on NN-01 (shares LLM client)
    ↓
NN-04 (Batch Generation)    ← Depends on NN-01 + NN-02
    ↓
NN-05 (Versioning)          ← Depends on NN-02
```

**Critical path:** NN-01 → NN-03 → NN-04 (8-13 days)
**Parallel path:** NN-02 → NN-05 (4-6 days, runs alongside NN-01)

**Projected calendar time with parallelism: 10-15 days**

---

## 6. What Is NOT Net-New

The following capabilities are sometimes assumed to require new build but are already present:

| Capability | Existing Asset | Status |
|-----------|---------------|--------|
| Qualification schema | `product/src/types.ts` | REUSE_AS_IS |
| Weighted scoring | `product/src/scoring.ts` | REUSE_AS_IS |
| Envelope generation | `src/generator.ts` | REUSE_AS_IS |
| Input validation | `src/validation.ts` | REUSE_AS_IS |
| Governance enforcement | `src/generator.ts` (stamps fields) | REUSE_AS_IS |
| UI rendering | `harness/src/QualificationCard.tsx` et al. | REUSE_AS_IS |
| Manual authoring | `product/src/screens/Builder.tsx` | REUSE_WITH_ADAPTATION |
| Intake execution | `product/src/screens/Intake.tsx` | REUSE_AS_IS |
| Lead capture | `product/src/screens/Result.tsx` | REUSE_AS_IS |
| Template examples | `product/src/presets.ts` | REUSE_AS_IS |
| Host eligibility | `xas/host/hostEligibility.ts` | REUSE_AS_IS |
| Feature flags | `xas/ig1/featureFlagProviders.ts` | REUSE_AS_IS |
| Bounded telemetry | `xas/integration/integrationTelemetry.ts` | REUSE_AS_IS |
| Rollback safety | `xas/ig1/rollbackBeforeAttach.ts` | REUSE_AS_IS |
| Test coverage (~200 tests) | `tests/` + `harness/tests/` + `xas/tests/` | REUSE_AS_IS/ADAPTATION |

This table demonstrates that the JUDO AI Qualification Designer build is **orchestration on top of proven infrastructure**, not a parallel or replacement build.
