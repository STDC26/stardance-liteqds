# QDS Asset Reuse Audit Report v0.1

**Classification:** Pre-Build Audit / Reuse Validation
**Authority:** DRJ / DTC
**Date:** 2026-06-18
**Branch Audited:** `u1-uat` (HEAD: c944bcf)
**Base:** `rebuild/liteqds-g1-recovery-v1`

---

## 1. Executive Summary

This audit evaluates all existing QDS Lite, QDS Product, QDS Runtime, QDS Harness, XAS Integration, and Governance assets for reuse potential in the planned **JUDO AI Qualification Designer** build.

**Finding: 78% of existing assets are reusable (as-is or with adaptation).** The remaining 22% consists of net-new capabilities required for AI-native generation, prompt orchestration, and persistence — none of which invalidate prior investment.

**Recommendation: PROCEED_TO_JUDO_AI_QUALIFICATION_DESIGNER_BUILD_PLAN**

The existing codebase provides a complete, governance-certified qualification runtime, rendering pipeline, scoring engine, and authoring surface. The JUDO AI Qualification Designer build is primarily an **orchestration and AI generation layer** on top of proven infrastructure — not a rewrite.

---

## 2. Audit Scope

### Assets Reviewed

| System | Files | Lines (non-test) | Status |
|--------|-------|-------------------|--------|
| QDS Runtime (src/) | 5 | 411 | Fully reviewed |
| QDS Harness (harness/src/) | 8 | ~423 | Fully reviewed |
| QDS Product MVP (product/src/) | 10 | ~1,113 | Fully reviewed |
| QDS Fixtures | 4 | ~319 | Fully reviewed |
| XAS Integration (xas/) | 22 | ~2,096 | Fully reviewed |
| Test Suites | 18 | ~900+ | Fully reviewed |
| Governance Docs | 20+ | N/A | Fully reviewed |
| **Total** | **~87** | **~5,262** | **Complete** |

### Not Authorized (Confirmed Not Done)

- No new feature implementation
- No runtime refactor
- No scoring changes
- No service endpoint changes
- No LLM integration
- No UI redesign

---

## 3. Asset-by-Asset Findings

### 3.1 QDS Runtime (src/) — REUSE_AS_IS

The core runtime is the highest-value reuse target. It provides:

- **Type System (types.ts, 89 lines):** Domain-agnostic type definitions including `LiteQDSGeneratorInput`, `LiteQDSEnvelope`, `LiteQDSPanelSpec`, `LiteQDSInsertionBrief`, `VerdictOption`, directional confidence model (3-tier, never numeric). These types define the exact contract an AI generator must satisfy.

- **Generator (generator.ts, 72 lines):** Deterministic envelope generator using FNV-1a hashing for reproducible panel/brief IDs. Takes validated input, stamps governance fields (`governance_class="lite_experimental"`, `runtime_authorization="not_authorized"`, `human_review_required=true`), returns frozen envelope. This is the exact function AI-generated qualifications would flow through.

- **Validation (validation.ts, 182 lines):** Comprehensive Zod schema validation with fail-closed error handling. Enforces `FORBIDDEN_OUTPUT_FIELD_PATTERNS` (rejects numeric confidence, institutional vocabulary, DTOs, decision traces). Provides both throwing (`validateGeneratorInput`) and non-throwing (`validateEnvelope`) validation modes.

- **F-WIRE Failure Codes (f-wire.ts, 32 lines):** Six categorized failure codes with operator-facing messages. Machine-readable error taxonomy for generation, validation, and rendering failures.

- **Public API Surface (index.ts, 36 lines):** Clean barrel export controlling the full public interface.

**Reuse Classification:** REUSE_AS_IS
**Evidence:** All 5 files are pure, deterministic, and governance-certified. The AI Qualification Designer would call `generateLiteQDSPanel()` directly after producing `LiteQDSGeneratorInput` via AI generation. Zero modification required.

### 3.2 QDS Harness / Rendering (harness/src/) — REUSE_AS_IS

The rendering pipeline provides certified, governance-compliant UI components:

- **QualificationCard.tsx (67 lines):** Canonical rendered form of a qualification envelope. Renders governance strip, header, confidence block, verdict options, trust limitations, recourse path. Would serve as the live preview component in the AI designer.

- **DirectionalConfidenceBlock.tsx (25 lines):** Renders directional confidence with human-readable labels. Enforces "never numeric" invariant.

