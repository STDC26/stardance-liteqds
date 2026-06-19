// JUDO DDW — Decision Design Store
// Source: Spec v1.1 §12 + Addendum §1-§2 (canonical state model + transition table)
// Persistence: in-memory only (Sprint 1)

import type {
  DecisionDesignSession,
  DecisionDesignSessionStatus,
} from "./types";
import { healthcareExpansionFixture } from "./fixture";
import {
  generateCandidateQualificationSystem,
  generateCalibration,
  generateActivation,
  generateLearnState,
  deriveDesignStatus,
} from "./ai-qualification-designer";

// Sprint-1 reviewer stub (Addendum §7.1 / Spec v1.1 §13.1)
const DEFAULT_REVIEWER = "DRJ";

type Listener = () => void;

let session: DecisionDesignSession | null = null;
let reviewerName = DEFAULT_REVIEWER;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn());
}

function now() {
  return new Date().toISOString();
}

// Addendum §2: DRAFT → ... (any → resetSession() → DRAFT)
export function initializeFixtureSession(): void {
  const ts = now();
  session = {
    id: "session-healthcare-expansion-001",
    fixtureId: healthcareExpansionFixture.id,
    title: healthcareExpansionFixture.title,
    prompt: healthcareExpansionFixture.prompt,
    decisionType: "OPPORTUNITY_QUALIFICATION",
    status: "DRAFT",
    shape: {
      decisionContext:
        "Evaluate whether expansion into healthcare is strategically justified, operationally feasible, and sufficiently evidenced before any commitment of capital or roadmap capacity.",
      decisionType: "Opportunity Qualification",
      uncertaintyTypes: ["market", "capability", "risk", "timing"],
      desiredOutcome:
        "Determine whether to accelerate, refine, cultivate, or archive the healthcare expansion opportunity — on evidence, not intuition.",
      framingNotes: [
        "This is a qualification of an opportunity, not a go/no-go authorization. The output is a governed qualification design, not an expansion decision.",
        "Healthcare carries regulatory and trust exposure beyond ordinary market expansion; risk qualification is weighted accordingly.",
        "The prompt is intentionally broad; ALIGN must narrow it to a qualifiable target before DESIGN proceeds.",
        "No commitment or recommendation language may be produced at any phase (Spec §13.2).",
      ],
    },
    align: {
      qualificationTarget:
        "The healthcare-market expansion opportunity, qualified across market, customer, capability, regulatory/trust, economic, and timing dimensions.",
      qualificationQuestions: [
        "Is there a credible, sized market opportunity in the target healthcare segment?",
        "Is there a real, evidenced customer need we are positioned to serve?",
        "Do we have — or can we acquire — the capability to deliver in a regulated healthcare context?",
        "Are regulatory, compliance, and trust risks understood and manageable?",
        "Are the economics (revenue, margin, cost-to-serve) viable at plausible scale?",
        "Is the timing favorable relative to market readiness and our own capacity?",
        "What evidence is currently missing before any commitment could be justified?",
      ],
      assumptions: [
        "Expansion, if pursued, would extend existing platform capabilities rather than build a net-new product line from zero.",
        "The organization currently holds no regulatory accreditation specific to healthcare.",
        "Sprint 1 qualifies the opportunity only; it does not model implementation sequencing.",
      ],
      constraints: [
        "No final expansion decision may be asserted by the system.",
        "AI-generated qualification logic is candidate-only until human approval.",
        "Qualification design must route to QDS for execution; JUDO does not execute qualification.",
      ],
      successDefinition:
        "A governed candidate qualification system exists that a human reviewer can approve, refine, or reject, with evidence gaps and confidence limitations made explicit — sufficient for a defensible QDS handoff decision.",
    },
    learn: generateLearnState(),
    createdAt: ts,
    updatedAt: ts,
  };
  notify();
}

// Addendum §2: DRAFT → DESIGN_GENERATED (also computes calibration §3)
// Also: NEEDS_REFINEMENT → DESIGN_GENERATED (re-emit)
export function generateDesign(): void {
  if (!session) return;
  if (
    session.status !== "DRAFT" &&
    session.status !== "NEEDS_REFINEMENT"
  )
    return;

  const design = generateCandidateQualificationSystem(session);
  session = {
    ...session,
    status: "DESIGN_GENERATED",
    design,
    updatedAt: now(),
  };
  // Addendum §1.2: derive design status from session status
  session.design!.status = deriveDesignStatus(session.status);

  // Addendum §3.1: updateCalibration runs at end of generateDesign
  const calibration = generateCalibration(session.design!);
  const activation = generateActivation(session);
  session = {
    ...session,
    calibration,
    activation,
    updatedAt: now(),
  };
  notify();
}

