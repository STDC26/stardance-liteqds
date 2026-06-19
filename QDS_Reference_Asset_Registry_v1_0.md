# QDS Reference Asset Registry v1.0

**Classification:** Portfolio Source-of-Truth
**Authority:** DRJ / DTC
**Date:** 2026-06-18
**Source Repository:** STDC26/stardance-liteqds
**Freeze Tag:** `liteqds-freeze-v1.0` (substrate) | HEAD `c944bcf` (full inventory)

---

## Purpose

This registry is the authoritative catalog of all reusable qualification assets across the QDS product family. It serves as the portfolio source-of-truth for the JUDO AI Qualification Designer build, mapping every asset's location, classification, protection status, and JUDO integration target.

---

## Section 1: Runtime Assets

These assets constitute the core qualification execution engine.

| Asset Name | Source System | Location | Classification | Reuse Status | Reuse Type | Protected Status | JUDO Mapping |
|-----------|--------------|----------|---------------|-------------|-----------|-----------------|-------------|
| Type System & Domain Model | QDS Lite Runtime | `src/types.ts` | Runtime | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Qualification Execution Layer -- type contract |
| Envelope Generator | QDS Lite Runtime | `src/generator.ts` | Runtime | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Qualification Execution Layer -- generation |
| Input/Output Validation | QDS Lite Runtime | `src/validation.ts` | Runtime | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Qualification Execution Layer -- validation gate |
| F-WIRE Failure Taxonomy | QDS Lite Runtime | `src/f-wire.ts` | Runtime | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Qualification Execution Layer -- error handling |
| Public API Surface | QDS Lite Runtime | `src/index.ts` | Runtime | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Qualification Execution Layer -- API boundary |
| Weighted Scoring Engine | QDS Product MVP | `product/src/scoring.ts` | Runtime | REUSE_AS_IS | Reusable | Post-freeze (additive) | Qualification Execution Layer -- scoring |
| Definition Schema & Validator | QDS Product MVP | `product/src/types.ts` | Runtime | REUSE_AS_IS | Reusable | Post-freeze (additive) | Blueprint Foundation -- schema |
| Immutability Guard | QDS Lite Harness | `harness/src/ImmutabilityGuard.ts` | Runtime | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Governance Framework -- immutability |

### Runtime Summary
- **8 assets** | 7 REUSE_AS_IS, 1 REUSE_AS_IS | 5 FROZEN, 3 additive
- **Flow Engine:** `generator.ts` (deterministic input → envelope transformation)
- **Question Engine:** `product/src/types.ts` QDSQuestion schema + `product/src/screens/Intake.tsx` execution
- **Evidence Engine:** `validation.ts` FORBIDDEN_OUTPUT_FIELD_PATTERNS + `ImmutabilityGuard.ts` deep-freeze
- **Direction Logic:** `types.ts` DirectionalConfidence (3-tier model, never numeric)
- **Confidence Framework:** `scoring.ts` weighted accumulation with tunable gap thresholds
- **Governance Framework:** `generator.ts` stamps governance_class, runtime_authorization, human_review_required
- **CTA Routing:** `product/src/scoring.ts` buildGeneratorInput + `product/src/screens/Result.tsx` interpolation

---

## Section 2: Guided Qualification Assets

These are design-phase reference assets from QDS Guided / QDS C. No executable code exists.

| Asset Name | Source System | Location | Classification | Reuse Status | Reuse Type | Protected Status | JUDO Mapping |
|-----------|--------------|----------|---------------|-------------|-----------|-----------------|-------------|
| SHAPE Phase Model | QDS Guided (design) | Governance docs | Design Reference | REFERENCE_ONLY | Design doctrine | N/A (no code) | Intent Formation Layer (NET_NEW) |
| CPP Recognition Framework | QDS Guided (design) | Governance docs | Design Reference | REFERENCE_ONLY | Design doctrine | N/A (no code) | AI Evidence Recognition (NET_NEW) |
| Recognition Chips | QDS Guided (design) | Governance docs | Design Reference | REFERENCE_ONLY | Design doctrine | N/A (no code) | Blueprint Signals (NET_NEW) |
| Purpose Frames | QDS Guided (design) | Governance docs | Design Reference | REFERENCE_ONLY | Design doctrine | N/A (no code) | Blueprint Foundation metadata (NET_NEW) |
| Reflection Layer | QDS Guided (design) | Governance docs | Design Reference | REFERENCE_ONLY | Design doctrine | N/A (no code) | Post-Qualification Insights (NET_NEW) |
| Directional Read | QDS Guided → QDS Lite | `src/types.ts` (implemented) | Runtime | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Confidence Framework (reuse) |

