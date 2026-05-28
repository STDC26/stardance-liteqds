import { describe, expect, it } from "vitest";
import { isBoundedMetadataEvent } from "../integration/integrationTelemetry";
import { runRollbackDrill } from "./rollbackDrill";
import learn from "../../fixtures/qds-learn.json";

describe("rollback drill — attach-failure to detach-recovery", () => {
  it("runs in dry_run mode with no live side effects", () => {
    const result = runRollbackDrill(learn);
    expect(result.mode).toBe("dry_run");
    expect(result.live_side_effects).toBe(false);
    expect(result.scenario).toBe("attach_failure_to_detach_recovery");
  });

  it("registers the detach path before attach", () => {
    const result = runRollbackDrill(learn);
    expect(result.detach_registered_before_attach).toBe(true);
    expect(result.steps[0]!.step).toMatch(/register detach/);
    expect(result.steps[1]!.step).toMatch(/prepare attach/);
  });

  it("attempts attach, then injects an attach failure", () => {
    const result = runRollbackDrill(learn);
    expect(result.attach_attempted).toBe(true);
    expect(result.attach_failed).toBe(true);
    expect(result.steps[2]!.surface_state).toBe("attached");
    expect(result.steps[3]!.surface_state).toBe("attach_failed");
  });

  it("recovers via single-step detach to a safe detached state", () => {
    const result = runRollbackDrill(learn);
    expect(result.detach_executed).toBe(true);
    expect(result.final_surface_state).toBe("detached_safe");
    expect(result.recovered).toBe(true);
    expect(result.steps[4]!.surface_state).toBe("detached_safe");
  });

  it("emits only bounded-metadata telemetry across the drill", () => {
    const result = runRollbackDrill(learn);
    expect(result.telemetry_events.length).toBeGreaterThan(0);
    for (const event of result.telemetry_events) {
      expect(isBoundedMetadataEvent(event)).toBe(true);
    }
  });

  it("is deterministic — identical result across runs", () => {
    expect(JSON.stringify(runRollbackDrill(learn))).toBe(
      JSON.stringify(runRollbackDrill(learn)),
    );
  });
});
