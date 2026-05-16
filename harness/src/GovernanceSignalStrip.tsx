import type { LiteQDSPanelSpec } from "../../src/index";

// The three governance signals here are ALWAYS rendered and never hidden by
// viewport — mobile included (M-02 / M-03 / M-04). No CSS path removes them.
export function GovernanceSignalStrip({ panel }: { panel: LiteQDSPanelSpec }) {
  return (
    <div className="gov-strip" data-testid="governance-signal-strip">
      <span
        className="gov-badge gov-class"
        data-testid="governance-class-badge"
        data-governance-class={panel.governance_class}
      >
        Lite · experimental
      </span>
      <span
        className="gov-badge gov-runtime"
        data-testid="runtime-authorization-indicator"
        data-runtime-authorization={panel.runtime_authorization}
      >
        Not authorized for runtime
      </span>
      <span
        className="gov-badge gov-review"
        data-testid="human-review-required"
        data-human-review-required={String(panel.human_review_required)}
      >
        Human review required
      </span>
    </div>
  );
}
