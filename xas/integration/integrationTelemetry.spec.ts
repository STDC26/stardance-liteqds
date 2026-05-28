import { afterEach, describe, expect, it } from "vitest";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  ALLOWED_EVENT_FIELDS,
  IntegrationTelemetryViolation,
  assertBoundedMetadata,
  buildIntegrationEvent,
  isBoundedMetadataEvent,
} from "./integrationTelemetry";
import {
  appendIntegrationEvent,
  readIntegrationEvents,
} from "./integrationTelemetrySink";

const tmpSink = join(tmpdir(), `liteqds-int-events-${process.pid}.jsonl`);

afterEach(() => {
  if (existsSync(tmpSink)) rmSync(tmpSink);
});

describe("integration telemetry", () => {
  it("builds a bounded-metadata event with fixed component + reviewer group", () => {
    const event = buildIntegrationEvent({
      event_type: "panel_rendered",
      host_surface: "internal_review_surface",
      flag_state: "on",
      fixture_ref: "qds-learn",
      outcome: "rendered",
      emitted_at: "2026-03-01T00:00:00.000Z",
    });
    expect(event.event_id).toMatch(/^xas-int-/);
    expect(event.component_id).toBe("liteqds-panel-v0.1");
    expect(event.reviewer_group).toBe("liteqds_internal_review_alpha");
    expect(isBoundedMetadataEvent(event)).toBe(true);
  });

  it("rejects DTO / trace / payload / confidence fields", () => {
    for (const field of [
      "dto",
      "decision_trace",
      "trace",
      "payload",
      "panel_title",
      "panel_subject_label",
      "institutional_confidence",
      "suggested_confidence",
      "verdict_options",
    ]) {
      expect(() => assertBoundedMetadata({ [field]: "x" })).toThrow(
        IntegrationTelemetryViolation,
      );
    }
  });

  it("rejects any field outside the allow-list", () => {
    expect(() => assertBoundedMetadata({ unexpected_field: "x" })).toThrow(
      IntegrationTelemetryViolation,
    );
  });

  it("rejects non-string values (could smuggle a payload)", () => {
    expect(() =>
      assertBoundedMetadata({ event_type: { nested: "x" } } as never),
    ).toThrow(IntegrationTelemetryViolation);
  });

  it("only exposes metadata fields — no payload keys in the allow-list", () => {
    for (const field of ALLOWED_EVENT_FIELDS) {
      expect(field).not.toMatch(/title|subject|payload|dto|trace|confidence/i);
    }
  });

  it("appends events without modifying earlier ones (append-only)", () => {
    const e1 = buildIntegrationEvent({
      event_type: "mount_skipped_flag_off",
      host_surface: "internal_review_surface",
      flag_state: "off",
      fixture_ref: "qds-learn",
      outcome: "not_mounted",
      emitted_at: "2026-03-01T00:00:00.000Z",
    });
    const e2 = buildIntegrationEvent({
      event_type: "panel_rendered",
      host_surface: "internal_review_surface",
      flag_state: "on",
      fixture_ref: "qds-mo",
      outcome: "rendered",
      emitted_at: "2026-03-01T00:01:00.000Z",
    });
    appendIntegrationEvent(tmpSink, e1);
    const afterFirst = readIntegrationEvents(tmpSink);
    appendIntegrationEvent(tmpSink, e2);
    const afterSecond = readIntegrationEvents(tmpSink);

    expect(afterFirst).toHaveLength(1);
    expect(afterSecond).toHaveLength(2);
    // The first record is byte-identical after the second append.
    expect(afterSecond[0]).toEqual(afterFirst[0]);
    expect(afterSecond[1]).toEqual(e2);
  });
});
