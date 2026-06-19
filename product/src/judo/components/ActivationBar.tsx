// Addendum §4: Two-gate model.
// Gate 2 (Send to QDS Intake) enabled ONLY when session = APPROVED_FOR_QDS_HANDOFF.
// Addendum §5: DirectionalReadMapping rendered illustrative/conditional only.

import type {
  ActivationPlan,
  DecisionDesignSession,
  DirectionalReadMapping,
} from "../types";

const DIRECTIONAL_LABEL =
  "Illustrative decision-read mapping — applies only after qualified execution. Not a current recommendation.";

export function ActivationBar({
  activation,
  session,
  directionalReadMapping,
}: {
  activation: ActivationPlan;
  session: DecisionDesignSession;
  directionalReadMapping: DirectionalReadMapping;
}) {
  const isApproved = session.status === "APPROVED_FOR_QDS_HANDOFF";
  const sendBlocked = activation.blockedActions.includes("SEND_TO_QDS_REVIEW");

  return (
    <section className="ddw-activation" data-testid="activation-bar">
      <h3 className="ddw-section-title">
        <span className="ddw-phase-badge">ACTIVATE</span>
        Governed Actions
      </h3>

      {/* Gate 2: QDS Intake Routing */}
      <div className="ddw-activation-gate2" data-testid="gate-2">
        <button
          className={`btn-primary ddw-qds-send ${sendBlocked ? "ddw-btn-blocked" : ""}`}
          disabled={sendBlocked}
          data-testid="send-to-qds"
          onClick={() => {
            /* Sprint 1 placeholder — no live QDS execution */
          }}
        >
          Send to QDS Intake
        </button>
        {sendBlocked && (
          <p
            className="ddw-activation-blocked-msg"
            data-testid="activation-blocked"
          >
            QDS handoff is blocked until this design is reviewed and approved.
          </p>
        )}
        {isApproved && (
          <p className="ddw-activation-approved-msg" data-testid="activation-approved">
            This qualification design is approved for QDS handoff.
          </p>
        )}
      </div>

      <p className="ddw-activation-rationale">{activation.rationale}</p>

      {/* Directional Read Mapping — illustrative only (Addendum §5) */}
      <div
        className="ddw-directional-mapping"
        data-testid="directional-read-mapping"
      >
        <p className="ddw-directional-label" data-testid="directional-label">
          {DIRECTIONAL_LABEL}
        </p>
        <div className="ddw-directional-grid">
          {(
            ["accelerate", "refine", "cultivate", "archive"] as const
          ).map((key) => (
            <div key={key} className="ddw-directional-item" data-testid={`directional-${key}`}>
              <span className="ddw-directional-key">{key.toUpperCase()}</span>
              <p className="ddw-directional-value">
                {directionalReadMapping[key]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
