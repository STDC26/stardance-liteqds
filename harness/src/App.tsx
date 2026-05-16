import { useEffect } from "react";
import {
  validateEnvelope,
  type FWireCode,
  type LiteQDSEnvelope,
  type LiteQDSPanelSpec,
} from "../../src/index";
import { deepFreeze, isDeeplyFrozen } from "./ImmutabilityGuard";
import { QualificationCard } from "./QualificationCard";
import { FWireFailureSurface } from "./FWireFailureSurface";
import learn from "../../fixtures/qds-learn.json";
import mo from "../../fixtures/qds-mo.json";
import signal from "../../fixtures/qds-signal.json";

const FIXTURES: Record<string, unknown> = {
  "qds-learn": learn,
  "qds-mo": mo,
  "qds-signal": signal,
};

// Below this width the trust-signal set cannot be shown — fail closed (F-WIRE-04).
const MIN_VIEWPORT_WIDTH = 320;

type Variant =
  | "valid"
  | "malformed"
  | "missing-field"
  | "non-lite"
  | "band-violation";

// Corruption variants let the G1 suite exercise each F-WIRE path. Applied to a
// deep clone so the source fixture is never touched.
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
    // Remove the band from one option only — passes schema's loose band rule
    // but leaves a partially-banded panel the harness must refuse.
    const opt = clone.panel_spec.verdict_options_render[1];
    if (opt) delete opt.band;
  }
  return clone;
}

function hostFailure(host: string, brief: LiteQDSEnvelope["insertion_brief"]) {
  if (brief.forbidden_host_surfaces.includes(host)) return true;
  return !brief.eligible_host_surfaces.includes(host);
}

// Band rendering rule: a panel must be either fully banded or not banded at
// all. A partially-banded panel is a rendering violation (F-WIRE-05).
function bandRenderingViolation(panel: LiteQDSPanelSpec): boolean {
  const banded = panel.verdict_options_render.filter((o) => o.band).length;
  const total = panel.verdict_options_render.length;
  return banded !== 0 && banded !== total;
}

type Outcome =
  | { kind: "rendered"; envelope: LiteQDSEnvelope }
  | { kind: "refused"; code: FWireCode; detail?: string };

function resolve(raw: unknown, host: string | null, viewportWidth: number): {
  outcome: Outcome;
  host: string;
} {
  if (viewportWidth < MIN_VIEWPORT_WIDTH) {
    return {
      outcome: {
        kind: "refused",
        code: "F-WIRE-04_VIEWPORT_TOO_SMALL",
        detail: `viewport ${viewportWidth}px < ${MIN_VIEWPORT_WIDTH}px minimum`,
      },
      host: host ?? "(unresolved)",
    };
  }
  const v = validateEnvelope(raw);
  if (!v.ok) {
    return {
      outcome: { kind: "refused", code: v.code, detail: v.detail },
      host: host ?? "(unresolved)",
    };
  }
  const env = v.envelope;
  const resolvedHost = host ?? env.insertion_brief.eligible_host_surfaces[0]!;
  if (hostFailure(resolvedHost, env.insertion_brief)) {
    return {
      outcome: {
        kind: "refused",
        code: "F-WIRE-06_FORBIDDEN_HOST_SURFACE",
        detail: `host '${resolvedHost}' is not an eligible surface`,
      },
      host: resolvedHost,
    };
  }
  if (bandRenderingViolation(env.panel_spec)) {
    return {
      outcome: {
        kind: "refused",
        code: "F-WIRE-05_BAND_RENDERING_VIOLATION",
        detail: "panel is partially banded",
      },
      host: resolvedHost,
    };
  }
  return { outcome: { kind: "rendered", envelope: env }, host: resolvedHost };
}

declare global {
  interface Window {
    __LITEQDS__?: Record<string, unknown>;
  }
}

export function App() {
  const params = new URLSearchParams(window.location.search);
  const fixtureKey = params.get("fixture") ?? "qds-learn";
  const variant = (params.get("variant") ?? "valid") as Variant;
  const hostParam = params.get("host");

  const source = FIXTURES[fixtureKey] ?? FIXTURES["qds-learn"];
  const raw = applyVariant(source, variant);
  const { outcome, host } = resolve(raw, hostParam, window.innerWidth);

  const frozen =
    outcome.kind === "rendered" ? deepFreeze(outcome.envelope) : null;
  const envelopeOriginal = frozen ? JSON.stringify(frozen) : null;

  useEffect(() => {
    window.__LITEQDS__ = {
      outcome: outcome.kind,
      fwireCode: outcome.kind === "refused" ? outcome.code : null,
      fixture: fixtureKey,
      variant,
      host,
      viewportWidth: window.innerWidth,
      envelopeFrozen: frozen ? isDeeplyFrozen(frozen) : null,
      promotionBlocked:
        frozen?.insertion_brief.promotion_blocking_status ?? null,
      envelopeOriginal,
      // Re-serialized after render — equal to original proves no mutation.
      envelopeRendered: frozen ? JSON.stringify(frozen) : null,
      attemptMutation: () => {
        if (!frozen) return true;
        try {
          (frozen.panel_spec as { panel_title: string }).panel_title =
            "MUTATED";
        } catch {
          return true; // write threw — payload is immutable
        }
        return frozen.panel_spec.panel_title !== "MUTATED";
      },
    };
  });

  return (
    <main className="harness-root">
      <div className="harness-controls" data-testid="harness-controls">
        <span className="harness-tag">LiteQDS Controlled Render Harness</span>
        <span className="harness-meta">
          fixture: {fixtureKey} · variant: {variant} · host: {host}
        </span>
      </div>
      {outcome.kind === "rendered" && frozen ? (
        <QualificationCard envelope={frozen} />
      ) : outcome.kind === "refused" ? (
        <FWireFailureSurface code={outcome.code} detail={outcome.detail} />
      ) : null}
    </main>
  );
}