### Guided Summary
- **6 conceptual assets** | 5 REFERENCE_ONLY, 1 REUSE_AS_IS (directional read, implemented in Lite)
- QDS Guided vision is realized in JUDO through AI-native generation rather than manual SHAPE workflow

---

## Section 3: Studio Assets (Authoring & Builder)

These assets provide the qualification authoring surface.

| Asset Name | Source System | Location | Classification | Reuse Status | Reuse Type | Protected Status | JUDO Mapping |
|-----------|--------------|----------|---------------|-------------|-----------|-----------------|-------------|
| Foundation Builder (Meta + Pathways) | QDS Product MVP | `product/src/screens/Builder.tsx` (steps 1-2) | Studio | REUSE_WITH_ADAPTATION | Reusable | Post-freeze (additive) | Blueprint Foundation |
| Signal Builder (Questions + Weights) | QDS Product MVP | `product/src/screens/Builder.tsx` (step 3) | Studio | REUSE_WITH_ADAPTATION | Reusable | Post-freeze (additive) | Blueprint Signals |
| Activation Builder (CTA + Trust) | QDS Product MVP | `product/src/screens/Builder.tsx` (step 4) | Studio | REUSE_WITH_ADAPTATION | Reusable | Post-freeze (additive) | Blueprint Activation |
| Review & Deploy Flow | QDS Product MVP | `product/src/screens/Builder.tsx` (step 5) | Studio | REUSE_WITH_ADAPTATION | Reusable | Post-freeze (additive) | Blueprint Validation |
| Definition Validation | QDS Product MVP | `product/src/types.ts` validateDefinition() | Studio | REUSE_AS_IS | Reusable | Post-freeze (additive) | Blueprint Validation gate |
| Gallery / Selection Surface | QDS Product MVP | `product/src/screens/Gallery.tsx` | Studio | REUSE_WITH_ADAPTATION | Reusable | Post-freeze (additive) | Blueprint Gallery |
| App Navigation Orchestrator | QDS Product MVP | `product/src/App.tsx` | Studio | REUSE_WITH_ADAPTATION | Reusable | Post-freeze (additive) | JUDO App Shell |
| Fixture Generator | QDS Lite | `fixtures/generate-fixtures.ts` | Studio | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Blueprint Test Fixtures |

### Studio Summary
- **8 assets** | 2 REUSE_AS_IS, 6 REUSE_WITH_ADAPTATION
- **Foundation Builder:** Builder.tsx steps 1-2 (meta, pathways) → Blueprint Foundation
- **Pathways:** Builder.tsx step 2 (pathway CRUD) → Blueprint Pathways
- **Signals:** Builder.tsx step 3 (questions, answers, weight matrix) → Blueprint Signals
- **Questions:** Embedded in Signals step → Blueprint Signals
- **Activation Logic:** Builder.tsx step 4 (CTA config, trust config) → Blueprint Activation
- **Deployment Workflow:** Builder.tsx step 5 (review, validate, save) → Blueprint Validation

---

## Section 4: Template Assets

These assets provide pre-built qualification templates and template execution.

| Asset Name | Source System | Location | Classification | Reuse Status | Reuse Type | Protected Status | JUDO Mapping |
|-----------|--------------|----------|---------------|-------------|-----------|-----------------|-------------|
| Template Library (Presets) | QDS Product MVP | `product/src/presets.ts` | Template | REUSE_AS_IS | Reusable | Post-freeze (additive) | Template Library + AI few-shot examples |
| Template Metadata | QDS Product MVP | `product/src/types.ts` QDSDefinition | Template | REUSE_AS_IS | Reusable | Post-freeze (additive) | Template Metadata schema |
| Template Cloning | QDS Product MVP | Builder.tsx (create from preset) | Template | REUSE_WITH_ADAPTATION | Reusable | Post-freeze (additive) | AI Template Variation |
| Template Execution | QDS Product MVP | `product/src/screens/Intake.tsx` | Template | REUSE_AS_IS | Reusable | Post-freeze (additive) | Qualification Execution |
| Fixture Templates (Learn) | QDS Lite | `fixtures/qds-learn.json` | Template | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Reference: linear routing |
| Fixture Templates (MO) | QDS Lite | `fixtures/qds-mo.json` | Template | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Reference: multi-band routing |
| Fixture Templates (Signal) | QDS Lite | `fixtures/qds-signal.json` | Template | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Reference: branching routing |

### Template Summary
- **7 assets** | 5 REUSE_AS_IS, 1 REUSE_WITH_ADAPTATION, 1 REUSE_AS_IS
- Three preset definitions (growth, learning, adaptation) serve as AI few-shot examples
- Three fixture envelopes demonstrate all routing patterns (linear, multi-band, branching)

