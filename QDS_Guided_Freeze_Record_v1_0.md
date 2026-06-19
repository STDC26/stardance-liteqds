# QDS Guided (QDS C) Freeze Record v1.0

**Classification:** DESIGN_PHASE_REFERENCE
**Authority:** DRJ / DTC
**Date:** 2026-06-18
**Repository:** N/A (no standalone codebase)

---

## Status Determination

**QDS Guided / QDS C does not have a standalone codebase on this machine or in a separate repository.** The Guided qualification concepts (SHAPE phases, CPP recognition, purpose frames, reflection layer, directional read) exist as:

1. **Design doctrine** referenced in governance documents within `stardance-liteqds`
2. **Architectural vision** for the broader QDS product family
3. **Conceptual assets** that informed the QDS Lite runtime design

This freeze record documents the state of QDS Guided as a **design-phase reference** rather than a code freeze.

## Freeze State

| Field | Value |
|-------|-------|
| **State** | DESIGN_PHASE_REFERENCE (no codebase to freeze) |
| **Freeze Tag** | N/A -- no code artifacts exist to tag |
| **Codebase Status** | Not implemented as standalone system |
| **Design Status** | Captured in governance docs within stardance-liteqds |
| **Relationship** | Conceptual parent of QDS Lite simplified runtime |

## QDS Guided Conceptual Assets (Doctrine Only)

The following QDS Guided concepts are documented as design references but have no executable implementation:

### SHAPE Phase Model
- **Status:** REFERENCE_ONLY
- **Description:** Multi-phase qualification progression (Situation, Hypothesis, Assessment, Proposal, Evidence)
- **Evidence:** Referenced in governance docs as the full-fidelity qualification model that QDS Lite simplifies
- **JUDO Mapping:** Intent Formation Layer (to be built as net-new with AI generation)

### CPP Recognition Framework
- **Status:** REFERENCE_ONLY
- **Description:** Capability-Problem-Proof recognition chip system for structured evidence capture
- **Evidence:** Conceptual framework; no code implementation
- **JUDO Mapping:** AI Evidence Recognition (net-new with LLM-powered recognition)

### Purpose Frames
- **Status:** REFERENCE_ONLY
- **Description:** Structured framing of qualification purpose and context
- **Evidence:** Design concept; partially realized in QDS Lite as `qualification_type` + `panel_subject_label`
- **JUDO Mapping:** Blueprint Foundation metadata

### Reflection Layer
- **Status:** REFERENCE_ONLY
- **Description:** Post-qualification reflection and learning capture
- **Evidence:** Design concept; not implemented
- **JUDO Mapping:** Post-Qualification Insights (net-new)

### Directional Read
- **Status:** REFERENCE_ONLY (partially implemented in QDS Lite)
- **Description:** Non-binding, directional-only confidence assessment
- **Evidence:** Implemented in QDS Lite as `DirectionalConfidence` (3-tier model) in `src/types.ts`
- **JUDO Mapping:** Confidence Framework (REUSE_AS_IS from QDS Lite)

### Supporting Evidence / Open Questions / Next Best Evidence
- **Status:** REFERENCE_ONLY
- **Description:** Evidence management and gap analysis for qualification decisions
- **Evidence:** Design concepts; not implemented as code
- **JUDO Mapping:** AI Evidence Engine (net-new with LLM analysis)

## Relationship to QDS Lite

QDS Guided represents the full-fidelity qualification vision. QDS Lite was built as a deliberately simplified subset:

| QDS Guided Concept | QDS Lite Implementation | Status |
|--------------------|------------------------|--------|
| SHAPE phases | Single-pass intake flow | Simplified |
| CPP recognition | Weighted verdict options | Simplified |
| Purpose frames | qualification_type + panel_subject_label | Simplified |
| Directional read | DirectionalConfidence (3-tier) | Implemented |
| Reflection layer | Not present | Design only |
| Evidence management | trust_surface_limitations | Simplified |
| Review structure | human_review_required=true | Implemented |

## Freeze Rules

1. QDS Guided design concepts are preserved as reference material for JUDO AI Qualification Designer.
2. No new QDS Guided codebase will be created -- capabilities will be realized through JUDO AI Qualification Designer's AI-native approach.
3. QDS Guided concepts that require implementation map to NET_NEW capabilities in the JUDO architecture.
4. The directional read concept (already implemented in QDS Lite) is classified as REUSE_AS_IS.

## Implications for JUDO AI Qualification Designer

QDS Guided's conceptual assets inform JUDO's architecture but are not directly reusable as code. The key insight: **JUDO replaces the manual SHAPE/CPP workflow with AI-generated qualification flows**, making QDS Guided a design reference rather than a reuse source.

| QDS Guided Vision | JUDO AI Equivalent | Build Type |
|-------------------|--------------------|------------|
| Multi-phase SHAPE progression | AI-generated question sequences | NET_NEW (AI orchestration) |
| Manual CPP recognition | AI-powered capability matching | NET_NEW (LLM integration) |
| Hand-crafted purpose frames | AI-generated qualification framing | NET_NEW (prompt engineering) |
| Manual reflection | AI-suggested insights | NET_NEW (post-processing) |
| Directional read | Reuse QDS Lite DirectionalConfidence | REUSE_AS_IS |
| Evidence capture | AI evidence analysis | NET_NEW (LLM integration) |

## Verification

Since no codebase exists to verify, this freeze record is validated by:

1. Confirming no QDS Guided repository exists on the development machine
2. Confirming no QDS Guided code exists within `stardance-liteqds`
3. Confirming QDS Guided references in governance docs are design-only
4. Cross-referencing with QDS_Asset_Reuse_Audit_Report_v0_1.md (which audited all code in the repository and found no Guided implementation)
