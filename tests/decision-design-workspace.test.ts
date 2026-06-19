// JUDO DDW Sprint 1 — Acceptance Tests (Spec v1.1 §14, T1–T12)
// + Addendum conformance checks

import { describe, it, expect, beforeEach } from "vitest";
import {
  initializeFixtureSession,
  generateDesign,
  markUnderReview,
  approveForQdsHandoff,
  rejectDesign,
  requestRefinement,
  resetSession,
  getSession,
} from "../product/src/judo/decision-design-store";
import type {
  DecisionDesignSession,
  CandidateQualificationSystem,
} from "../product/src/judo/types";

function session(): DecisionDesignSession {
  const s = getSession();
  if (!s) throw new Error("No session");
  return s;
}

function design(): CandidateQualificationSystem {
  const d = session().design;
  if (!d) throw new Error("No design");
  return d;
}

describe("JUDO DDW Sprint 1 Acceptance Tests", () => {
  beforeEach(() => {
    initializeFixtureSession();
  });

  // T1: Fixture loads
  it("T1 — fixture loads with correct prompt", () => {
    const s = session();
    expect(s.prompt).toBe("Should we expand into healthcare?");
    expect(s.fixtureId).toBe("fixture-healthcare-expansion-001");
    expect(s.decisionType).toBe("OPPORTUNITY_QUALIFICATION");
    expect(s.status).toBe("DRAFT");
  });

  // T2: SHAPE frame exists
  it("T2 — SHAPE frame has context, type, uncertainty types, desired outcome", () => {
    const s = session();
    expect(s.shape.decisionContext).toBeTruthy();
    expect(s.shape.decisionType).toBe("Opportunity Qualification");
    expect(s.shape.uncertaintyTypes).toContain("market");
    expect(s.shape.uncertaintyTypes).toContain("capability");
    expect(s.shape.uncertaintyTypes).toContain("risk");
    expect(s.shape.uncertaintyTypes).toContain("timing");
    expect(s.shape.desiredOutcome).toBeTruthy();
    expect(s.shape.framingNotes.length).toBeGreaterThan(0);
  });

  // T3: ALIGN ≥5 questions
  it("T3 — ALIGN has ≥5 qualification questions", () => {
    const s = session();
    expect(s.align.qualificationQuestions.length).toBeGreaterThanOrEqual(5);
    expect(s.align.qualificationTarget).toBeTruthy();
    expect(s.align.assumptions.length).toBeGreaterThan(0);
    expect(s.align.constraints.length).toBeGreaterThan(0);
    expect(s.align.successDefinition).toBeTruthy();
  });

  // T4: Candidate design generates
  it("T4 — generateDesign() yields a design", () => {
    generateDesign();
    expect(session().design).toBeTruthy();
    expect(session().status).toBe("DESIGN_GENERATED");
  });

  // T5: Required design structure
  it("T5 — design has ≥5 criteria, ≥7 evidence, ≥8 questions, confidence model, directional mapping, governance notes", () => {
    generateDesign();
    const d = design();
    expect(d.criteria.length).toBeGreaterThanOrEqual(5);
    expect(d.evidenceRequirements.length).toBeGreaterThanOrEqual(7);
    expect(d.questionPlan.length).toBeGreaterThanOrEqual(8);
    expect(d.confidenceModel).toBeTruthy();
    expect(d.confidenceModel.confidenceBand).toBeTruthy();
    expect(d.directionalReadMapping).toBeTruthy();
    expect(d.directionalReadMapping.accelerate).toBeTruthy();
    expect(d.directionalReadMapping.refine).toBeTruthy();
    expect(d.directionalReadMapping.cultivate).toBeTruthy();
    expect(d.directionalReadMapping.archive).toBeTruthy();
    expect(d.governanceNotes.length).toBeGreaterThan(0);
  });

  // T6: Human approval required
  it("T6 — pre-approval handoff ready=false with blocker", () => {
    generateDesign();
    const d = design();
    expect(d.qdsHandoffReadiness.ready).toBe(false);
    expect(d.qdsHandoffReadiness.blockers.length).toBeGreaterThan(0);
    expect(d.qdsHandoffReadiness.requiredHumanApproval).toBe(true);
  });

  // T7: Approval enables handoff (Gate 1 → Gate 2)
  it("T7 — after approveForQdsHandoff(), ready=true and SEND_TO_QDS_REVIEW enabled", () => {
    generateDesign();
    markUnderReview();
    approveForQdsHandoff();

    const s = session();
    expect(s.status).toBe("APPROVED_FOR_QDS_HANDOFF");
    expect(s.design!.qdsHandoffReadiness.ready).toBe(true);
    expect(s.design!.qdsHandoffReadiness.blockers).toEqual([]);
    expect(s.design!.qdsHandoffReadiness.approvedBy).toBe("DRJ");
    expect(s.design!.qdsHandoffReadiness.approvedAt).toBeTruthy();
    // Gate 2 enabled: SEND_TO_QDS_REVIEW not in blockedActions
    expect(s.activation!.blockedActions).not.toContain("SEND_TO_QDS_REVIEW");
    expect(s.activation!.allowedActions).toContain("SEND_TO_QDS_REVIEW");
  });

  // T8: Rejection blocks handoff
  it("T8 — after rejectDesign(), handoff remains blocked", () => {
    generateDesign();
    markUnderReview();
    rejectDesign();

    const s = session();
    expect(s.status).toBe("REJECTED");
    expect(s.design!.qdsHandoffReadiness.ready).toBe(false);
    expect(s.design!.status).toBe("REJECTED");
  });

  // T9: Calibration band
  it("T9 — calibration band is MEDIUM", () => {
    generateDesign();
    expect(session().calibration!.confidenceBand).toBe("MEDIUM");
  });

  // T10: Governed activation — when not approved, SEND_TO_QDS_REVIEW blocked
  it("T10 — when not approved, SEND_TO_QDS_REVIEW is blocked", () => {
    generateDesign();
    const s = session();
    expect(s.activation!.blockedActions).toContain("SEND_TO_QDS_REVIEW");
  });

  // T11: LEARN placeholder
  it("T11 — LEARN state is PENDING_QDS_EXECUTION", () => {
    expect(session().learn!.status).toBe("PENDING_QDS_EXECUTION");
  });

  // T12: No autonomous decision
  it("T12 — no autonomous decision language in output", () => {
    generateDesign();
    const s = session();
    const serialized = JSON.stringify(s).toLowerCase();

    // Must not contain expansion verdicts or decision-complete assertions
    expect(serialized).not.toContain("decision complete");
    expect(serialized).not.toContain("approved automatically");

    // Directional read mapping must contain "illustrative" language
    expect(s.design!.directionalReadMapping.accelerate).toContain(
      "Illustrative only"
    );
    expect(s.design!.directionalReadMapping.refine).toContain(
      "Illustrative only"
    );
  });
});

