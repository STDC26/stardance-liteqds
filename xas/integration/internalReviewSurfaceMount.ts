// Staging-equivalent internal_review_surface mount logic.
//
// IG-0 scope: a local, repo-resident mount. LiteQDS reaches this surface ONLY
// through the certified LiteQDSXASAdapter — no other path. The mount is
// flag-gated (default OFF) and review-only: it produces a render handoff and a
// bounded telemetry event; it performs no runtime decision.

import { LiteQDSXASAdapter, type XASInsertionResult } from "../adapter/LiteQDSXASAdapter";
import {
  LITEQDS_INTERNAL_REVIEW_FLAG,
  type XASFeatureFlagProvider,
} from "./XASFeatureFlagProvider";
import { buildIntegrationEvent, type IntegrationEvent } from "./integrationTelemetry";

export const INTERNAL_REVIEW_SURFACE = "internal_review_surface";

export interface MountInput {
  flagProvider: XASFeatureFlagProvider;
  envelope: unknown;
  // A reference label for the envelope (e.g. "qds-learn") — never payload.
  fixtureRef: string;
  // Optional fixed timestamp for deterministic telemetry.
  emittedAt?: string;
}

export type MountResult =
  | {
      mounted: false;
      reason: "flag_off";
      telemetryEvent: IntegrationEvent;
    }
  | {
      mounted: true;
      adapterResult: XASInsertionResult;
      telemetryEvent: IntegrationEvent;
    };

const adapter = new LiteQDSXASAdapter();

/**
 * Mount LiteQDS on the internal review surface.
 *
 * Flag OFF  -> not mounted, nothing renders (review-only surface stays empty).
 * Flag ON   -> the certified adapter is invoked with host_surface fixed to
 *              internal_review_surface; the result is handed to the certified
 *              renderer. A bounded telemetry event is produced either way.
 */
export function mountLiteQDSOnInternalReviewSurface(
  input: MountInput,
): MountResult {
  const flagOn = input.flagProvider.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG);

  if (!flagOn) {
    return {
      mounted: false,
      reason: "flag_off",
      telemetryEvent: buildIntegrationEvent({
        event_type: "mount_skipped_flag_off",
        host_surface: INTERNAL_REVIEW_SURFACE,
        flag_state: "off",
        fixture_ref: input.fixtureRef,
        outcome: "not_mounted",
        emitted_at: input.emittedAt,
      }),
    };
  }

  const adapterResult = adapter.insert(input.envelope, {
    host_surface: INTERNAL_REVIEW_SURFACE,
  });
  const rendered = adapterResult.status === "ready_to_render";

  return {
    mounted: true,
    adapterResult,
    telemetryEvent: buildIntegrationEvent({
      event_type: rendered ? "panel_rendered" : "panel_refused",
      host_surface: INTERNAL_REVIEW_SURFACE,
      flag_state: "on",
      fixture_ref: input.fixtureRef,
      outcome: rendered ? "rendered" : "refused",
      fwire_code:
        adapterResult.status === "refused" ? adapterResult.code : undefined,
      emitted_at: input.emittedAt,
    }),
  };
}
