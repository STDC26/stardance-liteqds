// Addendum §3: CalibrationRead is the governed read that gates ACTIVATE.
// ConfidenceModel is AI self-assessment (display only in DesignCanvas).

import type { CalibrationRead, ConfidenceModel } from "../types";

export function CalibrationPanel({
  calibration,
  confidenceModel,
}: {
  calibration: CalibrationRead;
  confidenceModel?: ConfidenceModel;
}) {
  return (
    <section className="ddw-section" data-testid="calibration-panel">
      <h3 className="ddw-section-title">
        <span className="ddw-phase-badge">CALIBRATE</span>
        Governed Calibration Read
      </h3>

      <div className="ddw-calibration-grid">
        <div className="ddw-calibration-item">
          <span className="ddw-field-label">Confidence band</span>
          <span
            className={`ddw-calibration-band ddw-band-${calibration.confidenceBand.toLowerCase()}`}
            data-testid="calibration-band"
          >
            {calibration.confidenceBand}
          </span>
        </div>
        <div className="ddw-calibration-item">
          <span className="ddw-field-label">Governance status</span>
          <span
            className={`ddw-calibration-gov ddw-gov-${calibration.governanceStatus.toLowerCase()}`}
            data-testid="calibration-governance-status"
          >
            {calibration.governanceStatus}
          </span>
        </div>
        <div className="ddw-calibration-item">
          <span className="ddw-field-label">QDS readiness</span>
          <span data-testid="calibration-qds-readiness">
            {calibration.qdsReadinessStatus.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {calibration.evidenceGaps.length > 0 && (
        <div className="ddw-field" data-testid="calibration-evidence-gaps">
          <span className="ddw-field-label">Evidence gaps</span>
          <ul className="ddw-gap-list">
            {calibration.evidenceGaps.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </div>
      )}

      {calibration.designRisks.length > 0 && (
        <div className="ddw-field" data-testid="calibration-design-risks">
          <span className="ddw-field-label">Design risks</span>
          <ul className="ddw-risk-list">
            {calibration.designRisks.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