describe("Addendum Conformance", () => {
  beforeEach(() => {
    initializeFixtureSession();
  });

  // Addendum §1: Single authoritative status enum
  it("§1 — session.status is the single source of truth; design.status is derived", () => {
    generateDesign();
    expect(session().status).toBe("DESIGN_GENERATED");
    expect(design().status).toBe("DRAFT"); // derived: DESIGN_GENERATED → DRAFT

    markUnderReview();
    expect(session().status).toBe("UNDER_REVIEW");
    expect(design().status).toBe("UNDER_REVIEW");

    approveForQdsHandoff();
    expect(session().status).toBe("APPROVED_FOR_QDS_HANDOFF");
    expect(design().status).toBe("APPROVED");
  });

  // Addendum §2: Transition table
  it("§2 — transition table: NEEDS_REFINEMENT → generateDesign → DESIGN_GENERATED", () => {
    generateDesign();
    markUnderReview();
    requestRefinement();
    expect(session().status).toBe("NEEDS_REFINEMENT");
    expect(design().status).toBe("DRAFT");

    generateDesign();
    expect(session().status).toBe("DESIGN_GENERATED");
  });

  it("§2 — approval revocation: APPROVED → requestRefinement clears approval", () => {
    generateDesign();
    markUnderReview();
    approveForQdsHandoff();
    expect(design().qdsHandoffReadiness.ready).toBe(true);

    requestRefinement();
    expect(session().status).toBe("NEEDS_REFINEMENT");
    expect(design().qdsHandoffReadiness.ready).toBe(false);
    expect(design().qdsHandoffReadiness.approvedBy).toBeUndefined();
  });

  it("§2 — resetSession from any state → DRAFT, clears design", () => {
    generateDesign();
    markUnderReview();
    approveForQdsHandoff();
    resetSession();

    expect(session().status).toBe("DRAFT");
    expect(session().design).toBeUndefined();
    expect(session().calibration).toBeUndefined();
    expect(session().activation).toBeUndefined();
  });

  it("§2 — REJECTED is terminal except resetSession", () => {
    generateDesign();
    markUnderReview();
    rejectDesign();
    expect(session().status).toBe("REJECTED");

    // Further actions should be no-ops (except reset)
    generateDesign(); // no-op: status is REJECTED, not DRAFT or NEEDS_REFINEMENT
    expect(session().status).toBe("REJECTED");

    resetSession();
    expect(session().status).toBe("DRAFT");
  });

  // Addendum §3: Calibration gates, not confidenceModel
  it("§3 — calibration is computed; governs ACTIVATE", () => {
    generateDesign();
    const cal = session().calibration!;
    expect(cal.confidenceBand).toBe("MEDIUM");
    expect(cal.governanceStatus).toBe("CAUTION");
    expect(cal.qdsReadinessStatus).toBe("READY_WITH_REVIEW");

    // Activation reads calibration, not confidenceModel
    const act = session().activation!;
    expect(act.blockedActions).toContain("SEND_TO_QDS_REVIEW");
  });

  // Addendum §5: Directional mapping is illustrative
  it("§5 — directional read mapping values are conditional/illustrative", () => {
    generateDesign();
    const drm = design().directionalReadMapping;
    for (const key of ["accelerate", "refine", "cultivate", "archive"] as const) {
      expect(drm[key].toLowerCase()).toContain("illustrative");
    }
  });

  // Addendum §7.1: requiredHumanApproval is policy flag, not gate boolean
  it("§7.1 — requiredHumanApproval is true in both pre- and post-approval states", () => {
    generateDesign();
    expect(design().qdsHandoffReadiness.requiredHumanApproval).toBe(true);

    markUnderReview();
    approveForQdsHandoff();
    expect(design().qdsHandoffReadiness.requiredHumanApproval).toBe(true);
    // Gate boolean is ready + approvedBy, not requiredHumanApproval
    expect(design().qdsHandoffReadiness.ready).toBe(true);
    expect(design().qdsHandoffReadiness.approvedBy).toBe("DRJ");
  });
});
