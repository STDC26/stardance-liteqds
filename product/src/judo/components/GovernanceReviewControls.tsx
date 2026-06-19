// Addendum §4: Gate 1 — Human Governance Approval
// Approve blocked while any open BLOCKER governance note exists.

import { useState } from "react";
import type { DecisionDesignSession } from "../types";

export function GovernanceReviewControls({
  session,
  onMarkUnderReview,
  onApprove,
  onReject,
  onRefine,
  onRegenerate,
  onSetReviewer,
}: {
  session: DecisionDesignSession;
  onMarkUnderReview: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRefine: () => void;
  onRegenerate: () => void;
  onSetReviewer: (name: string) => void;
}) {
  const [reviewer, setReviewer] = useState("DRJ");

  const hasBlocker = session.design?.governanceNotes.some(
    (n) => n.severity === "BLOCKER"
  );

  return (
    <div
      className="ddw-governance-controls"
      data-testid="governance-review-controls"
    >
      <h4 className="ddw-subsection-title">
        Gate 1 — Human Governance Review
      </h4>

      {/* Reviewer field (Sprint-1 stub) */}
      <label className="ddw-reviewer-label">
        <span className="ddw-field-label">Reviewer</span>
        <input
          type="text"
          className="builder-input builder-input-small"
          value={reviewer}
          onChange={(e) => {
            setReviewer(e.target.value);
            onSetReviewer(e.target.value);
          }}
          data-testid="reviewer-field"
        />
      </label>

      <div className="ddw-review-actions">
        {session.status === "DESIGN_GENERATED" && (
          <button
            className="btn-primary"
            onClick={onMarkUnderReview}
            data-testid="mark-under-review"
          >
            Begin Review
          </button>
        )}

        {session.status === "UNDER_REVIEW" && (
          <>
            <button
              className={`btn-primary ddw-approve-btn ${hasBlocker ? "ddw-btn-blocked" : ""}`}
              onClick={onApprove}
              disabled={!!hasBlocker}
              data-testid="approve-design"
              title={
                hasBlocker
                  ? "Cannot approve: open BLOCKER governance note"
                  : "Approve for QDS handoff"
              }
            >
              Approve for QDS Handoff
            </button>
            <button
              className="btn-secondary"
              onClick={onRefine}
              data-testid="request-refinement"
            >
              Request Refinement
            </button>
            <button
              className="btn-secondary ddw-reject-btn"
              onClick={onReject}
              data-testid="reject-design"
            >
              Reject
            </button>
          </>
        )}

        {session.status === "NEEDS_REFINEMENT" && (
          <button
            className="btn-primary"
            onClick={onRegenerate}
            data-testid="regenerate-design"
          >
            Regenerate Design
          </button>
        )}
      </div>

      {hasBlocker && session.status === "UNDER_REVIEW" && (
        <p className="ddw-blocker-warning" data-testid="blocker-warning">
          Approval is blocked: one or more BLOCKER governance notes are open.
        </p>
      )}
    </div>
  );
}