- **GovernanceSignalStrip.tsx (31 lines):** Three governance badges (governance class, runtime authorization, human review required). Always visible, mobile-hard-locked.

- **TrustLimitationPanel.tsx (57 lines):** Expandable trust limitations with first-item-always-visible guarantee (M-01/AS-11). Clean expand/collapse UX.

- **FWireFailureSurface.tsx (33 lines):** Component-owned error surface (not host-branded). Renders F-WIRE code + operator message + optional detail.

- **ImmutabilityGuard.ts (22 lines):** Deep-freeze and deep-frozen verification utilities. Ensures envelope immutability during rendering lifecycle.

- **App.tsx (178 lines):** Orchestration component with variant injection, viewport validation, host eligibility checks, and `window.__LITEQDS__` introspection API.

**Reuse Classification:** REUSE_AS_IS
**Evidence:** These components render any valid `LiteQDSEnvelope`. AI-generated envelopes that pass validation will render correctly with zero component changes. QualificationCard is the natural preview component for designer output.

### 3.3 QDS Product MVP (product/src/) — REUSE_WITH_ADAPTATION

The product layer contains the most directly reusable authoring and scoring infrastructure:

- **Types (types.ts, 99 lines):** Domain-agnostic `QDSDefinition` schema covering pathways, questions, answer options with weighted scoring, CTA config with `{{template}}` interpolation, trust config, and confidence thresholds. Includes `validateDefinition()` fail-closed validator. **Critical reuse** — this is the schema AI would generate into.

- **Scoring Engine (scoring.ts, 122 lines):** Generic weighted-accumulation scoring with tunable confidence gap thresholds. Maps pathway scores to directional confidence levels. Constructs `LiteQDSGeneratorInput` from scored results. **Critical reuse** — scoring logic is domain-agnostic.

- **Builder (Builder.tsx, 355 lines):** 5-step wizard for manual QDS authoring (meta, pathways, questions, CTA/trust, review). Weight matrix UI (answers x pathways, 0-10 scale). **Reuse with adaptation** — the AI designer would replace manual entry with AI generation but retain the review/edit step and weight matrix for human refinement.

- **Presets (presets.ts, 256 lines):** Three complete, production-ready QDS definitions demonstrating different domains (growth fit, learning fit, adaptation readiness). **Reuse as-is** as few-shot examples for AI prompt engineering.

- **Intake (Intake.tsx, 80 lines):** Linear question-per-screen intake flow with progress tracking. **Reuse as-is** for qualification execution.

- **Result (Result.tsx, 106 lines):** Result display with QualificationCard rendering, CTA interpolation, and lead capture form. **Reuse as-is**.

- **Gallery (Gallery.tsx, 50 lines):** Definition browser with card grid. **Reuse with adaptation** to add AI-generated definitions alongside presets.

- **App.tsx (151 lines):** Screen navigation orchestrator (landing → gallery → builder → intake → result). **Reuse with adaptation** to add AI generation flow.

- **Landing (Landing.tsx, 40 lines):** Onboarding page. **Reference only** (messaging is product-specific).

**Reuse Classification:** REUSE_WITH_ADAPTATION (overall), with several sub-assets REUSE_AS_IS
**Evidence:** The QDSDefinition schema, scoring engine, intake flow, and result display are domain-agnostic. Builder needs adaptation to support AI-generated drafts. Presets serve as AI training examples.

### 3.4 QDS Fixtures & Templates — REUSE_AS_IS

- **generate-fixtures.ts (162 lines):** Deterministic fixture generator that invokes real `generateLiteQDSPanel()` to produce validated envelopes. Pattern directly reusable for generating AI qualification fixtures.

- **Three fixture JSONs (qds-learn, qds-mo, qds-signal):** Reference envelopes demonstrating linear routing, multi-band routing, and branching signal patterns. Serve as validation references and AI prompt examples.

**Reuse Classification:** REUSE_AS_IS
**Evidence:** Fixtures are schema-valid outputs of the real generator. They demonstrate all three routing patterns the AI designer must support.

### 3.5 XAS Integration Layer (xas/) — REUSE_WITH_ADAPTATION

The XAS layer provides vendor-agnostic governance infrastructure:

- **Adapter (LiteQDSXASAdapter.ts, 82 lines):** Pure-functional validation → freezing → render pipeline. Validates envelopes, checks host eligibility, deep-freezes, returns render target. **Reuse as-is** — AI-generated envelopes flow through the same adapter.

