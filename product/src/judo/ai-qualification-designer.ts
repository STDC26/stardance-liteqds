// JUDO DDW — AI Qualification Designer (deterministic mock)
// Source: Spec v1.1 §10 + Addendum §7 (verbatim fixture content)
//
// Branches on fixtureId. For fixture-healthcare-expansion-001, emits the
// Addendum §7 design verbatim. This is a deterministic generator, not an LLM.

import type {
  DecisionDesignSession,
  CandidateQualificationSystem,
  CalibrationRead,
  ActivationPlan,
  LearnState,
  DecisionDesignSessionStatus,
} from "./types";

// Addendum §1.2 — derive design status from session status
function deriveDesignStatus(
  sessionStatus: DecisionDesignSessionStatus
): CandidateQualificationSystem["status"] {
  switch (sessionStatus) {
    case "DESIGN_GENERATED":
    case "NEEDS_REFINEMENT":
      return "DRAFT";
    case "UNDER_REVIEW":
      return "UNDER_REVIEW";
    case "APPROVED_FOR_QDS_HANDOFF":
      return "APPROVED";
    case "REJECTED":
      return "REJECTED";
    default:
      return "DRAFT";
  }
}

// Addendum §3.2 — compute governed calibration from design
function computeCalibration(
  design: CandidateQualificationSystem
): CalibrationRead {
  const hasBlocker = design.governanceNotes.some(
    (n) => n.severity === "BLOCKER"
  );
  const hasCaution = design.governanceNotes.some(
    (n) => n.severity === "CAUTION"
  );

  return {
    confidenceBand: "MEDIUM",
    evidenceGaps: [
      "Internal capability assessment (MISSING)",
      "Regulatory exposure review (MISSING)",
      "Validated economic assumptions (PARTIAL)",
    ],
    designRisks: [
      "Capability acquisition path unproven",
      "Regulatory/trust exposure higher than prior expansion contexts",
      "Economics rest on unvalidated assumptions",
    ],
    governanceStatus: hasBlocker ? "BLOCKED" : hasCaution ? "CAUTION" : "PASS",
    qdsReadinessStatus: hasBlocker ? "NOT_READY" : "READY_WITH_REVIEW",
  };
}

