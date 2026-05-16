// IG1-PREFLIGHT-01..15 — dry-run preflight validation suite.
//
// Every check is dry-run only: no live registry, no real surface, no live
// flag, no outbound telemetry. The suite proves the IG-1 preparation package
// is internally consistent and safe BEFORE any attach-capable operation
// exists.

import { describe, expect, it } from "vitest";
import { LITEQDS_REGISTRATION } from "../registration/liteqds.registration";
import { isBoundedMetadataEvent } from "../integration/integrationTelemetry";
import { DryRunRegistryProvider } from "./IXASRegistryProvider";
import { InMemoryTelemetryProvider } from "./IXASTelemetryProvider";
import {
  FeatureFlagProviderRegistry,
  LITEQDS_INTERNAL_REVIEW_FLAG,
  LocalFeatureFlagProvider,
  StaticFeatureFlagProvider,
} from "./featureFlagProviders";
import {
  ReviewerGroupConfigError,
  bindReviewerGroup,
} from "./reviewerGroupConfig";
import {
  buildRegistryInsertionManifest,
  validateRegistryInsertionManifest,
} from "./registryInsertionManifest";
import {
  RollbackBeforeAttachProtocol,
  RollbackBeforeAttachViolation,
} from "./rollbackBeforeAttach";
import { runDryRunInsertion } from "./dryRunInsertion";
import { buildIntegrationEvent } from "../integration/integrationTelemetry";

describe("IG1-PREFLIGHT — dry-run preflight validation", () => {
  it("IG1-PREFLIGHT-01 · registry provider operates in dry_run mode", () => {
    expect(new DryRunRegistryProvider().mode).toBe("dry_run");
  });

  it("IG1-PREFLIGHT-02 · registry registration contacts no live registry", () => {
    const outcome = new DryRunRegistryProvider().register({
      component: LITEQDS_REGISTRATION,
      allowed_hosts: ["internal_review_surface"],
    });
    expect(outcome.mode).toBe("dry_run");
    expect(outcome.detail).toMatch(/no live registry/i);
  });

  it("IG1-PREFLIGHT-03 · dry-run registration succeeds for internal_review_surface", () => {
    const outcome = new DryRunRegistryProvider().register({
      component: LITEQDS_REGISTRATION,
      allowed_hosts: ["internal_review_surface"],
    });
    expect(outcome.status).toBe("registered");
  });

  it("IG1-PREFLIGHT-04 · dry-run registration rejects forbidden hosts", () => {
    const outcome = new DryRunRegistryProvider().register({
      component: LITEQDS_REGISTRATION,
      allowed_hosts: ["production_runtime_surface"],
    });
    expect(outcome.status).toBe("rejected");
    expect(outcome.rejection_code).toBe("XAS-REG-FORBIDDEN_HOST");
  });

  it("IG1-PREFLIGHT-05 · telemetry provider is append-only", () => {
    const provider = new InMemoryTelemetryProvider();
    const e1 = buildIntegrationEvent({
      event_type: "preflight",
      host_surface: "internal_review_surface",
      flag_state: "off",
      fixture_ref: "n/a",
      outcome: "ok",
      emitted_at: "2026-03-15T00:00:00.000Z",
    });
    provider.emit(e1);
    const first = [...provider.readAll()];
    provider.emit(
      buildIntegrationEvent({
        event_type: "preflight",
        host_surface: "internal_review_surface",
        flag_state: "off",
        fixture_ref: "n/a",
        outcome: "ok",
        emitted_at: "2026-03-15T00:01:00.000Z",
      }),
    );
    expect(provider.readAll()[0]).toEqual(first[0]);
    expect(provider.count).toBe(2);
  });

  it("IG1-PREFLIGHT-06 · telemetry provider is non-outbound", () => {
    expect(new InMemoryTelemetryProvider().outbound).toBe(false);
  });

  it("IG1-PREFLIGHT-07 · telemetry events are metadata-bounded", () => {
    const result = runDryRunInsertion();
    for (const event of result.telemetry_events) {
      expect(isBoundedMetadataEvent(event)).toBe(true);
    }
  });

  it("IG1-PREFLIGHT-08 · feature flag defaults OFF across providers", () => {
    expect(
      new LocalFeatureFlagProvider().isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG),
    ).toBe(false);
    expect(
      new StaticFeatureFlagProvider({}).isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG),
    ).toBe(false);
    expect(
      new FeatureFlagProviderRegistry().isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG),
    ).toBe(false);
  });

  it("IG1-PREFLIGHT-09 · feature flag provider is swappable", () => {
    const registry = new FeatureFlagProviderRegistry();
    registry.registerProvider("a", new LocalFeatureFlagProvider());
    registry.registerProvider(
      "b",
      new StaticFeatureFlagProvider({ [LITEQDS_INTERNAL_REVIEW_FLAG]: true }),
    );
    registry.activate("a");
    expect(registry.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)).toBe(false);
    registry.activate("b");
    expect(registry.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)).toBe(true);
  });

  it("IG1-PREFLIGHT-10 · reviewer group is config-injected, no hardcoded identities", () => {
    const binding = bindReviewerGroup({ group_id: "internal_review_pod_b" });
    expect(binding.injected_via).toBe("config");
    expect(() => bindReviewerGroup({ group_id: "jane@example.com" })).toThrow(
      ReviewerGroupConfigError,
    );
  });

  it("IG1-PREFLIGHT-11 · registry insertion manifest validates a well-formed manifest", () => {
    const manifest = buildRegistryInsertionManifest({
      reviewer_group_id: "liteqds_internal_review_alpha",
    });
    expect(validateRegistryInsertionManifest(manifest).ok).toBe(true);
  });

  it("IG1-PREFLIGHT-12 · manifest missing the rollback protocol is rejected", () => {
    const { rollback_protocol, ...withoutRollback } =
      buildRegistryInsertionManifest({
        reviewer_group_id: "liteqds_internal_review_alpha",
      });
    void rollback_protocol;
    expect(validateRegistryInsertionManifest(withoutRollback).ok).toBe(false);
  });

  it("IG1-PREFLIGHT-13 · rollback-before-attach — detach must precede attach", () => {
    const protocol = new RollbackBeforeAttachProtocol();
    expect(() =>
      protocol.prepareAttach({ id: "attach.x", description: "x" }),
    ).toThrow(RollbackBeforeAttachViolation);
    protocol.registerDetach({
      id: "detach.flag-off",
      description: "flag OFF",
      single_step: true,
    });
    expect(
      protocol.prepareAttach({ id: "attach.x", description: "x" })
        .rollback_verified_before_attach,
    ).toBe(true);
  });

  it("IG1-PREFLIGHT-14 · dry-run insertion produces no live side effects", () => {
    const result = runDryRunInsertion();
    expect(result.mode).toBe("dry_run");
    expect(result.live_side_effects).toBe(false);
    expect(result.telemetry_outbound).toBe(false);
    expect(result.flag_state_at_insertion).toBe("off");
  });

  it("IG1-PREFLIGHT-15 · runtime prohibition intact in the insertion manifest", () => {
    const manifest = buildRegistryInsertionManifest({
      reviewer_group_id: "liteqds_internal_review_alpha",
    });
    expect(manifest.governance.runtime_authorization).toBe("not_authorized");
    expect(manifest.governance.promotion_blocking_status).toBe(true);
    // A manifest that asserts runtime authorization cannot validate.
    const tampered = { ...manifest, governance: { ...manifest.governance, runtime_authorization: "authorized" } };
    expect(validateRegistryInsertionManifest(tampered).ok).toBe(false);
  });
});
