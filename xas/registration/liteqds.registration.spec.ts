import { describe, expect, it } from "vitest";
import {
  ELIGIBLE_HOST_SURFACES,
  FORBIDDEN_HOST_SURFACES,
  LITEQDS_REGISTRATION,
  XASRegistrationError,
  createInMemoryRegistry,
  registerLiteQDSWithXAS,
} from "./liteqds.registration";

describe("XAS registration contract", () => {
  it("registers LiteQDS with the XAS registration shape", () => {
    const registry = createInMemoryRegistry();
    const reg = registerLiteQDSWithXAS(registry, {
      allowed_hosts: ["uxc_activation_surface"],
    });
    expect(registry.registered).toContain(reg);
    expect(reg.component_id).toBe("liteqds-panel-v0.1");
    expect(reg.component_type).toBe("qualification_surface_component");
    expect(reg.governance_class).toBe("lite_experimental");
    expect(reg.runtime_authorization).toBe("not_authorized");
    expect(reg.human_review_required).toBe(true);
    expect(reg.promotion_to_proto.promotion_blocking_status).toBe(true);
  });

  it("carries certified-baseline metadata (no recovery claim)", () => {
    const sc = LITEQDS_REGISTRATION.source_chain;
    expect(sc.repo).toBe("STDC26/stardance-liteqds");
    expect(sc.certified_commit).toBe("7d19fb9");
    expect(sc.certification_tag).toBe("liteqds-g1-recovered-v1");
    expect(sc.certification_level).toBe("G1-RECOVERED");
    expect(sc.generator_commit).toBe("d1a02fb");
    expect(sc.harness_commit).toBe("6da0111");
    expect(sc.evidence_index_commit).toBe("4575775");
  });

  it("rejects every forbidden host surface at registration time", () => {
    for (const host of FORBIDDEN_HOST_SURFACES) {
      const registry = createInMemoryRegistry();
      try {
        registerLiteQDSWithXAS(registry, { allowed_hosts: [host] });
        throw new Error("expected rejection");
      } catch (e) {
        expect(e).toBeInstanceOf(XASRegistrationError);
        expect((e as XASRegistrationError).code).toBe("XAS-REG-FORBIDDEN_HOST");
      }
      expect(registry.registered).toHaveLength(0);
    }
  });

  it("rejects non-eligible host surfaces at registration time", () => {
    const registry = createInMemoryRegistry();
    expect(() =>
      registerLiteQDSWithXAS(registry, { allowed_hosts: ["unknown_surface"] }),
    ).toThrow(XASRegistrationError);
    expect(registry.registered).toHaveLength(0);
  });

  it("accepts all eligible host surfaces", () => {
    const registry = createInMemoryRegistry();
    expect(() =>
      registerLiteQDSWithXAS(registry, {
        allowed_hosts: [...ELIGIBLE_HOST_SURFACES],
      }),
    ).not.toThrow();
    expect(registry.registered).toHaveLength(1);
  });

  it("declares the trust-signal and refusal contract", () => {
    const t = LITEQDS_REGISTRATION.trust_signal_contract;
    expect(t.governance_class_visible).toBe(true);
    expect(t.runtime_authorization_visible).toBe(true);
    expect(t.human_review_required_visible).toBe(true);
    expect(t.trust_surface_limitations_visible).toBe(true);
    expect(t.mobile_visibility_hard_locked).toBe(true);
    expect(LITEQDS_REGISTRATION.failure_handling.refusal_surface_owner).toBe(
      "liteqds_component",
    );
    expect(
      LITEQDS_REGISTRATION.failure_handling
        .xas_must_not_wrap_in_xas_branded_error_page,
    ).toBe(true);
  });
});
