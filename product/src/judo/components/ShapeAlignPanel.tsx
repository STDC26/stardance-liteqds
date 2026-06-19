import type { ShapeFrame, AlignFrame } from "../types";

export function ShapeAlignPanel({
  shape,
  align,
}: {
  shape: ShapeFrame;
  align: AlignFrame;
}) {
  return (
    <div data-testid="shape-align-panel">
      {/* SHAPE */}
      <section className="ddw-section" data-testid="shape-frame">
        <h3 className="ddw-section-title">
          <span className="ddw-phase-badge">SHAPE</span>
          Decision Framing
        </h3>
        <div className="ddw-field">
          <span className="ddw-field-label">Context</span>
          <p className="ddw-field-value" data-testid="shape-context">
            {shape.decisionContext}
          </p>
        </div>
        <div className="ddw-field">
          <span className="ddw-field-label">Type</span>
          <p className="ddw-field-value" data-testid="shape-type">
            {shape.decisionType}
          </p>
        </div>
        <div className="ddw-field">
          <span className="ddw-field-label">Uncertainty types</span>
          <div className="ddw-tags" data-testid="shape-uncertainty-types">
            {shape.uncertaintyTypes.map((t) => (
              <span key={t} className="ddw-tag">{t}</span>
            ))}
          </div>
        </div>
        <div className="ddw-field">
          <span className="ddw-field-label">Desired outcome</span>
          <p className="ddw-field-value" data-testid="shape-desired-outcome">
            {shape.desiredOutcome}
          </p>
        </div>
        <div className="ddw-field">
          <span className="ddw-field-label">Framing notes</span>
          <ul className="ddw-note-list" data-testid="shape-framing-notes">
            {shape.framingNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ALIGN */}
      <section className="ddw-section" data-testid="align-frame">
        <h3 className="ddw-section-title">
          <span className="ddw-phase-badge">ALIGN</span>
          Qualification Target
        </h3>
        <div className="ddw-field">
          <span className="ddw-field-label">Target</span>
          <p className="ddw-field-value" data-testid="align-target">
            {align.qualificationTarget}
          </p>
        </div>
        <div className="ddw-field">
          <span className="ddw-field-label">Qualification questions</span>
          <ol className="ddw-question-list" data-testid="align-questions">
            {align.qualificationQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </div>
        <div className="ddw-field">
          <span className="ddw-field-label">Assumptions</span>
          <ul className="ddw-note-list" data-testid="align-assumptions">
            {align.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="ddw-field">
          <span className="ddw-field-label">Constraints</span>
          <ul className="ddw-note-list" data-testid="align-constraints">
            {align.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
        <div className="ddw-field">
          <span className="ddw-field-label">Success definition</span>
          <p className="ddw-field-value" data-testid="align-success-definition">
            {align.successDefinition}
          </p>
        </div>
      </section>
    </div>
  );
}
