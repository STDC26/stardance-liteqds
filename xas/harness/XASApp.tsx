import { useEffect } from "react";
import type { FWireCode, LiteQDSPanelSpec } from "../../src/index";
// Certified renderer components — imported unchanged, not forked.
import { QualificationCard } from "../../harness/src/QualificationCard";
import { FWireFailureSurface } from "../../harness/src/FWireFailureSurface";
import { isDeeplyFrozen } from "../../harness/src/ImmutabilityGuard";
import { LiteQDSXASAdapter } from "../adapter/LiteQDSXASAdapter";
import learn from "../../fixtures/qds-learn.json";
import mo from "../../fixtures/qds-mo.json";
import signal from "../../fixtures/qds-signal.json";

const FIXTURES: Record<string, unknown> = {
  "qds-learn": learn,
  "qds-mo": mo,
  "qds-signal": signal,
};

// Render-surface concern (not an adapter concern): below this width the trust
// signal set cannot be shown.
const MIN_VIEWPORT_WIDTH = 320;

type Variant =
  | "valid"
  | "malformed"
  | "missing-field"
  | "non-lite"
  | "band-violation";

function applyVariant(source: unknown, variant: Variant): unknown {
  if (variant === "malformed") return "not-an-envelope";
  const clone = structuredClone(source) as {
    panel_spec: Record<string, unknown> & {
      verdict_options_render: { band?: string }[];
    };
  };
  if (variant === "missing-field") {
    delete clone.panel_spec.panel_title;
  } else if (variant === "non-lite") {
    clone.panel_spec.governance_class = "proto_experimental";
  } else if (variant === "band-violation") {
    const opt = clone.panel_spec.verdict_options_render[1];
    if (opt) delete opt.band;
  }
  return clone;
}

// Render-surface band rule: a panel must be fully banded or not banded at all.
function bandRenderingViolation(panel: LiteQDSPanelSpec): boolean {
  const banded = panel.verdict_options_render.filter((o) => o.band).length;
  const total = panel.verdict_options_render.length;
  return banded !== 0 && banded !== total;
}

const adapter = new LiteQDSXASAdapter();

declare global {
  interface Window {
    __LITEQDS_XAS__?: Record<string, unknown>;
  }
}

export function XASApp() {
  const params = new URLSearchParams(window.location.search);
  const fixtureKey = params.get("fixture") ?? "qds-learn";
  const variant = (params.get("variant") ?? "valid") as Variant;
  const host = params.get("host") ?? "uxc_activation_surface";
  const viewportWidth = window.innerWidth;

  const source = FIXTURES[fixtureKey] ?? FIXTURES["qds-learn"];
  const raw = applyVariant(source, variant);

  let outcome:
    | { kind: "rendered"; envelope: ReturnType<typeof adapter.insert> }
    | { kind: "refused"; code: FWireCode; detail: string };

  if (viewportWidth < MIN_VIEWPORT_WIDTH) {
    // F-WIRE-04 is a render-surface concern, surfaced before adapter handoff.
    outcome = {
      kind: "refused",
      code: "F-WIRE-04_VIEWPORT_TOO_SMALL",
      detail: `viewport ${viewportWidth}px < ${MIN_VIEWPORT_WIDTH}px minimum`,
    };
  } else {
    const result = adapter.insert(raw, { host_surface: host });
    if (result.status === "refused") {
      outcome = { kind: "refused", code: result.code, detail: result.detail };
    } else if (bandRenderingViolation(result.frozenEnvelope.panel_spec)) {
      outcome = {
        kind: "refused",
        code: "F-WIRE-05_BAND_RENDERING_VIOLATION",
        detail: "panel is partially banded",
      };
    } else {
      outcome = { kind: "rendered", envelope: result };
    }
  }

  const ready =
    outcome.kind === "rendered" && outcome.envelope.status === "ready_to_render"
      ? outcome.envelope
      : null;
  const frozenEnvelope =
    ready && ready.status === "ready_to_render" ? ready.frozenEnvelope : null;
  const envelopeOriginal = frozenEnvelope ? JSON.stringify(frozenEnvelope) : null;

  useEffect(() => {
    window.__LITEQDS_XAS__ = {
      outcome: outcome.kind,
      fwireCode: outcome.kind === "refused" ? outcome.code : null,
      fixture: fixtureKey,
      variant,
      host,
      viewportWidth,
      adapterRenderTarget:
        outcome.kind === "rendered"
          ? "QualificationCard"
          : "FWireFailureSurface",
      envelopeFrozen: frozenEnvelope ? isDeeplyFrozen(frozenEnvelope) : null,
      promotionBlocked:
        frozenEnvelope?.insertion_brief.promotion_blocking_status ?? null,
      envelopeOriginal,
      envelopeRendered: frozenEnvelope ? JSON.stringify(frozenEnvelope) : null,
      attemptMutation: () => {
        if (!frozenEnvelope) return true;
        try {
          (frozenEnvelope.panel_spec as { panel_title: string }).panel_title =
            "MUTATED";
        } catch {
          return true;
        }
        return frozenEnvelope.panel_spec.panel_title !== "MUTATED";
      },
    };
  });

  return (
    <main className="harness-root">
      <div className="harness-controls" data-testid="xas-harness-controls">
        <span className="harness-tag">LiteQDS XAS Integration Harness</span>
        <span className="harness-meta">
          fixture: {fixtureKey} · variant: {variant} · host: {host} · via XAS
          adapter
        </span>
      </div>
      {frozenEnvelope ? (
        <QualificationCard envelope={frozenEnvelope} />
      ) : outcome.kind === "refused" ? (
        <FWireFailureSurface code={outcome.code} detail={outcome.detail} />
      ) : null}
    </main>
  );
}
