# JUDO QDS Reuse Map v1.0

**Classification:** Architecture Mapping
**Authority:** DRJ / DTC
**Date:** 2026-06-18
**Source:** QDS_Reference_Asset_Registry_v1_0.md, QDS_Asset_Reuse_Audit_Report_v0_1.md

---

## Purpose

This document maps every reusable QDS asset into its target position within the JUDO AI Qualification Designer architecture. Each mapping identifies the existing asset, its JUDO equivalent, the transformation required, and the integration pattern.

---

## JUDO Architecture Overview

The JUDO AI Qualification Designer is organized into six layers:

```
+------------------------------------------------------------------+
|                    JUDO AI Qualification Designer                  |
+------------------------------------------------------------------+
|  1. Blueprint Layer (Authoring & AI Generation)                   |
|     - Blueprint Foundation, Pathways, Signals, Activation         |
+------------------------------------------------------------------+
|  2. Qualification Execution Layer (Runtime)                       |
|     - Flow Engine, Scoring, Validation, Generation                |
+------------------------------------------------------------------+
|  3. Confidence & Governance Layer                                 |
|     - Directional Confidence, Governance Stamps, Trust Signals    |
+------------------------------------------------------------------+
|  4. Surface & Rendering Layer                                     |
|     - Qualification Cards, CTA, Lead Capture, Error Surfaces      |
+------------------------------------------------------------------+
|  5. Integration & Compliance Layer                                |
|     - Host Eligibility, Telemetry, Feature Flags, Registration    |
+------------------------------------------------------------------+
|  6. AI Orchestration Layer (NET NEW)                              |
|     - LLM Integration, Prompt Pipeline, Weight Optimization       |
+------------------------------------------------------------------+
```

---

## Layer 1: Blueprint Layer (Authoring & AI Generation)

### Blueprint Foundation

| Existing Asset | JUDO Asset | Transform | Pattern |
|---------------|-----------|-----------|---------|
| QDS Studio Foundation (Builder.tsx steps 1-2) | Blueprint Foundation | ADAPT | AI pre-fills meta + pathways; human reviews/edits |
| QDSDefinition schema (product/types.ts) | Blueprint Schema | AS_IS | AI generates into this exact schema |
| validateDefinition() (product/types.ts) | Blueprint Validation Gate | AS_IS | Validates AI output before acceptance |
| QDS Guided Purpose Frames (design) | Blueprint Context Framing | INFORM | AI generates purpose framing from natural language |

**Integration Pattern:** AI orchestration layer (Layer 6) generates a draft `QDSDefinition`. The Blueprint Foundation UI displays it in the existing Builder wizard for human review. `validateDefinition()` gates acceptance.

### Blueprint Pathways

| Existing Asset | JUDO Asset | Transform | Pattern |
|---------------|-----------|-----------|---------|
| QDS Studio Routing (Builder.tsx step 2) | Blueprint Pathways | ADAPT | AI suggests pathways from objective description |
| QDSPathway type (product/types.ts) | Pathway Schema | AS_IS | AI generates pathway objects matching this type |
| Preset pathway examples (presets.ts) | Few-shot Examples | AS_IS | Feed to LLM as reference for pathway generation |

**Integration Pattern:** AI generates `QDSPathway[]` array from the user's objective description. Minimum 2 pathways enforced by existing `validateDefinition()`. Builder step 2 allows human add/edit/remove.

### Blueprint Signals

| Existing Asset | JUDO Asset | Transform | Pattern |
|---------------|-----------|-----------|---------|
| QDS Studio Signals (Builder.tsx step 3) | Blueprint Signals | ADAPT | AI generates questions + weight matrix |
| QDSQuestion + QDSAnswerOption types (product/types.ts) | Signal Schema | AS_IS | AI generates question/answer objects matching these types |
| Weight matrix UI (Builder.tsx step 3) | Weight Review Matrix | ADAPT | Show AI-suggested weights with human override |
| QDS Guided CPP Recognition (design) | Signal Recognition | INFORM | AI recognizes capability signals from question structure |

**Integration Pattern:** AI generates `QDSQuestion[]` with weighted `QDSAnswerOption[]` arrays. Weight matrix UI (existing) displays AI suggestions. Humans adjust weights before save. AI weight optimization (NN-03) enhances this step.

### Blueprint Activation

| Existing Asset | JUDO Asset | Transform | Pattern |
|---------------|-----------|-----------|---------|
| QDS Studio Activation (Builder.tsx step 4) | Blueprint Activation | ADAPT | AI generates CTA config + trust limitations |
| QDSCtaConfig type (product/types.ts) | CTA Schema | AS_IS | AI generates CTA with template variables |
| QDSTrustConfig type (product/types.ts) | Trust Schema | AS_IS | AI generates trust limitations and recourse path |
| Template interpolation {{pathway}} pattern (Result.tsx) | CTA Interpolation | AS_IS | Preserve template variable system |

**Integration Pattern:** AI generates `QDSCtaConfig` and `QDSTrustConfig` from context. `{{pathway}}`, `{{name}}`, `{{email}}` interpolation preserved. Builder step 4 shows for human review.

