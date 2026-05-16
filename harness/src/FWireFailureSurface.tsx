import { F_WIRE_OPERATOR_MESSAGES, type FWireCode } from "../../src/index";

// The component's OWN refusal surface. When the harness detects an F-WIRE
// failure it renders this — it is never wrapped in a host-branded error page.
// The refusal is surfaced through the component (GP-06).
export function FWireFailureSurface({
  code,
  detail,
}: {
  code: FWireCode;
  detail?: string;
}) {
  return (
    <section
      className="fwire-surface"
      data-testid="fwire-failure-surface"
      data-surface-owner="liteqds_component"
    >
      <span className="fwire-tag">LiteQDS refusal</span>
      <p className="fwire-code" data-testid="fwire-code">
        {code}
      </p>
      <p className="fwire-message" data-testid="fwire-message">
        {F_WIRE_OPERATOR_MESSAGES[code]}
      </p>
      {detail && (
        <p className="fwire-detail" data-testid="fwire-detail">
          {detail}
        </p>
      )}
    </section>
  );
}