- **Host Eligibility (hostEligibility.ts, 54 lines):** Dual-enforcement allowlist/blocklist for surface eligibility. Fail-closed. **Reuse as-is**.

- **Registration Contract (liteqds.registration.ts, 175 lines):** Comprehensive XAS component registration with governance, trust signals, failure handling, promotion blocking, and provenance tracking. **Reuse with adaptation** — AI Qualification Designer needs its own registration contract following this pattern.

- **Feature Flag Architecture (featureFlagProviders.ts, 68 lines + XASFeatureFlagProvider.ts, 40 lines):** Swappable provider registry with fail-closed defaults. **Reuse as-is** — AI designer features can use same flag architecture.

- **Bounded Telemetry (integrationTelemetry.ts, 141 lines):** Allowlist + forbidden-pattern dual defense. Append-only, non-outbound, bounded metadata only. **Reuse as-is** — critical for AI designer compliance.

- **Registry Insertion Manifest (registryInsertionManifest.ts, 148 lines):** Zod-validated declarative manifest encoding governance, rollback, telemetry, and host bindings. **Reuse with adaptation** for AI designer manifest.

- **Rollback-Before-Attach Protocol (rollbackBeforeAttach.ts, 68 lines):** Safety invariant ensuring detach path exists before attach. **Reuse as-is** — applicable to any staged deployment.

- **Reviewer Group Config (reviewerGroupConfig.ts, 74 lines):** Config-only reviewer binding with identity-pattern rejection. **Reuse as-is**.

- **Dry-Run Insertion (dryRunInsertion.ts, 144 lines) + Rollback Drill (rollbackDrill.ts, 153 lines):** Full simulation and chaos-engineering patterns. **Reuse as-is** for AI designer integration testing.

- **Evidence Build Scripts (3 files, ~324 lines):** Deterministic evidence generation with manifest verification. **Reuse with adaptation**.

- **Harness Apps (XASApp.tsx, InternalReviewSurface.tsx, ~356 lines):** Integration test harnesses. **Reference only** for AI designer testing patterns.

**Reuse Classification:** REUSE_WITH_ADAPTATION (overall)
**Evidence:** The XAS layer's vendor-agnostic abstractions (registry, flags, telemetry) are designed for provider swap-in. AI Qualification Designer would register as a new XAS component using established patterns.

### 3.6 Test Suites — REUSE_WITH_ADAPTATION

- **Generator Tests (panel-generator.spec.ts, 192 lines):** LCG-01..10 acceptance + fail-closed + determinism tests. **Reuse as-is** — these validate the generator that AI output flows through.

- **Fixture Validation Tests (fixtures.spec.ts, 56 lines):** Schema + trust signal validation. **Reuse with adaptation** to include AI-generated fixtures.

- **Harness Acceptance Tests (acceptance.spec.ts, 178 lines):** AS-01..16 covering content, governance, immutability, host routing. **Reuse as-is**.

- **F-WIRE Tests (fwire.spec.ts, 65 lines), Forbidden Tests (forbidden.spec.ts, 122 lines), Mobile Tests (mobile.spec.ts, 47 lines):** Behavioral enforcement. **Reuse as-is**.

- **XAS Tests (~300+ lines across 4 files):** Integration validation. **Reuse with adaptation**.

**Reuse Classification:** REUSE_WITH_ADAPTATION
**Evidence:** ~200 existing tests validate the runtime, rendering, and governance pipeline that AI-generated output must satisfy. Tests require extension, not replacement.

### 3.7 Governance Documentation — REFERENCE_ONLY

20+ governance documents encode critical doctrine:

- **Fail-Closed Execution Protocol:** Every dependency failure resolves to safe state (not mounted / detached).
- **Persistence Governance (PERSIST-01..07):** Artifact provenance and recovery requirements.
- **Surface Boundary Map:** Eligible/forbidden host surfaces with F-WIRE enforcement.
- **Operator Visibility Matrix:** All state transitions operator-visible; no silent partial states.
- **Live Dependency Ledger (LD-01..07):** Gate-by-gate execution blocking with explicit ownership.
- **Live Attach Risk Matrix (R-01..06):** Risk classification with mitigations.
- **Staged Promotion Model (IG-0 → IG-4):** Each stage requires separate certification.

