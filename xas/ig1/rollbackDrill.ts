// IG-1 EXECUTION-READINESS — deterministic rollback drill simulation.
//
// Demonstrates the attach-failure -> detach-recovery sequence end to end,
// using the real IG-1 abstractions. Dry-run only: no live registry, no real
// surface, no outbound telemetry. The attach failure is an INJECTED fault —
// the drill's purpose is to exercise the recovery path deterministically.

import {
  LITEQDS_INTERNAL_REVIEW_FLAG,
  LocalFeatureFlagProvider,
} from "./featureFlagProviders";
import { mountLiteQDSOnInternalReviewSurface } from "../integration/internalReviewSurfaceMount";
import { RollbackBeforeAttachProtocol } from "./rollbackBeforeAttach";
import {
  buildIntegrationEvent,
  type IntegrationEvent,
} from "../integration/integrationTelemetry";

export type SurfaceState =
  | "detached"
  | "attached"
  | "attach_failed"
  | "detached_safe";

export interface RollbackDrillStep {
  ordinal: number;
  step: string;
  surface_state: SurfaceState;
  outcome: string;
}

export interface RollbackDrillResult {
  mode: "dry_run";
  scenario: "attach_failure_to_detach_recovery";
  steps: RollbackDrillStep[];
  detach_registered_before_attach: boolean;
  attach_attempted: boolean;
  attach_failed: boolean;
  detach_executed: boolean;
  final_surface_state: SurfaceState;
  recovered: boolean;
  live_side_effects: false;
  telemetry_events: IntegrationEvent[];
}

/**
 * Run the attach-failure -> detach-recovery drill. Deterministic.
 */
export function runRollbackDrill(envelope: unknown): RollbackDrillResult {
  const steps: RollbackDrillStep[] = [];
  const telemetry: IntegrationEvent[] = [];

  // 1 · rollback-before-attach — register the single-step detach FIRST.
  const protocol = new RollbackBeforeAttachProtocol();
  protocol.registerDetach({
    id: "detach.flag-off",
    description: "set xas.liteqds.internal_review.enabled = OFF",
    single_step: true,
  });
  const detachRegistered = protocol.hasDetachPath;
  steps.push({
    ordinal: 1,
    step: "register detach path",
    surface_state: "detached",
    outcome: "single-step detach registered before any attach",
  });

  // 2 · prepare attach — only possible because a detach path exists.
  protocol.prepareAttach({
    id: "attach.mount",
    description: "mount on internal_review_surface",
  });
  steps.push({
    ordinal: 2,
    step: "prepare attach (rollback verified beforehand)",
    surface_state: "detached",
    outcome: "attach prepared",
  });

  // 3 · attach — flag ON, mount.
  const flag = new LocalFeatureFlagProvider({
    [LITEQDS_INTERNAL_REVIEW_FLAG]: true,
  });
  const attachMount = mountLiteQDSOnInternalReviewSurface({
    flagProvider: flag,
    envelope,
    fixtureRef: "qds-learn",
    emittedAt: "2026-03-20T00:00:00.000Z",
  });
  const attached = attachMount.mounted;
  steps.push({
    ordinal: 3,
    step: "attach — flag ON, mount panel",
    surface_state: attached ? "attached" : "detached",
    outcome: attached ? "panel mounted" : "mount skipped",
  });
  telemetry.push(attachMount.telemetryEvent);

  // 4 · INJECTED FAULT — the attach health check fails.
  const attachHealthy = false;
  steps.push({
    ordinal: 4,
    step: "post-attach health check",
    surface_state: "attach_failed",
    outcome: "INJECTED FAULT — attach declared unhealthy",
  });
  telemetry.push(
    buildIntegrationEvent({
      event_type: "attach_health_check_failed",
      host_surface: "internal_review_surface",
      flag_state: "on",
      fixture_ref: "qds-learn",
      outcome: "attach_failed",
      emitted_at: "2026-03-20T00:01:00.000Z",
    }),
  );

  // 5 · detach recovery — single-step flag OFF.
  flag.set(LITEQDS_INTERNAL_REVIEW_FLAG, false);
  const detachMount = mountLiteQDSOnInternalReviewSurface({
    flagProvider: flag,
    envelope,
    fixtureRef: "qds-learn",
    emittedAt: "2026-03-20T00:02:00.000Z",
  });
  const detached = !detachMount.mounted;
  steps.push({
    ordinal: 5,
    step: "detach recovery — single-step flag OFF",
    surface_state: detached ? "detached_safe" : "attached",
    outcome: detached
      ? "panel unmounted — surface returned to detached_safe"
      : "DETACH FAILED",
  });
  telemetry.push(detachMount.telemetryEvent);

  const recovered =
    detachRegistered && attached && !attachHealthy && detached;

  return {
    mode: "dry_run",
    scenario: "attach_failure_to_detach_recovery",
    steps,
    detach_registered_before_attach: detachRegistered,
    attach_attempted: true,
    attach_failed: !attachHealthy,
    detach_executed: true,
    final_surface_state: "detached_safe",
    recovered,
    live_side_effects: false,
    telemetry_events: telemetry,
  };
}
