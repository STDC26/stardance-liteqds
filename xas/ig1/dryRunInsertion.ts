// IG-1 PREPARATION — dry-run insertion simulation.
//
// Simulates the full IG-1 registry insertion sequence using only the dry-run
// abstractions. It produces NO live side effect: no live registry is
// contacted, no real flag is flipped, no outbound telemetry is sent. The
// result is an evidence record of what an IG-1 insertion WOULD do.

import { LITEQDS_REGISTRATION } from "../registration/liteqds.registration";
import {
  buildIntegrationEvent,
  type IntegrationEvent,
} from "../integration/integrationTelemetry";
import { DryRunRegistryProvider } from "./IXASRegistryProvider";
import { InMemoryTelemetryProvider } from "./IXASTelemetryProvider";
import {
  FeatureFlagProviderRegistry,
  LITEQDS_INTERNAL_REVIEW_FLAG,
  LocalFeatureFlagProvider,
} from "./featureFlagProviders";
import { bindReviewerGroup } from "./reviewerGroupConfig";
import {
  buildRegistryInsertionManifest,
  validateRegistryInsertionManifest,
} from "./registryInsertionManifest";
import { RollbackBeforeAttachProtocol } from "./rollbackBeforeAttach";

export interface DryRunStep {
  step: string;
  outcome: string;
}

export interface DryRunInsertionResult {
  mode: "dry_run";
  live_side_effects: false;
  steps: DryRunStep[];
  manifest_valid: boolean;
  registry_status: "registered" | "rejected";
  flag_state_at_insertion: "on" | "off";
  rollback_ready_before_attach: boolean;
  telemetry_outbound: boolean;
  telemetry_events: IntegrationEvent[];
}

/**
 * Run the IG-1 insertion as a dry run. Deterministic — fixed timestamps.
 */
export function runDryRunInsertion(
  opts: { reviewer_group_id?: string } = {},
): DryRunInsertionResult {
  const steps: DryRunStep[] = [];
  const telemetry = new InMemoryTelemetryProvider();

  // 1 · build + validate the registry insertion manifest
  const reviewerBinding = bindReviewerGroup(
    opts.reviewer_group_id ? { group_id: opts.reviewer_group_id } : {},
  );
  const manifest = buildRegistryInsertionManifest({
    reviewer_group_id: reviewerBinding.group_id,
  });
  const manifestValidation = validateRegistryInsertionManifest(manifest);
  steps.push({
    step: "build + validate registry insertion manifest",
    outcome: manifestValidation.ok ? "valid" : "INVALID",
  });

  // 2 · rollback-before-attach — register the detach path FIRST
  const protocol = new RollbackBeforeAttachProtocol();
  protocol.registerDetach({
    id: "detach.flag-off",
    description: manifest.rollback_protocol.detach_step,
    single_step: true,
  });
  steps.push({
    step: "register detach (rollback) path",
    outcome: "single-step detach registered",
  });

  // 3 · prepare attach — only possible because the detach path exists
  const attachPrep = protocol.prepareAttach({
    id: "attach.registry-insert",
    description: "dry-run registry insertion",
  });
  steps.push({
    step: "prepare attach (rollback verified beforehand)",
    outcome: attachPrep.rollback_verified_before_attach
      ? "rollback-verified"
      : "FAILED",
  });

  // 4 · dry-run registry registration (no live registry contacted)
  const registry = new DryRunRegistryProvider();
  const regOutcome = registry.register({
    component: LITEQDS_REGISTRATION,
    allowed_hosts: ["internal_review_surface"],
  });
  steps.push({
    step: "dry-run registry registration",
    outcome: regOutcome.status,
  });
  telemetry.emit(
    buildIntegrationEvent({
      event_type: "dry_run_registry_registration",
      host_surface: "internal_review_surface",
      flag_state: "off",
      fixture_ref: "n/a",
      outcome: regOutcome.status,
      emitted_at: "2026-03-15T00:00:00.000Z",
    }),
  );

  // 5 · bind the feature flag — default state must be OFF
  const flagRegistry = new FeatureFlagProviderRegistry();
  flagRegistry.registerProvider("local-default", new LocalFeatureFlagProvider());
  flagRegistry.activate("local-default");
  const flagState = flagRegistry.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)
    ? "on"
    : "off";
  steps.push({
    step: "bind feature flag (default state)",
    outcome: `flag ${flagState}`,
  });
  telemetry.emit(
    buildIntegrationEvent({
      event_type: "dry_run_flag_bound",
      host_surface: "internal_review_surface",
      flag_state: "off",
      fixture_ref: "n/a",
      outcome: "flag_off_default",
      emitted_at: "2026-03-15T00:01:00.000Z",
    }),
  );

  return {
    mode: "dry_run",
    live_side_effects: false,
    steps,
    manifest_valid: manifestValidation.ok,
    registry_status: regOutcome.status,
    flag_state_at_insertion: flagState,
    rollback_ready_before_attach: attachPrep.rollback_verified_before_attach,
    telemetry_outbound: telemetry.outbound,
    telemetry_events: [...telemetry.readAll()],
  };
}
