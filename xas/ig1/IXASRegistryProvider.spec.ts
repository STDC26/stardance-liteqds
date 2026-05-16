import { describe, expect, it } from "vitest";
import { LITEQDS_REGISTRATION } from "../registration/liteqds.registration";
import { DryRunRegistryProvider } from "./IXASRegistryProvider";

describe("IXASRegistryProvider — dry-run", () => {
  it("operates in dry_run mode", () => {
    expect(new DryRunRegistryProvider().mode).toBe("dry_run");
  });

  it("simulates a successful registration for eligible hosts", () => {
    const provider = new DryRunRegistryProvider();
    const outcome = provider.register({
      component: LITEQDS_REGISTRATION,
      allowed_hosts: ["internal_review_surface"],
    });
    expect(outcome.status).toBe("registered");
    expect(outcome.mode).toBe("dry_run");
    expect(outcome.detail).toMatch(/no live registry/i);
    expect(provider.isRegistered("liteqds-panel-v0.1")).toBe(true);
    expect(provider.listRegistered()).toContain("liteqds-panel-v0.1");
  });

  it("rejects forbidden host surfaces", () => {
    const provider = new DryRunRegistryProvider();
    const outcome = provider.register({
      component: LITEQDS_REGISTRATION,
      allowed_hosts: ["production_runtime_surface"],
    });
    expect(outcome.status).toBe("rejected");
    expect(outcome.rejection_code).toBe("XAS-REG-FORBIDDEN_HOST");
    expect(provider.isRegistered("liteqds-panel-v0.1")).toBe(false);
  });

  it("rejects non-eligible host surfaces", () => {
    const provider = new DryRunRegistryProvider();
    const outcome = provider.register({
      component: LITEQDS_REGISTRATION,
      allowed_hosts: ["unknown_surface"],
    });
    expect(outcome.status).toBe("rejected");
    expect(outcome.rejection_code).toBe("XAS-REG-INELIGIBLE_HOST");
  });

  it("registers nothing when the routing config is rejected", () => {
    const provider = new DryRunRegistryProvider();
    provider.register({
      component: LITEQDS_REGISTRATION,
      allowed_hosts: ["customer_facing_surface"],
    });
    expect(provider.listRegistered()).toHaveLength(0);
  });
});
