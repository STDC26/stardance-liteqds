import { describe, expect, it } from "vitest";
import { isBoundedMetadataEvent } from "../integration/integrationTelemetry";
import { runDryRunInsertion } from "./dryRunInsertion";

describe("dry-run insertion simulation", () => {
  it("runs in dry_run mode with no live side effects", () => {
    const result = runDryRunInsertion();
    expect(result.mode).toBe("dry_run");
    expect(result.live_side_effects).toBe(false);
  });

  it("builds and validates the registry insertion manifest", () => {
    expect(runDryRunInsertion().manifest_valid).toBe(true);
  });

  it("registers the detach path before preparing attach", () => {
    const result = runDryRunInsertion();
    expect(result.rollback_ready_before_attach).toBe(true);
    const detachStep = result.steps.findIndex((s) =>
      s.step.includes("register detach"),
    );
    const attachStep = result.steps.findIndex((s) =>
      s.step.includes("prepare attach"),
    );
    expect(detachStep).toBeGreaterThanOrEqual(0);
    expect(attachStep).toBeGreaterThan(detachStep);
  });

  it("simulates a successful registry registration", () => {
    expect(runDryRunInsertion().registry_status).toBe("registered");
  });

  it("inserts with the feature flag OFF", () => {
    expect(runDryRunInsertion().flag_state_at_insertion).toBe("off");
  });

  it("emits only non-outbound, bounded-metadata telemetry", () => {
    const result = runDryRunInsertion();
    expect(result.telemetry_outbound).toBe(false);
    expect(result.telemetry_events.length).toBeGreaterThan(0);
    for (const event of result.telemetry_events) {
      expect(isBoundedMetadataEvent(event)).toBe(true);
    }
  });

  it("is deterministic — identical result across runs", () => {
    expect(JSON.stringify(runDryRunInsertion())).toBe(
      JSON.stringify(runDryRunInsertion()),
    );
  });
});
