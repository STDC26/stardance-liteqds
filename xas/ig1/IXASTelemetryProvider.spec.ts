import { describe, expect, it } from "vitest";
import { buildIntegrationEvent } from "../integration/integrationTelemetry";
import { IntegrationTelemetryViolation } from "../integration/integrationTelemetry";
import { InMemoryTelemetryProvider } from "./IXASTelemetryProvider";

function event(ref: string, at: string) {
  return buildIntegrationEvent({
    event_type: "panel_rendered",
    host_surface: "internal_review_surface",
    flag_state: "on",
    fixture_ref: ref,
    outcome: "rendered",
    emitted_at: at,
  });
}

describe("IXASTelemetryProvider — in-memory dry-run", () => {
  it("is a non-outbound dry-run provider", () => {
    const provider = new InMemoryTelemetryProvider();
    expect(provider.mode).toBe("dry_run");
    expect(provider.outbound).toBe(false);
  });

  it("records emitted events and reads them back", () => {
    const provider = new InMemoryTelemetryProvider();
    provider.emit(event("qds-learn", "2026-03-01T00:00:00.000Z"));
    expect(provider.count).toBe(1);
    expect(provider.readAll()[0]!.fixture_ref).toBe("qds-learn");
  });

  it("is append-only — earlier events are unchanged by later emits", () => {
    const provider = new InMemoryTelemetryProvider();
    const e1 = event("qds-learn", "2026-03-01T00:00:00.000Z");
    provider.emit(e1);
    const snapshotAfterFirst = [...provider.readAll()];
    provider.emit(event("qds-mo", "2026-03-01T00:01:00.000Z"));
    expect(provider.count).toBe(2);
    expect(provider.readAll()[0]).toEqual(snapshotAfterFirst[0]);
    expect(provider.readAll()[0]).toEqual(e1);
  });

  it("rejects an event carrying a forbidden (DTO-like) field", () => {
    const provider = new InMemoryTelemetryProvider();
    expect(() =>
      provider.emit({ dto: "x" } as never),
    ).toThrow(IntegrationTelemetryViolation);
    expect(provider.count).toBe(0);
  });
});