---

## Layer 2: Qualification Execution Layer (Runtime)

| Existing Asset | JUDO Asset | Transform | Pattern |
|---------------|-----------|-----------|---------|
| generateLiteQDSPanel() (generator.ts) | Envelope Generator | AS_IS | AI output flows through unchanged |
| validateGeneratorInput() (validation.ts) | Input Validation Gate | AS_IS | Validates AI-generated LiteQDSGeneratorInput |
| validateEnvelope() (validation.ts) | Output Validation | AS_IS | Non-throwing envelope verification |
| scoreDefinition() (scoring.ts) | Scoring Engine | AS_IS | Weighted accumulation with confidence gaps |
| Intake flow (Intake.tsx) | Qualification Execution | AS_IS | Linear question-per-screen intake |
| F-WIRE codes (f-wire.ts) | Error Taxonomy | AS_IS | Failure categorization for AI-generated flows |
| FNV-1a hashing (generator.ts) | Deterministic ID Generation | AS_IS | Reproducible panel/brief IDs |
| LiteQDSGeneratorInput type (types.ts) | Generator Input Contract | AS_IS | Exact schema AI must produce |
| LiteQDSEnvelope type (types.ts) | Envelope Contract | AS_IS | Exact output format |
| FORBIDDEN_OUTPUT_FIELD_PATTERNS (validation.ts) | AI Constraint Rules | AS_IS | Prompt engineering guardrails |

**Integration Pattern:** This entire layer is REUSE_AS_IS. The execution path is:
1. AI generates `QDSDefinition` (Layer 1)
2. User completes intake via `Intake.tsx`
3. `scoreDefinition()` produces `LiteQDSGeneratorInput`
4. `generateLiteQDSPanel()` produces `LiteQDSEnvelope`
5. Envelope renders through Layer 4

---

## Layer 3: Confidence & Governance Layer

| Existing Asset | JUDO Asset | Transform | Pattern |
|---------------|-----------|-----------|---------|
| DirectionalConfidence (types.ts) | Confidence Model | AS_IS | 3-tier directional (never numeric) |
| DIRECTIONAL_CONFIDENCE_LABEL (types.ts) | Confidence Labels | AS_IS | Human-readable confidence names |
| governance_class stamp (generator.ts) | Governance Class | AS_IS | Fixed "lite_experimental" |
| runtime_authorization stamp (generator.ts) | Authorization Status | AS_IS | Fixed "not_authorized" |
| human_review_required stamp (generator.ts) | Review Requirement | AS_IS | Fixed true |
| Confidence gap thresholds (scoring.ts) | Threshold Tuning | AS_IS | Tunable [qualThreshold, mixedThreshold] |
| QDS Guided Directional Read (design) | Directional Read | IMPLEMENTED | Already in QDS Lite as DirectionalConfidence |

**Integration Pattern:** Governance is injected by construction. The generator stamps compliance fields regardless of AI input. AI cannot produce non-compliant output because compliance enforcement is downstream of the AI boundary.

---

## Layer 4: Surface & Rendering Layer

| Existing Asset | JUDO Asset | Transform | Pattern |
|---------------|-----------|-----------|---------|
| QualificationCard.tsx | Qualification Preview & Render | AS_IS | Renders any valid LiteQDSEnvelope |
| DirectionalConfidenceBlock.tsx | Confidence Display | AS_IS | Directional-only rendering |
| GovernanceSignalStrip.tsx | Governance Badges | AS_IS | 3 badges, mobile-hard-locked |
| TrustLimitationPanel.tsx | Trust Display | AS_IS | Expandable, first-always-visible |
| FWireFailureSurface.tsx | Error Surface | AS_IS | Component-owned error display |
| Result.tsx (lead capture + CTA) | CTA & Lead Capture | AS_IS | Template interpolation + form |
| Gallery.tsx | Blueprint Gallery | ADAPT | Add AI-generated definition cards |
| Landing.tsx | JUDO Landing | REFERENCE | Messaging rewrite needed |
| ImmutabilityGuard.ts | Immutability Enforcement | AS_IS | Deep-freeze verification |
| App.tsx (harness) | Validation Orchestrator | AS_IS | Viewport, host, band checks |

**Integration Pattern:** All rendering components accept `LiteQDSEnvelope`. AI-generated envelopes that pass validation render identically to manually-created ones. QualificationCard serves as the live preview in the Builder review step.

---

## Layer 5: Integration & Compliance Layer

