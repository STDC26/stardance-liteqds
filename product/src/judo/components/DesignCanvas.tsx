import type { CandidateQualificationSystem } from "../types";

export function DesignCanvas({
  design,
}: {
  design: CandidateQualificationSystem;
}) {
  return (
    <div data-testid="design-canvas">
      <h3 className="ddw-section-title">
        <span className="ddw-phase-badge">DESIGN</span>
        {design.title}
      </h3>
      <p className="ddw-design-meta">
        v{design.version} &middot; Status: {design.status}
      </p>

      {/* Criteria */}
      <div className="ddw-subsection" data-testid="design-criteria">
        <h4 className="ddw-subsection-title">
          Qualification Criteria ({design.criteria.length})
        </h4>
        <div className="ddw-criteria-grid">
          {design.criteria.map((c) => (
            <div key={c.id} className="ddw-criterion-card" data-testid="criterion">
              <div className="ddw-criterion-header">
                <strong>{c.name}</strong>
                <span className="ddw-criterion-weight">
                  {(c.weight * 100).toFixed(0)}%
                </span>
              </div>
              <p className="ddw-criterion-desc">{c.description}</p>
              <p className="ddw-criterion-risk">
                <span className="ddw-risk-label">Risk if unqualified:</span>{" "}
                {c.riskIfUnqualified}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Requirements */}
      <div className="ddw-subsection" data-testid="design-evidence">
        <h4 className="ddw-subsection-title">
          Evidence Requirements ({design.evidenceRequirements.length})
        </h4>
        <div className="ddw-evidence-list">
          {design.evidenceRequirements.map((ev) => (
            <div key={ev.id} className="ddw-evidence-item" data-testid="evidence-requirement">
              <div className="ddw-evidence-header">
                <span className="ddw-evidence-label">{ev.label}</span>
                <span
                  className={`ddw-evidence-status ddw-evidence-${ev.currentStatus.toLowerCase()}`}
                  data-testid="evidence-status"
                >
                  {ev.currentStatus}
                </span>
              </div>
              <p className="ddw-evidence-desc">{ev.description}</p>
              <span className="ddw-evidence-type">{ev.evidenceType}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Question Plan */}
      <div className="ddw-subsection" data-testid="design-questions">
        <h4 className="ddw-subsection-title">
          Question Plan ({design.questionPlan.length})
        </h4>
        <ol className="ddw-question-plan">
          {design.questionPlan.map((q) => (
            <li key={q.id} className="ddw-question-item" data-testid="qualification-question">
              <strong>{q.question}</strong>
              <p className="ddw-question-purpose">{q.purpose}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Confidence Model (AI self-assessment — display only, Addendum §3) */}
      <div className="ddw-subsection" data-testid="design-confidence-model">
        <h4 className="ddw-subsection-title">
          AI Confidence Self-Assessment
          <span className="ddw-display-only-badge">display only</span>
        </h4>
        <div className="ddw-confidence-grid">
          <div className="ddw-confidence-item">
            <span className="ddw-field-label">Band</span>
            <span className="ddw-confidence-band" data-testid="confidence-band">
              {design.confidenceModel.confidenceBand}
            </span>
          </div>
          <div className="ddw-confidence-item">
            <span className="ddw-field-label">Evidence sufficiency</span>
            <span>{design.confidenceModel.evidenceSufficiency}</span>
          </div>
          <div className="ddw-confidence-item">
            <span className="ddw-field-label">Design completeness</span>
            <span>
              {(design.confidenceModel.designCompletenessScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="ddw-confidence-item">
            <span className="ddw-field-label">Risk score</span>
            <span>
              {(design.confidenceModel.riskScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        <p className="ddw-confidence-rationale">
          {design.confidenceModel.rationale}
        </p>
      </div>

      {/* Governance Notes */}
      <div className="ddw-subsection" data-testid="design-governance-notes">
        <h4 className="ddw-subsection-title">
          Governance Notes ({design.governanceNotes.length})
        </h4>
        {design.governanceNotes.map((gn) => (
          <div
            key={gn.id}
            className={`ddw-gov-note ddw-gov-note-${gn.severity.toLowerCase()}`}
            data-testid="governance-note"
            data-severity={gn.severity}
          >
            <span className="ddw-gov-severity">{gn.severity}</span>
            <p className="ddw-gov-note-text">{gn.note}</p>
            {gn.requiredAction && (
              <p className="ddw-gov-action">
                Required action: {gn.requiredAction}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* QDS Handoff Readiness */}
      <div className="ddw-subsection" data-testid="qds-handoff-readiness">
        <h4 className="ddw-subsection-title">QDS Handoff Readiness</h4>
        <div className="ddw-handoff-status">
          <span className="ddw-field-label">Ready</span>
          <span
            className={`ddw-handoff-ready ${design.qdsHandoffReadiness.ready ? "ddw-ready-yes" : "ddw-ready-no"}`}
            data-testid="handoff-ready"
          >
            {design.qdsHandoffReadiness.ready ? "Yes" : "No"}
          </span>
        </div>
        {design.qdsHandoffReadiness.blockers.length > 0 && (
          <div data-testid="handoff-blockers">
            <span className="ddw-field-label">Blockers</span>
            <ul className="ddw-blocker-list">
              {design.qdsHandoffReadiness.blockers.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}
        {design.qdsHandoffReadiness.approvedBy && (
          <p className="ddw-approved-by" data-testid="approved-by">
            Approved by: {design.qdsHandoffReadiness.approvedBy} at{" "}
            {design.qdsHandoffReadiness.approvedAt}
          </p>
        )}
      </div>
    </div>
  );
}
