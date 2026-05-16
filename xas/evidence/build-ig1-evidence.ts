// IG-1 PREPARATION evidence generator.
//
// Runs the dry-run insertion simulation and writes:
//   xas/evidence/ig1/dry-run-insertion.json   — the simulation result
//   xas/evidence/ig1/IG1-PREP.manifest.json   — the IG-1-prep evidence manifest
//
//   npm run ig1:evidence

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runDryRunInsertion } from "../ig1/dryRunInsertion";
import { buildRegistryInsertionManifest } from "../ig1/registryInsertionManifest";

const here = dirname(fileURLToPath(import.meta.url));
const ig1Dir = join(here, "ig1");
mkdirSync(ig1Dir, { recursive: true });

const dryRun = runDryRunInsertion();
writeFileSync(
  join(ig1Dir, "dry-run-insertion.json"),
  JSON.stringify(dryRun, null, 2) + "\n",
  "utf8",
);

const insertionManifest = buildRegistryInsertionManifest({
  reviewer_group_id: "liteqds_internal_review_alpha",
});

const evidenceManifest = {
  evidence_index: "IG1-PREP",
  phase: "IG-1 PREPARATION — dry-run only, no live integration",
  classification: "XAS_CONTROLLED_INTEGRATION",
  authorization: "IG-1 PREPARATION ONLY — IG-1 execution is not authorized",
  baseline: {
    repo: "STDC26/stardance-liteqds",
    certified_commit: "7d19fb9",
    certification_tag: "liteqds-g1-recovered-v1",
  },
  deliverables: {
    registry_provider_interface: "xas/ig1/IXASRegistryProvider.ts",
    telemetry_provider_interface: "xas/ig1/IXASTelemetryProvider.ts",
    feature_flag_architecture: "xas/ig1/featureFlagProviders.ts",
    reviewer_group_config: "xas/ig1/reviewerGroupConfig.ts",
    registry_insertion_manifest_schema: "xas/ig1/registryInsertionManifest.ts",
    rollback_before_attach_protocol: "xas/ig1/rollbackBeforeAttach.ts",
    dry_run_insertion: "xas/ig1/dryRunInsertion.ts",
    preflight_suite: "xas/ig1/ig1-preflight.spec.ts (IG1-PREFLIGHT-01..15)",
  },
  dry_run_insertion: {
    artifact: "dry-run-insertion.json",
    mode: dryRun.mode,
    live_side_effects: dryRun.live_side_effects,
    manifest_valid: dryRun.manifest_valid,
    registry_status: dryRun.registry_status,
    flag_state_at_insertion: dryRun.flag_state_at_insertion,
    rollback_ready_before_attach: dryRun.rollback_ready_before_attach,
    telemetry_outbound: dryRun.telemetry_outbound,
    telemetry_event_count: dryRun.telemetry_events.length,
  },
  registry_insertion_manifest: insertionManifest,
  prohibited_scope_confirmed_not_done: {
    live_registry_connected: false,
    real_surface_mounted: false,
    live_flag_activated: false,
    production_telemetry_bound: false,
    reviewer_activation: false,
    production_deployment: false,
    runtime_authorization: false,
  },
};

writeFileSync(
  join(ig1Dir, "IG1-PREP.manifest.json"),
  JSON.stringify(evidenceManifest, null, 2) + "\n",
  "utf8",
);

console.log(
  `IG-1 evidence written — dry-run-insertion.json (${dryRun.telemetry_events.length} ` +
    `telemetry events, live_side_effects=${dryRun.live_side_effects}) + ` +
    `IG1-PREP.manifest.json`,
);