// Addendum §7 — canonical healthcare fixture design (verbatim)
function generateHealthcareDesign(
  session: DecisionDesignSession
): CandidateQualificationSystem {
  return {
    id: "cqs-healthcare-expansion-001",
    sessionId: session.id,
    title: "Healthcare Expansion — Candidate Qualification System",
    version: "1.0",
    status: deriveDesignStatus(session.status),
    criteria: [
      {
        id: "crit-market",
        name: "Market Attractiveness",
        description:
          "Size, growth, and accessibility of the target healthcare segment.",
        weight: 0.2,
        requiredEvidenceIds: ["ev-demand", "ev-competitive"],
        riskIfUnqualified:
          "Pursuing a thin or inaccessible market with no real headroom.",
      },
      {
        id: "crit-customer",
        name: "Customer Need",
        description:
          "Existence and acuteness of an unmet need we can credibly serve.",
        weight: 0.2,
        requiredEvidenceIds: ["ev-segment"],
        riskIfUnqualified:
          "Building for a need that is assumed rather than evidenced.",
      },
      {
        id: "crit-capability",
        name: "Capability Fit",
        description:
          "Whether we have, or can acquire, the capability to deliver in a regulated healthcare context.",
        weight: 0.15,
        requiredEvidenceIds: ["ev-capability", "ev-complexity"],
        riskIfUnqualified:
          "Committing to delivery we cannot execute within acceptable cost and time.",
      },
      {
        id: "crit-regulatory",
        name: "Regulatory / Trust Risk",
        description:
          "Regulatory, compliance, data-handling, and trust exposure, and our ability to manage it.",
        weight: 0.2,
        requiredEvidenceIds: ["ev-regulatory", "ev-trust"],
        riskIfUnqualified:
          "Entering a regulated market with unbounded compliance or trust liability.",
      },
      {
        id: "crit-economic",
        name: "Economic Viability",
        description:
          "Revenue, gross margin, and cost-to-serve at plausible scale, and their sensitivity.",
        weight: 0.15,
        requiredEvidenceIds: ["ev-economics"],
        riskIfUnqualified:
          "Scaling an offer whose unit economics do not clear.",
      },
      {
        id: "crit-timing",
        name: "Timing / Urgency",
        description:
          "Whether market readiness and our own capacity make now the right moment.",
        weight: 0.1,
        requiredEvidenceIds: ["ev-demand", "ev-competitive"],
        riskIfUnqualified:
          "Moving too early (market not ready) or too late (window closed).",
      },
    ],
    evidenceRequirements: [
      {
        id: "ev-demand",
        label: "Healthcare market demand signal",
        description:
          "Quantified demand and growth evidence for the target segment.",
        evidenceType: "MARKET",
        required: true,
        currentStatus: "PARTIAL",
      },
      {
        id: "ev-segment",
        label: "Target customer segment evidence",
        description:
          "Identification and validation of the specific buyer/user and their need.",
        evidenceType: "CUSTOMER",
        required: true,
        currentStatus: "PARTIAL",
      },
      {
        id: "ev-capability",
        label: "Internal capability assessment",
        description:
          "Honest assessment of delivery capability in a regulated context and gaps.",
        evidenceType: "CAPABILITY",
        required: true,
        currentStatus: "MISSING",
      },
      {
        id: "ev-regulatory",
        label: "Regulatory exposure review",
        description:
          "Applicable regulatory, compliance, and data-handling obligations and exposure.",
        evidenceType: "REGULATORY",
        required: true,
        currentStatus: "MISSING",
      },
      {
        id: "ev-competitive",
        label: "Competitive landscape",
        description:
          "Incumbents, substitutes, and our differentiated position.",
        evidenceType: "COMPETITIVE",
        required: true,
        currentStatus: "PARTIAL",
      },
      {
        id: "ev-economics",
        label: "Revenue / margin assumptions",
        description:
          "Revenue model, gross margin, and cost-to-serve assumptions with sensitivity.",
        evidenceType: "FINANCIAL",
        required: true,
        currentStatus: "PARTIAL",
      },
      {
        id: "ev-complexity",
        label: "Implementation complexity",
        description:
          "Effort, dependencies, and risk of delivering the offer.",
        evidenceType: "CAPABILITY",
        required: true,
        currentStatus: "PARTIAL",
      },
      {
        id: "ev-trust",
        label: "Trust and credibility requirements",
        description:
          "Trust, certification, and credibility signals healthcare buyers require.",
        evidenceType: "REGULATORY",
        required: true,
        currentStatus: "PARTIAL",
      },
    ],
    questionPlan: [
      {
        id: "q-market",
        question:
          "What is the size, growth rate, and accessibility of the target healthcare segment?",
        purpose: "Qualify market attractiveness.",
        mapsToCriterionId: "crit-market",
        expectedEvidenceType: "MARKET",
        required: true,
      },
      {
        id: "q-customer",
        question:
          "Which specific healthcare buyer or user has an unmet need we can evidence, and how acute is it?",
        purpose: "Qualify customer need.",
        mapsToCriterionId: "crit-customer",
        expectedEvidenceType: "CUSTOMER",
        required: true,
      },
      {
        id: "q-capability",
        question:
          "What capabilities does delivery in a regulated healthcare context require, and which do we currently lack?",
        purpose: "Qualify capability fit.",
        mapsToCriterionId: "crit-capability",
        expectedEvidenceType: "CAPABILITY",
        required: true,
      },
      {
        id: "q-regulatory",
        question:
          "What regulatory, compliance, and data-handling obligations apply, and what is our current exposure?",
        purpose: "Qualify regulatory/trust risk.",
        mapsToCriterionId: "crit-regulatory",
        expectedEvidenceType: "REGULATORY",
        required: true,
      },
      {
        id: "q-economic",
        question:
          "At plausible scale, what are the revenue, gross margin, and cost-to-serve assumptions, and how sensitive are they?",
        purpose: "Qualify economic viability.",
        mapsToCriterionId: "crit-economic",
        expectedEvidenceType: "FINANCIAL",
        required: true,
      },
      {
        id: "q-timing",
        question:
          "Why now — what makes the timing favorable or unfavorable relative to market readiness and our capacity?",
        purpose: "Qualify timing/urgency.",
        mapsToCriterionId: "crit-timing",
        expectedEvidenceType: "MARKET",
        required: true,
      },
      {
        id: "q-capability-gap",
        question:
          "What is the credible path and cost to acquire missing healthcare delivery capability (build, hire, or partner)?",
        purpose: "Close the capability evidence gap.",
        mapsToCriterionId: "crit-capability",
        expectedEvidenceType: "CAPABILITY",
        required: true,
      },
      {
        id: "q-trust",
        question:
          "What trust and credibility signals must we establish for healthcare buyers, and can we meet them?",
        purpose: "Close the trust/regulatory evidence gap.",
        mapsToCriterionId: "crit-regulatory",
        expectedEvidenceType: "REGULATORY",
        required: true,
      },
    ],
    confidenceModel: {
      confidenceBand: "MEDIUM",
      evidenceSufficiency: "PARTIAL",
      designCompletenessScore: 0.82,
      riskScore: 0.58,
      rationale:
        "The design covers all six qualification dimensions with mapped evidence and questions. Confidence is held at MEDIUM because two required evidence items (internal capability assessment, regulatory exposure review) are MISSING and economic assumptions are unvalidated. The design is sufficient to route to QDS with review, not to assert readiness.",
    },
    directionalReadMapping: {
      accelerate:
        "If qualified execution shows strong market and customer evidence with manageable regulatory exposure, the opportunity would read ACCELERATE. Illustrative only — not a current recommendation.",
      refine:
        "If evidence is mixed but gaps are closeable, the read would be REFINE — narrow the segment or scope and re-qualify. Illustrative only.",
      cultivate:
        "If signal is promising but timing or capability is not yet ready, the read would be CULTIVATE — hold a watching position and revisit. Illustrative only.",
      archive:
        "If qualification shows weak demand or unmanageable regulatory/trust risk, the read would be ARCHIVE — close the opportunity. Illustrative only.",
    },
    governanceNotes: [
      {
        id: "gn-1",
        severity: "CAUTION",
        note: "Two required evidence items are MISSING (capability assessment, regulatory exposure). Any approval should be a READY_WITH_REVIEW handoff, with closure expected during QDS execution.",
        requiredAction: "Confirm reviewer accepts a READY_WITH_REVIEW handoff.",
      },
      {
        id: "gn-2",
        severity: "INFO",
        note: "Economic assumptions are unvalidated and must be treated as hypotheses, not findings.",
      },
      {
        id: "gn-3",
        severity: "CAUTION",
        note: "Healthcare regulatory exposure is materially higher than prior expansion contexts; ensure a regulatory specialist is in the QDS execution loop.",
        requiredAction:
          "Name a regulatory review owner before handoff.",
      },
      {
        id: "gn-4",
        severity: "INFO",
        note: "No BLOCKER conditions present. Design is approvable at reviewer discretion.",
      },
    ],
    qdsHandoffReadiness: {
      ready: false,
      blockers: ["Human approval required before QDS handoff"],
      requiredHumanApproval: true,
    },
  };
}