| Existing Asset | JUDO Asset | Transform | Pattern |
|---------------|-----------|-----------|---------|
| LiteQDSXASAdapter | Qualification Adapter | AS_IS | Validation → freeze → render pipeline |
| hostEligibility.ts | Surface Eligibility | AS_IS | Allowlist/blocklist enforcement |
| featureFlagProviders.ts | Feature Gating | AS_IS | Swappable registry, fail-closed |
| integrationTelemetry.ts | Compliance Telemetry | AS_IS | Bounded metadata, dual defense |
| integrationTelemetrySink.ts | Event Storage | AS_IS | Append-only JSONL |
| rollbackBeforeAttach.ts | Safety Invariants | AS_IS | Detach-before-attach protocol |
| reviewerGroupConfig.ts | Reviewer Management | AS_IS | Config-only, no hardcoded IDs |
| IXASRegistryProvider.ts | Registry Abstraction | AS_IS | Vendor-agnostic with dry-run |
| IXASTelemetryProvider.ts | Telemetry Abstraction | AS_IS | Append-only provider interface |
| dryRunInsertion.ts | Integration Simulation | AS_IS | Evidence-generating simulation |
| rollbackDrill.ts | Recovery Testing | AS_IS | Chaos engineering drill |
| liteqds.registration.ts | Registration Pattern | ADAPT | JUDO registration contract |
| registryInsertionManifest.ts | Manifest Schema | ADAPT | JUDO manifest schema |
| internalReviewSurfaceMount.ts | Surface Mount | ADAPT | JUDO surface mount logic |

**Integration Pattern:** The integration layer is vendor-agnostic by design. JUDO registers as a new XAS component following the existing `liteqds.registration.ts` pattern. All provider abstractions (registry, flags, telemetry) accept new implementations without code changes.

---

## Layer 6: AI Orchestration Layer (NET NEW)

| JUDO Asset | Build Type | Depends On | Description |
|-----------|-----------|-----------|-------------|
| AI Generation Orchestration (NN-01) | NET_NEW | Layer 1 schemas | LLM integration + prompt pipeline + output parsing |
| Definition Persistence (NN-02) | NET_NEW | Layer 1 schemas | Storage layer for AI-generated definitions |
| AI Weight Optimization (NN-03) | NET_NEW | NN-01 + Layer 2 scoring | AI-suggested scoring weights |
| Batch Generation (NN-04) | NET_NEW | NN-01 + NN-02 | Multiple variants from single spec |
| Definition Versioning (NN-05) | NET_NEW | NN-02 | Version tracking and diff |

**Integration Pattern:** Layer 6 sits on top of all other layers. It produces `QDSDefinition` objects (Layer 1 schema) which flow through the existing execution (Layer 2), governance (Layer 3), rendering (Layer 4), and compliance (Layer 5) layers without modification.

---

## Reuse Flow Diagram

```
USER INPUT (natural language specification)
    │
    ▼
┌─────────────────────────────────────┐
│  Layer 6: AI Orchestration (NET NEW) │
│  - LLM generates QDSDefinition      │
│  - AI suggests weights               │
│  - Batch variation                   │
└──────────────┬──────────────────────┘
               │ QDSDefinition
               ▼
┌─────────────────────────────────────┐
│  Layer 1: Blueprint (ADAPT)          │
│  - Builder.tsx shows AI draft        │
│  - Human reviews/edits               │
│  - validateDefinition() gates save   │
└──────────────┬──────────────────────┘
               │ Validated QDSDefinition
               ▼
┌─────────────────────────────────────┐
│  Layer 2: Execution (AS_IS)          │
│  - Intake.tsx runs questions         │
│  - scoreDefinition() scores answers  │
│  - generateLiteQDSPanel() envelopes  │
└──────────────┬──────────────────────┘
               │ LiteQDSEnvelope
               ▼
┌─────────────────────────────────────┐
│  Layer 3: Governance (AS_IS)         │
│  - governance_class stamped          │
│  - runtime_authorization stamped     │
│  - human_review_required stamped     │
└──────────────┬──────────────────────┘
               │ Governed Envelope
               ▼
┌─────────────────────────────────────┐
│  Layer 4: Surface (AS_IS)            │
│  - QualificationCard renders         │
│  - Result.tsx shows CTA + capture    │
│  - FWireFailureSurface on error      │
└──────────────┬──────────────────────┘
               │ Rendered Output
               ▼
┌─────────────────────────────────────┐
│  Layer 5: Compliance (AS_IS)         │
│  - Host eligibility enforced         │
│  - Bounded telemetry recorded        │
│  - Immutability verified             │
└─────────────────────────────────────┘
```

---

## Mapping Summary

| JUDO Layer | Assets Mapped | From AS_IS | From ADAPT | From REFERENCE | NET_NEW |
|-----------|--------------|-----------|-----------|---------------|---------|
| 1. Blueprint | 14 | 7 | 5 | 2 | 0 |
| 2. Execution | 10 | 10 | 0 | 0 | 0 |
| 3. Governance | 7 | 7 | 0 | 0 | 0 |
| 4. Surface | 10 | 8 | 1 | 1 | 0 |
| 5. Compliance | 14 | 11 | 3 | 0 | 0 |
| 6. AI Orchestration | 5 | 0 | 0 | 0 | 5 |
| **Total** | **60** | **43** | **9** | **3** | **5** |

**72% of JUDO assets map directly to existing code (AS_IS).**
**15% require adaptation of existing code.**
**8% are NET_NEW capabilities.**
**5% use existing assets as design reference.**
