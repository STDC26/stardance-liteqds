import type { LearnState } from "../types";

export function LearnStatePanel({ learn }: { learn: LearnState }) {
  return (
    <section className="ddw-section ddw-learn" data-testid="learn-panel">
      <h3 className="ddw-section-title">
        <span className="ddw-phase-badge">LEARN</span>
        Post-Execution Learning
      </h3>
      <div className="ddw-field">
        <span className="ddw-field-label">Status</span>
        <span data-testid="learn-status">{learn.status.replace(/_/g, " ")}</span>
      </div>
      <div className="ddw-field">
        <span className="ddw-field-label">Learning capture</span>
        <span>{learn.learningCaptureStatus.replace(/_/g, " ")}</span>
      </div>
      {learn.notes.length > 0 && (
        <ul className="ddw-note-list">
          {learn.notes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