export function generateCandidateQualificationSystem(
  session: DecisionDesignSession
): CandidateQualificationSystem {
  if (session.fixtureId === "fixture-healthcare-expansion-001") {
    return generateHealthcareDesign(session);
  }
  throw new Error(
    `Unknown fixture: ${session.fixtureId}. Sprint 1 supports only fixture-healthcare-expansion-001.`
  );
}

export function generateCalibration(
  design: CandidateQualificationSystem
): CalibrationRead {
  return computeCalibration(design);
}

export function generateActivation(
  session: DecisionDesignSession
): ActivationPlan {
  const isApproved = session.status === "APPROVED_FOR_QDS_HANDOFF";
  return {
    recommendedNextAction: "SEND_TO_QDS_REVIEW",
    allowedActions: isApproved
      ? ["SEND_TO_QDS_REVIEW", "HOLD_MONITOR"]
      : ["REFINE_DESIGN", "REQUEST_MORE_EVIDENCE", "HOLD_MONITOR", "REJECT_DESIGN"],
    blockedActions: isApproved ? [] : ["SEND_TO_QDS_REVIEW"],
    rationale: isApproved
      ? "Approved for QDS handoff. Routing to QDS intake is now enabled (Gate 2). Refine or reject would revoke approval."
      : "The design qualifies for QDS review with evidence closure during execution. SEND_TO_QDS_REVIEW is blocked pending human approval (Gate 1). A reviewer may instead request more evidence, refine, hold, or reject.",
  };
}

export function generateLearnState(): LearnState {
  return {
    status: "PENDING_QDS_EXECUTION",
    learningCaptureStatus: "NOT_STARTED",
    notes: [
      "LEARN activates after QDS executes the approved qualification.",
      "Future function: capture what was learned from qualification execution and update decision capital.",
    ],
  };
}

export { deriveDesignStatus };