---

## Section 5: Rendering & Surface Assets

These assets render qualification envelopes to end users.

| Asset Name | Source System | Location | Classification | Reuse Status | Reuse Type | Protected Status | JUDO Mapping |
|-----------|--------------|----------|---------------|-------------|-----------|-----------------|-------------|
| Qualification Card | QDS Lite Harness | `harness/src/QualificationCard.tsx` | Surface | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Qualification Preview + Live Render |
| Directional Confidence Block | QDS Lite Harness | `harness/src/DirectionalConfidenceBlock.tsx` | Surface | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Confidence Display |
| Governance Signal Strip | QDS Lite Harness | `harness/src/GovernanceSignalStrip.tsx` | Surface | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Governance Badges |
| Trust Limitation Panel | QDS Lite Harness | `harness/src/TrustLimitationPanel.tsx` | Surface | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Trust Display |
| F-WIRE Failure Surface | QDS Lite Harness | `harness/src/FWireFailureSurface.tsx` | Surface | REUSE_AS_IS | PROTECTED_RUNTIME | FROZEN (freeze-v1.0) | Error Surface |
| Result & Lead Capture | QDS Product MVP | `product/src/screens/Result.tsx` | Surface | REUSE_AS_IS | Reusable | Post-freeze (additive) | CTA + Lead Capture |
| Landing Page | QDS Product MVP | `product/src/screens/Landing.tsx` | Surface | REFERENCE_ONLY | Design reference | Post-freeze (additive) | JUDO Landing (NET_NEW) |

### Surface Summary
- **7 assets** | 6 REUSE_AS_IS, 1 REFERENCE_ONLY | 5 FROZEN

---

## Section 6: Governance & Integration Assets

These assets provide governance enforcement, integration patterns, and compliance infrastructure.

| Asset Name | Source System | Location | Classification | Reuse Status | Reuse Type | Protected Status | JUDO Mapping |
|-----------|--------------|----------|---------------|-------------|-----------|-----------------|-------------|
| XAS Adapter | XAS Integration | `xas/adapter/LiteQDSXASAdapter.ts` | Governance | REUSE_AS_IS | Reusable | Out-of-scope (PTC ruling) | Qualification Adapter pattern |
| Host Eligibility | XAS Integration | `xas/host/hostEligibility.ts` | Governance | REUSE_AS_IS | Reusable | Out-of-scope (PTC ruling) | Surface Eligibility |
| Registration Contract | XAS Integration | `xas/registration/liteqds.registration.ts` | Governance | REUSE_WITH_ADAPTATION | Reusable | Out-of-scope (PTC ruling) | JUDO Registration |
| Feature Flag Registry | XAS Integration | `xas/ig1/featureFlagProviders.ts` | Governance | REUSE_AS_IS | Reusable | Out-of-scope (PTC ruling) | Feature Gating |
| Bounded Telemetry | XAS Integration | `xas/integration/integrationTelemetry.ts` | Governance | REUSE_AS_IS | Reusable | Out-of-scope (PTC ruling) | Compliance Telemetry |
| Rollback Protocol | XAS Integration | `xas/ig1/rollbackBeforeAttach.ts` | Governance | REUSE_AS_IS | Reusable | Out-of-scope (PTC ruling) | Safety Invariants |
| Reviewer Group Config | XAS Integration | `xas/ig1/reviewerGroupConfig.ts` | Governance | REUSE_AS_IS | Reusable | Out-of-scope (PTC ruling) | Reviewer Management |
| Registry Insertion Manifest | XAS Integration | `xas/ig1/registryInsertionManifest.ts` | Governance | REUSE_WITH_ADAPTATION | Reusable | Out-of-scope (PTC ruling) | JUDO Manifest Schema |
| Dry-Run Insertion | XAS Integration | `xas/ig1/dryRunInsertion.ts` | Governance | REUSE_AS_IS | Reusable | Out-of-scope (PTC ruling) | Integration Simulation |
| Rollback Drill | XAS Integration | `xas/ig1/rollbackDrill.ts` | Governance | REUSE_AS_IS | Reusable | Out-of-scope (PTC ruling) | Recovery Testing |
| Telemetry Sink | XAS Integration | `xas/integration/integrationTelemetrySink.ts` | Governance | REUSE_AS_IS | Reusable | Out-of-scope (PTC ruling) | Event Storage |
| Internal Review Mount | XAS Integration | `xas/integration/internalReviewSurfaceMount.ts` | Governance | REUSE_WITH_ADAPTATION | Reusable | Out-of-scope (PTC ruling) | Surface Mount pattern |
| Registry/Telemetry Providers | XAS Integration | `xas/ig1/IXAS*.ts` | Governance | REUSE_AS_IS | Reusable | Out-of-scope (PTC ruling) | Provider Abstractions |

