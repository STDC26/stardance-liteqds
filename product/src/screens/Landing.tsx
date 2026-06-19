export function Landing({ onStart, onGallery, onDecisionDesign }: { onStart: () => void; onGallery: () => void; onDecisionDesign?: () => void }) {
  return (
    <div className="landing">
      <div className="landing-badge">QDS Lite</div>
      <h1 className="landing-title">Qualification Discovery</h1>
      <p className="landing-subtitle">
        Create, preview, and run governed qualification flows — no code required.
        Each flow routes respondents to the right pathway with full trust
        boundaries visible.
      </p>

      <div className="landing-how">
        <h2 className="landing-how-title">How it works</h2>
        <ol className="landing-steps">
          <li>Pick a preset QDS or create your own from the builder</li>
          <li>Respondents answer guided intake questions</li>
          <li>The system produces a governed, directional qualification read</li>
          <li>Results route to the right pathway with a lead capture CTA</li>
        </ol>
      </div>

      <div className="landing-trust">
        <p>
          This is an experimental Lite surface. Results are directional only —
          not a binding decision. A human reviewer validates every qualification.
        </p>
      </div>

      <div className="landing-actions">
        <button className="btn-primary" onClick={onGallery}>
          Browse QDS flows
        </button>
        <button className="btn-secondary" onClick={onStart}>
          Create new QDS
        </button>
        {onDecisionDesign && (
          <button className="btn-secondary" onClick={onDecisionDesign} data-testid="open-decision-design">
            JUDO Decision Design
          </button>
        )}
      </div>
    </div>
  );
}
