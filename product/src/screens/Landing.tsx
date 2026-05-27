export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="landing">
      <div className="landing-badge">QDS Lite</div>
      <h1 className="landing-title">Qualification Discovery</h1>
      <p className="landing-subtitle">
        Find out which pathway fits your project — Stardance, Docente, or VMG —
        in under two minutes.
      </p>

      <div className="landing-how">
        <h2 className="landing-how-title">How it works</h2>
        <ol className="landing-steps">
          <li>Answer 7 short questions about your project</li>
          <li>We produce a directional qualification read</li>
          <li>Review your result and connect with the right team</li>
        </ol>
      </div>

      <div className="landing-trust">
        <p>
          This is an experimental Lite surface. Results are directional only —
          not a binding decision. A human reviewer validates every qualification.
        </p>
      </div>

      <button className="btn-primary" onClick={onStart}>
        Start qualification
      </button>
    </div>
  );
}
