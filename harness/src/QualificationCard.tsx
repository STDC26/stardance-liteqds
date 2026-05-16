import type { LiteQDSEnvelope } from "../../src/index";
import { GovernanceSignalStrip } from "./GovernanceSignalStrip";
import { DirectionalConfidenceBlock } from "./DirectionalConfidenceBlock";
import { TrustLimitationPanel } from "./TrustLimitationPanel";

// The rendered LiteQDS Qualification Card. Consumes a frozen envelope; renders
// only — it never writes back to the payload.
export function QualificationCard({ envelope }: { envelope: LiteQDSEnvelope }) {
  const { panel_spec: panel } = envelope;

  return (
    <article className="qual-card" data-testid="qualification-card">
      <GovernanceSignalStrip panel={panel} />

      <header className="card-header">
        <h2 className="card-title" data-testid="panel-title">
          {panel.panel_title}
        </h2>
        <p className="card-subject" data-testid="panel-subject-label">
          {panel.panel_subject_label}
        </p>
        <p
          className="card-qual-type"
          data-testid="qualification-type-label"
        >
          {panel.qualification_type_label}
        </p>
      </header>

      <DirectionalConfidenceBlock confidence={panel.suggested_confidence} />

      {panel.band_label && (
        <p className="band-label" data-testid="band-label">
          {panel.band_label}
        </p>
      )}

      <ol className="verdict-list" data-testid="verdict-options">
        {panel.verdict_options_render.map((opt) => (
          <li
            className="verdict-option"
            data-testid="verdict-option"
            data-option-id={opt.option_id}
            data-band={opt.band ?? ""}
            key={opt.option_id}
          >
            <span className="verdict-label">{opt.label}</span>
            <span
              className="verdict-routing"
              data-testid="verdict-routing-summary"
            >
              {opt.routing_summary}
            </span>
          </li>
        ))}
      </ol>

      <TrustLimitationPanel limitations={panel.trust_surface_limitations} />

      <footer className="card-footer">
        <p className="recourse" data-testid="recourse-path">
          <strong>Recourse:</strong> {panel.recourse_path}
        </p>
      </footer>
    </article>
  );
}
