// JUDO Decision Design Workspace — Type Definitions
// Source: Spec v1.0 §8 (authoritative, unchanged)
// Constrained by: Canon Addendum v1.0 (runtime rules)

export type DecisionDesignSessionStatus =
  | "DRAFT"
  | "DESIGN_GENERATED"
  | "UNDER_REVIEW"
  | "APPROVED_FOR_QDS_HANDOFF"
  | "REJECTED"
  | "NEEDS_REFINEMENT";

export interface DecisionDesignSession {
  id: string;
  fixtureId: string;
  title: string;
  prompt: string;
  decisionType: "OPPORTUNITY_QUALIFICATION";
  status: DecisionDesignSessionStatus;
  shape: ShapeFrame;
  align: AlignFrame;
  design?: CandidateQualificationSystem;
  calibration?: CalibrationRead;
  activation?: ActivationPlan;
  learn?: LearnState;
  createdAt: string;
  updatedAt: string;
}

export interface ShapeFrame {
  decisionContext: string;
  decisionType: string;
  uncertaintyTypes: string[];
  desiredOutcome: string;
  framingNotes: string[];
}

export interface AlignFrame {
  qualificationTarget: string;
  qualificationQuestions: string[];
  assumptions: string[];
  constraints: string[];
  successDefinition: string;
}

export interface CandidateQualificationSystem {
  id: string;
  sessionId: string;
  title: string;
  version: string;
  status: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  criteria: QualificationCriterion[];
  evidenceRequirements: EvidenceRequirement[];
  questionPlan: QualificationQuestion[];
  confidenceModel: ConfidenceModel;
  directionalReadMapping: DirectionalReadMapping;
  governanceNotes: GovernanceNote[];
  qdsHandoffReadiness: QdsHandoffReadiness;
}

export interface QualificationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  requiredEvidenceIds: string[];
  riskIfUnqualified: string;
}

export interface EvidenceRequirement {
  id: string;
  label: string;
  description: string;
  evidenceType:
    | "MARKET"
    | "CUSTOMER"
    | "CAPABILITY"
    | "REGULATORY"
    | "FINANCIAL"
    | "TIMING"
    | "COMPETITIVE";
  required: boolean;
  currentStatus: "MISSING" | "PARTIAL" | "SUFFICIENT";
}

export interface QualificationQuestion {
  id: string;
  question: string;
  purpose: string;
  mapsToCriterionId: string;
  expectedEvidenceType: string;
  required: boolean;
}

export interface ConfidenceModel {
  confidenceBand: "LOW" | "MEDIUM" | "HIGH";
  evidenceSufficiency: "INSUFFICIENT" | "PARTIAL" | "SUFFICIENT";
  designCompletenessScore: number;
  riskScore: number;
  rationale: string;
}

export interface DirectionalReadMapping {
  accelerate: string;
  refine: string;
  cultivate: string;
  archive: string;
}

export interface GovernanceNote {
  id: string;
  severity: "INFO" | "CAUTION" | "BLOCKER";
  note: string;
  requiredAction?: string;
}

export interface QdsHandoffReadiness {
  ready: boolean;
  blockers: string[];
  requiredHumanApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CalibrationRead {
  confidenceBand: "LOW" | "MEDIUM" | "HIGH";
  evidenceGaps: string[];
  designRisks: string[];
  governanceStatus: "PASS" | "CAUTION" | "BLOCKED";
  qdsReadinessStatus: "NOT_READY" | "READY_WITH_REVIEW" | "READY";
}

export interface ActivationPlan {
  recommendedNextAction:
    | "SEND_TO_QDS_REVIEW"
    | "REFINE_DESIGN"
    | "REQUEST_MORE_EVIDENCE"
    | "HOLD_MONITOR"
    | "REJECT_DESIGN";
  allowedActions: string[];
  blockedActions: string[];
  rationale: string;
}

export interface LearnState {
  status: "PENDING_QDS_EXECUTION" | "READY_FOR_CAPTURE" | "CAPTURED";
  learningCaptureStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
  notes: string[];
}