// Addendum §2: DESIGN_GENERATED → UNDER_REVIEW
export function markUnderReview(): void {
  if (!session || session.status !== "DESIGN_GENERATED") return;
  session = {
    ...session,
    status: "UNDER_REVIEW",
    updatedAt: now(),
  };
  session.design!.status = deriveDesignStatus(session.status);
  session.activation = generateActivation(session);
  notify();
}

// Addendum §2: UNDER_REVIEW → APPROVED_FOR_QDS_HANDOFF
// Guard: blocked if any open BLOCKER governance note
export function approveForQdsHandoff(): void {
  if (!session || session.status !== "UNDER_REVIEW") return;
  if (!session.design) return;

  // Addendum §3.2: BLOCKER blocks approval
  const hasBlocker = session.design.governanceNotes.some(
    (n) => n.severity === "BLOCKER"
  );
  if (hasBlocker) return;

  const ts = now();
  session = {
    ...session,
    status: "APPROVED_FOR_QDS_HANDOFF",
    updatedAt: ts,
  };
  // Addendum §1.2
  session.design!.status = deriveDesignStatus(session.status);
  // Addendum §7.1: post-approval delta
  session.design!.qdsHandoffReadiness = {
    ready: true,
    blockers: [],
    requiredHumanApproval: true,
    approvedBy: reviewerName,
    approvedAt: ts,
  };
  session.activation = generateActivation(session);
  notify();
}

// Addendum §2: UNDER_REVIEW → REJECTED (terminal except reset)
// Also: APPROVED_FOR_QDS_HANDOFF → REJECTED (revokes approval)
export function rejectDesign(): void {
  if (!session) return;
  if (
    session.status !== "UNDER_REVIEW" &&
    session.status !== "APPROVED_FOR_QDS_HANDOFF"
  )
    return;

  session = {
    ...session,
    status: "REJECTED",
    updatedAt: now(),
  };
  if (session.design) {
    session.design.status = deriveDesignStatus(session.status);
    // Revoke approval if was approved
    session.design.qdsHandoffReadiness = {
      ready: false,
      blockers: ["Design rejected"],
      requiredHumanApproval: true,
    };
  }
  session.activation = generateActivation(session);
  notify();
}

// Addendum §2: UNDER_REVIEW → NEEDS_REFINEMENT
// Also: APPROVED_FOR_QDS_HANDOFF → NEEDS_REFINEMENT (revokes approval)
export function requestRefinement(): void {
  if (!session) return;
  if (
    session.status !== "UNDER_REVIEW" &&
    session.status !== "APPROVED_FOR_QDS_HANDOFF"
  )
    return;

  session = {
    ...session,
    status: "NEEDS_REFINEMENT",
    updatedAt: now(),
  };
  if (session.design) {
    session.design.status = deriveDesignStatus(session.status);
    // Revoke approval (Addendum §2: clears approvedBy/approvedAt, resets ready=false)
    session.design.qdsHandoffReadiness = {
      ready: false,
      blockers: ["Human approval required before QDS handoff"],
      requiredHumanApproval: true,
    };
  }
  session.activation = generateActivation(session);
  notify();
}

// Addendum §2: Calibration update (can run after generateDesign or independently)
export function updateCalibration(): void {
  if (!session?.design) return;
  session = {
    ...session,
    calibration: generateCalibration(session.design),
    updatedAt: now(),
  };
  notify();
}

// Addendum §2: any → DRAFT (clears design, calibration, activation, approval)
export function resetSession(): void {
  if (!session) return;
  const ts = now();
  session = {
    ...session,
    status: "DRAFT",
    design: undefined,
    calibration: undefined,
    activation: undefined,
    learn: generateLearnState(),
    updatedAt: ts,
  };
  notify();
}

export function setReviewerName(name: string): void {
  reviewerName = name || DEFAULT_REVIEWER;
}

export function getSession(): DecisionDesignSession | null {
  return session;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
