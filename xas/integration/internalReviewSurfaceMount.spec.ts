import { describe, expect, it } from "vitest";
import { LocalFeatureFlagProvider, LITEQDS_INTERNAL_REVIEW_FLAG } from "./XASFeatureFlagProvider";
import { isBoundedMetadataEvent } from "./integrationTelemetry";
import {
  INTERNAL_REVIEW_SURFACE,
  mountLiteQDSOnInternalReviewSurface,
} from "./internalReviewSurfaceMount";
import learn from "../../fixtures/qds-learn.json";

const flagOn = () =>
  new LocalFeatureFlagProvider({ [LITEQDS_INTERNAL_REVIEW_FLAG]: true });
const flagOff = () => new LocalFeatureFlagProvider();

describe("internal_review_surface mount", () => {
  it("does not mount when the flag is OFF", () => {
    const result = mountLiteQDSOnInternalReviewSurface({
      flagProvider: flagOff(),
      envelope: learn,
      fixtureRef: "qds-learn",
    });
    expect(result.mounted).toBe(false);
    if (result.mounted) return;
    expect(result.reason).toBe("flag_off");
    expect(result.telemetryEvent.flag_state).toBe("off");
    expect(result.telemetryEvent.outcome).toBe("not_mounted");
  });

  it("mounts a review-only panel when the flag is ON", () => {
    const result = mountLiteQDSOnInternalReviewSurface({
      flagProvider: flagOn(),
      envelope: learn,
      fixtureRef: "qds-learn",
    });
    expect(result.mounted).toBe(true);
    if (!result.mounted) return;
    expect(result.adapterResult.status).toBe("ready_to_render");
    expect(result.telemetryEvent.flag_state).toBe("on");
    expect(result.telemetryEvent.outcome).toBe("rendered");
  });

  it("reaches the surface only through the certified adapter (host fixed)", () => {
    const result = mountLiteQDSOnInternalReviewSurface({
      flagProvider: flagOn(),
      envelope: learn,
      fixtureRef: "qds-learn",
    });
    if (!result.mounted) throw new Error("expected mount");
    if (result.adapterResult.status !== "ready_to_render") {
      throw new Error("expected ready");
    }
    expect(result.adapterResult.host_context.host_surface).toBe(
      INTERNAL_REVIEW_SURFACE,
    );
    expect(result.adapterResult.envelope_frozen).toBe(true);
  });

  it("surfaces an F-WIRE refusal (still mounted) on a malformed envelope", () => {
    const result = mountLiteQDSOnInternalReviewSurface({
      flagProvider: flagOn(),
      envelope: "not-an-envelope",
      fixtureRef: "qds-learn",
    });
    expect(result.mounted).toBe(true);
    if (!result.mounted) return;
    expect(result.adapterResult.status).toBe("refused");
    expect(result.telemetryEvent.outcome).toBe("refused");
    expect(result.telemetryEvent.fwire_code).toBe(
      "F-WIRE-01_MALFORMED_ENVELOPE",
    );
  });

  it("emits only bounded-metadata telemetry (no payload / DTO / trace)", () => {
    for (const provider of [flagOff(), flagOn()]) {
      const result = mountLiteQDSOnInternalReviewSurface({
        flagProvider: provider,
        envelope: learn,
        fixtureRef: "qds-learn",
      });
      expect(isBoundedMetadataEvent(result.telemetryEvent)).toBe(true);
    }
  });
});