**Reuse Classification:** REFERENCE_ONLY
**Evidence:** These documents encode the governance principles the AI Qualification Designer must honor but are not directly executable code. They should inform the AI designer's governance layer design.

---

## 4. Reuse Summary

| Classification | Asset Count | Lines | % of Codebase |
|----------------|-------------|-------|---------------|
| REUSE_AS_IS | 28 | ~2,100 | 40% |
| REUSE_WITH_ADAPTATION | 22 | ~2,000 | 38% |
| REFERENCE_ONLY | 25+ | ~800 (code) + docs | 15% |
| RETIRE | 0 | 0 | 0% |
| NET_NEW_REQUIRED | N/A | ~650-1,000 est. | ~7-12% |

**Total Reuse Rate: ~78% (REUSE_AS_IS + REUSE_WITH_ADAPTATION)**

This exceeds the 70-85% reuse target specified in the audit charter.

---

## 5. Gap Analysis

### Missing Capabilities (NET_NEW_REQUIRED)

1. **AI Generation Orchestration Layer** — Prompt engineering, LLM integration, and output parsing to produce `LiteQDSGeneratorInput` from natural language or structured specifications. Estimated: 300-500 lines.

2. **Definition Persistence / Storage** — Current product uses in-memory state only. AI-generated definitions need persistence (local storage, API, or database). Estimated: 100-200 lines.

3. **AI-Assisted Weight Optimization** — Current Builder requires manual weight entry (0-10 per answer-pathway pair). AI could suggest initial weights based on domain context. Estimated: 100-150 lines.

4. **Batch Generation / Template Cloning** — Generate multiple qualification variants from a single specification. Estimated: 50-100 lines.

5. **Version Control / Diff for Definitions** — Track AI-generated definition versions and human edits. Estimated: 100-150 lines.

**Total Net-New Estimate: 650-1,100 lines (~12-20% of current codebase)**

### No Obsolete Assets Identified

Every reviewed asset serves either direct reuse or reference value. No assets recommended for retirement.

---

## 6. Architectural Assessment

### Strengths Enabling AI Qualification Designer

1. **Clean Input Contract:** `LiteQDSGeneratorInput` is the exact schema AI must produce — well-defined, Zod-validated, with explicit constraints.

2. **Governance by Construction:** Governance fields are stamped by the generator, not the caller. AI cannot produce non-compliant output because compliance is injected downstream.

3. **Deterministic Pipeline:** Input → Validation → Generation → Envelope → Rendering is pure and deterministic. AI output slots into the existing pipeline at the input boundary.

4. **Domain-Agnostic Scoring:** The weighted-accumulation scoring engine works for any qualification domain without modification.

5. **Vendor-Agnostic Abstractions:** Registry, feature flags, and telemetry are interface-driven with pluggable providers. AI capabilities can be added as new providers without modifying integration code.

6. **Existing Presets as Few-Shot Examples:** Three production-quality QDSDefinitions serve as reference examples for AI prompt engineering.

### Risks

1. **Single Governance Class:** Current system only supports `lite_experimental`. AI Qualification Designer may need `proto_experimental` or higher governance classes, which would require a new generator path (not a modification of the existing one).

2. **No Persistence Layer:** All state is in-memory or fixture-based. AI-generated definitions need durable storage.

3. **No Multi-Tenant Support:** Current system is single-operator. AI designer serving multiple users would need tenant isolation.

---

## 7. Recommendation

**PROCEED_TO_JUDO_AI_QUALIFICATION_DESIGNER_BUILD_PLAN**

The evidence supports the governing claim: "Next build should be orchestration and AI generation, not a rewrite."

- **78% reuse rate** exceeds the 70-85% target.
- **0% retirement rate** — no prior investment is wasted.
- **Net-new work is narrowly scoped** to AI orchestration, persistence, and batch capabilities.
- **Governance pipeline is reusable by construction** — AI-generated output flows through the same certified validation, generation, and rendering path.

The JUDO AI Qualification Designer build should proceed as an **additive orchestration layer** that:
1. Accepts natural language or structured specifications
2. Produces `QDSDefinition` or `LiteQDSGeneratorInput` via LLM
3. Validates through existing Zod schemas
4. Generates envelopes through existing `generateLiteQDSPanel()`
5. Renders through existing certified components
6. Persists definitions via new storage layer

This approach maximizes prior investment, minimizes build risk, and maintains governance certification continuity.
