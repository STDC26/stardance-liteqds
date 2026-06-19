// JUDO Decision Design Workspace — Root Component
// Layout: Spec v1.1 §6.2 (LEFT: SHAPE+ALIGN, CENTER: DESIGN, RIGHT: CALIBRATE,
//         BOTTOM: ACTIVATE, FOLLOWING: LEARN)

import { useState, useEffect, useSyncExternalStore } from "react";
import {
  getSession,
  subscribe,
  initializeFixtureSession,
  generateDesign,
  markUnderReview,
  approveForQdsHandoff,
  rejectDesign,
  requestRefinement,
  resetSession,
  setReviewerName,
} from "./decision-design-store";
import { healthcareExpansionFixture } from "./fixture";
import { ShapeAlignPanel } from "./components/ShapeAlignPanel";
import { DesignCanvas } from "./components/DesignCanvas";
import { CalibrationPanel } from "./components/CalibrationPanel";
import { ActivationBar } from "./components/ActivationBar";
import { LearnStatePanel } from "./components/LearnStatePanel";
import { GovernanceReviewControls } from "./components/GovernanceReviewControls";
import { FixturePromptCard } from "./components/FixturePromptCard";

export function DecisionDesignWorkspace({ onBack }: { onBack: () => void }) {
  const session = useSyncExternalStore(subscribe, getSession);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initializeFixtureSession();
      setInitialized(true);
    }
  }, [initialized]);

  if (!session) return null;

  const hasDesign = !!session.design;
  const isApproved = session.status === "APPROVED_FOR_QDS_HANDOFF";
  const isRejected = session.status === "REJECTED";

  return (
    <div className="ddw" data-testid="decision-design-workspace">
      {/* Header */}
      <div className="ddw-header">
        <div>
          <h1 className="ddw-title" data-testid="ddw-title">
            JUDO Decision Design Workspace
          </h1>
          <p className="ddw-subtitle" data-testid="ddw-subtitle">
            AI designs the qualification system. Humans govern. QDS executes.
          </p>
        </div>
        <button className="btn-secondary ddw-back" onClick={onBack}>
          Back
        </button>
      </div>

      {/* Governance notice */}
      <div className="ddw-governance-notice" data-testid="governance-notice">
        Generated qualification designs require human approval before QDS
        handoff.
      </div>

      {/* Status bar */}
      <div className="ddw-status-bar" data-testid="session-status">
        <span className="ddw-status-label">Session status:</span>
        <span
          className={`ddw-status-value ddw-status-${session.status.toLowerCase().replace(/_/g, "-")}`}
          data-status={session.status}
        >
          {formatStatus(session.status)}
        </span>
      </div>

      {/* Fixture prompt card */}
      {session.status === "DRAFT" && !hasDesign && (
        <FixturePromptCard
          fixture={healthcareExpansionFixture}
          onGenerate={generateDesign}
        />
      )}

      {/* Workspace layout */}
      <div className={`ddw-workspace ${hasDesign ? "ddw-workspace-active" : ""}`}>
        {/* LEFT: SHAPE + ALIGN */}
        <div className="ddw-left">
          <ShapeAlignPanel shape={session.shape} align={session.align} />
        </div>

        {/* CENTER: DESIGN */}
        {hasDesign && (
          <div className="ddw-center">
            <DesignCanvas design={session.design!} />

            {/* Governance review controls (Gate 1) */}
            {(session.status === "DESIGN_GENERATED" ||
              session.status === "UNDER_REVIEW" ||
              session.status === "NEEDS_REFINEMENT") && (
              <GovernanceReviewControls
                session={session}
                onMarkUnderReview={markUnderReview}
                onApprove={approveForQdsHandoff}
                onReject={rejectDesign}
                onRefine={requestRefinement}
                onRegenerate={generateDesign}
                onSetReviewer={setReviewerName}
              />
            )}

            {isApproved && (
              <div className="ddw-approved-banner" data-testid="approved-banner">
                This qualification design is approved for QDS handoff.
              </div>
            )}

            {isRejected && (
              <div className="ddw-rejected-banner" data-testid="rejected-banner">
                This design has been rejected.
                <button
                  className="btn-secondary ddw-reset-btn"
                  onClick={resetSession}
                  data-testid="reset-session"
                >
                  Reset session
                </button>
              </div>
            )}

            {isApproved && (
              <div className="ddw-post-approval-controls">
                <button
                  className="btn-secondary"
                  onClick={requestRefinement}
                  data-testid="revoke-refine"
                >
                  Revoke &amp; Refine
                </button>
                <button
                  className="btn-secondary"
                  onClick={rejectDesign}
                  data-testid="revoke-reject"
                >
                  Revoke &amp; Reject
                </button>
              </div>
            )}
          </div>
        )}

        {/* RIGHT: CALIBRATE */}
        {session.calibration && (
          <div className="ddw-right">
            <CalibrationPanel
              calibration={session.calibration}
              confidenceModel={session.design?.confidenceModel}
            />
          </div>
        )}
      </div>

      {/* BOTTOM: ACTIVATE */}
      {session.activation && hasDesign && (
        <ActivationBar
          activation={session.activation}
          session={session}
          directionalReadMapping={session.design!.directionalReadMapping}
        />
      )}

      {/* FOLLOWING: LEARN */}
      {session.learn && <LearnStatePanel learn={session.learn} />}

      {/* Reset (available in all states except DRAFT without design) */}
      {session.status !== "DRAFT" && (
        <div className="ddw-footer-actions">
          <button
            className="btn-secondary"
            onClick={resetSession}
            data-testid="reset-session-footer"
          >
            Reset session
          </button>
        </div>
      )}
    </div>
  );
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ");
}
