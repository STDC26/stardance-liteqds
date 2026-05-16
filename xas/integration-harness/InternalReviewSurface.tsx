import { useEffect } from "react";
import type { FWireCode, LiteQDSEnvelope, LiteQDSPanelSpec } from "../../src/index";
import { QualificationCard } from "../../harness/src/QualificationCard";
import { FWireFailureSurface } from "../../harness/src/FWireFailureSurface";
import { isDeeplyFrozen } from "../../harness/src/ImmutabilityGuard";
import {
  LITEQDS_INTERNAL_REVIEW_FLAG,
  flagProviderFromQuery,
} from "../integration/XASFeatureFlagProvider";
import {
  INTERNAL_REVIEW_SURFACE,
  mountLiteQDSOnInternalReviewSurface,
} from "../integration/internalReviewSurfaceMount";
import {
  buildIntegrationEvent,
  type IntegrationEvent,
} from "../integration/integrationTelemetry";
import learn from "../../fixtures/qds-learn.json";
import mo from "../../fixtures/qds-mo.json";
import signal from "../../fixtures/qds-signal.json";

const FIXTURES: Record<string, unknown> = {
  "qds-learn": learn,
  "qds-mo": mo,
  "qds-signal": signal,
};

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
  if (variant === "missing-field") delete clone.panel_spec.panel_title;
  else if (variant === "non-lite")
    clone.panel_spec.governance_class = "proto_experimental";
  else if (variant === "band-violation") {
    const opt = clone.panel_spec.verdict_options_render[1];
    if (opt) delete opt.band;
  }
  return clone;
}

function bandRenderingViolation(panel: LiteQDSPanelSpec): boolean {
  const banded = panel.verdict_options_render.filter((o) => o.band).length;
  const total = panel.verdict_options_render.length;
  return banded !== 0 && banded !== total;
}

declare global {
  interface Window {
    __XAS_INT__?: Record<string, unknown>;
    __XAS_INT_EVENTS__?: IntegrationEvent[];
  }
}

type Display =
  | { kind: "empty" }
  | { kind: "card"; envelope: LiteQDSEnvelope }
  | { kind: "fwire"; code: FWireCode; detail?: string };

export function InternalReviewSurface() {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const flagProvider = flagProviderFromQuery(search);
  const flagOn = flagProvider.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG);
  const fixtureKey = params.get("fixture") ?? "qds-learn";
  const variant = (params.get("variant") ?? "valid") as Variant;
  const viewportWidth = window.innerWidth;

  const raw = applyVariant(FIXTURES[fixtureKey] ?? FIXTURES["qds-learn"], variant);
  const mountResult = mountLiteQDSOnInternalReviewSurface({
    flagProvider,
    envelope: raw,
    fixtureRef: fixtureKey,
  });

  let display: Display;
  let telemetryEvent: IntegrationEvent = mountResult.telemetryEvent;

  if (!mountResult.mounted) {
    display = { kind: "empty" };
  } else if (viewportWidth < MIN_VIEWPORT_WIDTH) {
    // Render-surface refusal (F-WIRE-04) — overrides the adapter outcome.
    display = {
      kind: "fwire",
      code: "F-WIRE-04_VIEWPORT_TOO_SMALL",
      detail: `viewport ${viewportWidth}px < ${MIN_VIEWPORT_WIDTH}px minimum`,
    };
    telemetryEvent = buildIntegrationEvent({
      event_type: "panel_refused",
      host_surface: INTERNAL_REVIEW_SURFACE,
      flag_state: "on",
      fixture_ref: fixtureKey,
      outcome: "refused",
      fwire_code: "F-WIRE-04_VIEWPORT_TOO_SMALL",
    });
  } else if (mountResult.adapterResult.status === "refused") {
    display = {
      kind: "fwire",
      code: mountResult.adapterResult.code,
      detail: mountResult.adapterResult.detail,
    };
  } else {
    const frozen = mountResult.adapterResult.frozenEnvelope;
    if (bandRenderingViolation(frozen.panel_spec)) {
      display = {
        kind: "fwire",
        code: "F-WIRE-05_BAND_RENDERING_VIOLATION",
        detail: "panel is partially banded",
      };
      telemetryEvent = buildIntegrationEvent({
        event_type: "panel_refused",
        host_surface: INTERNAL_REVIEW_SURFACE,
        flag_state: "on",
        fixture_ref: fixtureKey,
        outcome: "refused",
        fwire_code: "F-WIRE-05_BAND_RENDERING_VIOLATION",
      });
    } else {
      display = { kind: "card", envelope: frozen };
    }
  }

  const cardEnvelope = display.kind === "card" ? display.envelope : null;

  useEffect(() => {
    // Append-only: never rewrite earlier events in this page session.
    const events = (window.__XAS_INT_EVENTS__ ??= []);
    events.push(telemetryEvent);

    window.__XAS_INT__ = {
      flagState: flagOn ? "on" : "off",
      mounted: mountResult.mounted,
      outcome:
        display.kind === "empty"
          ? "not_mounted"
          : display.kind === "card"
            ? "rendered"
            : "refused",
      fwireCode: display.kind === "fwire" ? display.code : null,
      fixture: fixtureKey,
      variant,
      hostSurface: INTERNAL_REVIEW_SURFACE,
      reviewerGroup: telemetryEvent.reviewer_group,
      envelopeFrozen: cardEnvelope ? isDeeplyFrozen(cardEnvelope) : null,
      runtimeAuthorization:
        cardEnvelope?.panel_spec.runtime_authorization ?? null,
      promotionBlocked:
        cardEnvelope?.insertion_brief.promotion_blocking_status ?? null,
      telemetryEvent,
      eventCount: events.length,
      attemptMutation: () => {
        if (!cardEnvelope) return true;
        try {
          (cardEnvelope.panel_spec as { panel_title: string }).panel_title =
            "MUTATED";
        } catch {
          return true;
        }
        return cardEnvelope.panel_spec.panel_title !== "MUTATED";
      },
    };
  });

  return (
    <main className="harness-root" data-testid="internal-review-surface">
      <div className="irs-banner" data-testid="irs-banner">
        <span className="irs-banner-tag">
          internal_review_surface · staging-equivalent
        </span>
        <span className="irs-banner-meta">
          flag: {flagOn ? "ON" : "OFF"} · fixture: {fixtureKey} · variant:{" "}
          {variant} · review_only
        </span>
      </div>

      {display.kind === "empty" && (
        <div className="irs-empty" data-testid="internal-review-surface-empty">
          <p className="irs-empty-title">LiteQDS panel not mounted</p>
          <p className="irs-empty-detail">
            Feature flag <code>{LITEQDS_INTERNAL_REVIEW_FLAG}</code> is OFF.
          </p>
        </div>
      )}
      {display.kind === "card" && (
        <QualificationCard envelope={display.envelope} />
      )}
      {display.kind === "fwire" && (
        <FWireFailureSurface code={display.code} detail={display.detail} />
      )}
    </main>
  );
}
