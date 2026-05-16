import { describe, expect, it } from "vitest";
import {
  buildRegistryInsertionManifest,
  validateRegistryInsertionManifest,
} from "./registryInsertionManifest";

const canonical = () =>
  buildRegistryInsertionManifest({ reviewer_group_id: "liteqds_internal_review_alpha" });

describe("registry insertion manifest schema", () => {
  it("validates the canonical IG-1 manifest", () => {
    const result = validateRegistryInsertionManifest(canonical());
    expect(result.ok, result.ok ? "" : result.detail).toBe(true);
  });

  it("requires a rollback protocol — a manifest without it is rejected", () => {
    const { rollback_protocol, ...withoutRollback } = canonical();
    void rollback_protocol;
    const result = validateRegistryInsertionManifest(withoutRollback);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.detail).toMatch(/rollback_protocol/);
  });

  it("rejects a manifest that asserts runtime authorization", () => {
    const tampered = canonical();
    (tampered.governance as { runtime_authorization: string }).runtime_authorization =
      "authorized";
    expect(validateRegistryInsertionManifest(tampered).ok).toBe(false);
  });

  it("rejects a manifest with outbound telemetry", () => {
    const tampered = canonical();
    (tampered.telemetry as { outbound: boolean }).outbound = true;
    expect(validateRegistryInsertionManifest(tampered).ok).toBe(false);
  });

  it("rejects a manifest whose feature flag does not default OFF", () => {
    const tampered = canonical();
    (tampered.feature_flag as { default_state: string }).default_state = "on";
    expect(validateRegistryInsertionManifest(tampered).ok).toBe(false);
  });

  it("rejects a manifest targeting a forbidden host surface", () => {
    const tampered = canonical();
    (tampered.host_binding as { target_host_surface: string }).target_host_surface =
      "production_runtime_surface";
    expect(validateRegistryInsertionManifest(tampered).ok).toBe(false);
  });

  it("rejects unknown extra fields (strict schema)", () => {
    const tampered = { ...canonical(), sneaky_runtime_hook: true };
    expect(validateRegistryInsertionManifest(tampered).ok).toBe(false);
  });

  it("requires single-step detach in the rollback protocol", () => {
    const tampered = canonical();
    (tampered.rollback_protocol as { single_step_detach: boolean }).single_step_detach =
      false;
    expect(validateRegistryInsertionManifest(tampered).ok).toBe(false);
  });
});