### Governance Summary
- **13 assets** | 10 REUSE_AS_IS, 3 REUSE_WITH_ADAPTATION
- All XAS assets are out-of-scope per PTC ruling but preserved as reusable patterns
- Vendor-agnostic abstractions designed for provider swap-in

---

## Section 7: Test & Evidence Assets

| Asset Name | Source System | Location | Classification | Reuse Status | Reuse Type | Protected Status | JUDO Mapping |
|-----------|--------------|----------|---------------|-------------|-----------|-----------------|-------------|
| Generator Acceptance (LCG) | Tests | `tests/panel-generator.spec.ts` | Test | REUSE_AS_IS | Reusable | Active | Qualification Execution tests |
| Fixture Validation | Tests | `tests/fixtures.spec.ts` | Test | REUSE_WITH_ADAPTATION | Reusable | Active | Template Validation tests |
| Harness Acceptance (AS) | Tests | `harness/tests/acceptance.spec.ts` | Test | REUSE_AS_IS | Reusable | Active | Rendering Acceptance tests |
| F-WIRE Validation | Tests | `harness/tests/fwire.spec.ts` | Test | REUSE_AS_IS | Reusable | Active | Error Handling tests |
| Forbidden Behaviors (FB) | Tests | `harness/tests/forbidden.spec.ts` | Test | REUSE_AS_IS | Reusable | Active | Governance Enforcement tests |
| Mobile Visibility (M) | Tests | `harness/tests/mobile.spec.ts` | Test | REUSE_AS_IS | Reusable | Active | Accessibility tests |
| Evidence Capture | Tests | `harness/tests/evidence.spec.ts` | Test | REUSE_AS_IS | Reusable | Active | Evidence Generation tests |
| XAS Integration Tests | Tests | `xas/tests/*.spec.ts` | Test | REUSE_WITH_ADAPTATION | Reusable | Active | Integration Validation tests |
| Evidence Manifests | Evidence | `harness/evidence/`, `xas/evidence/` | Evidence | REUSE_WITH_ADAPTATION | Reusable | Active | Evidence Infrastructure |

### Test Summary
- **9 asset groups** | 6 REUSE_AS_IS, 3 REUSE_WITH_ADAPTATION
- ~200 existing tests validate the pipeline JUDO AI output must satisfy

---

## Section 8: Governance Documentation (Reference)

| Asset Name | Source System | Location | Classification | Reuse Status | Reuse Type | Protected Status | JUDO Mapping |
|-----------|--------------|----------|---------------|-------------|-----------|-----------------|-------------|
| Fail-Closed Protocol | Governance | `FAIL_CLOSED_EXECUTION_PROTOCOL.md` | Doctrine | REFERENCE_ONLY | Governance pattern | Active | JUDO Governance design |
| Persistence Governance | Governance | `PERSISTENCE_GOVERNANCE.md` | Doctrine | REFERENCE_ONLY | Governance pattern | Active | JUDO Persistence design |
| Surface Boundary Map | Governance | `UXC_SURFACE_BOUNDARY_MAP.md` | Doctrine | REFERENCE_ONLY | Governance pattern | Active | JUDO Surface rules |
| Operator Visibility Matrix | Governance | `OPERATOR_VISIBILITY_MATRIX.md` | Doctrine | REFERENCE_ONLY | Governance pattern | Active | JUDO Visibility rules |
| Live Dependency Ledger | Governance | `LIVE_DEPENDENCY_LEDGER.md` | Doctrine | REFERENCE_ONLY | Governance pattern | Active | JUDO Dependency planning |
| Live Attach Risk Matrix | Governance | `LIVE_ATTACH_RISK_MATRIX.md` | Doctrine | REFERENCE_ONLY | Governance pattern | Active | JUDO Risk assessment |

### Governance Documentation Summary
- **6 doctrine documents** | All REFERENCE_ONLY
- Encode the governance principles JUDO must honor

---

## Registry Totals

| Classification | Count | % |
|----------------|-------|---|
| REUSE_AS_IS | 37 | 57% |
| REUSE_WITH_ADAPTATION | 14 | 22% |
| REFERENCE_ONLY | 13 | 20% |
| RETIRE | 0 | 0% |
| NET_NEW_REPLACEMENT | 0 | 0% |
| **Total** | **64** | **100%** |

| Protection Status | Count |
|-------------------|-------|
| FROZEN (freeze-v1.0) | 17 |
| Post-freeze (additive) | 15 |
| Out-of-scope (PTC ruling) | 13 |
| Active (tests/docs) | 13 |
| N/A (design only) | 6 |
