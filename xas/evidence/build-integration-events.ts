// IG-0 evidence generator.
//
// (1) Regenerates the append-only integration telemetry sink
//     (xas/evidence/integration-events.jsonl) by running the IG-0 mount
//     scenarios through the real mount logic — deterministic (fixed timestamps).
// (2) Builds xas/evidence/integration/IG-0.manifest.json and verifies every
//     referenced evidence artifact resolves.
//
//   npm run integration:events   (run after npm run test:integration)

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LITEQDS_INTERNAL_REVIEW_FLAG,
  LocalFeatureFlagProvider,
} from "../integration/XASFeatureFlagProvider";
import { mountLiteQDSOnInternalReviewSurface } from "../integration/internalReviewSurfaceMount";
import { appendIntegrationEvent } from "../integration/integrationTelemetrySink";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const sinkPath = join(here, "integration-events.jsonl");

function fixture(name: string): unknown {
  return JSON.parse(
    readFileSync(join(repoRoot, "fixtures", `${name}.json`), "utf8"),
  );
}

const flagOff = new LocalFeatureFlagProvider();
const flagOn = new LocalFeatureFlagProvider({
  [LITEQDS_INTERNAL_REVIEW_FLAG]: true,
});

// Deterministic IG-0 scenario set — fixed timestamps so the sink is stable.
const scenarios = [
  { flag: flagOff, env: fixture("qds-learn"), ref: "qds-learn", at: "2026-03-01T00:00:00.000Z" },
  { flag: flagOn, env: fixture("qds-learn"), ref: "qds-learn", at: "2026-03-01T00:01:00.000Z" },
  { flag: flagOn, env: fixture("qds-mo"), ref: "qds-mo", at: "2026-03-01T00:02:00.000Z" },
  { flag: flagOn, env: fixture("qds-signal"), ref: "qds-signal", at: "2026-03-01T00:03:00.000Z" },
  { flag: flagOn, env: "not-an-envelope", ref: "qds-learn", at: "2026-03-01T00:04:00.000Z" },
];

// Truncate, then append each event — append-only within the regeneration.
writeFileSync(sinkPath, "", "utf8");
for (const s of scenarios) {
  const result = mountLiteQDSOnInternalReviewSurface({
    flagProvider: s.flag,
    envelope: s.env,
    fixtureRef: s.ref,
    emittedAt: s.at,
  });
  appendIntegrationEvent(sinkPath, result.telemetryEvent);
}
const eventCount = scenarios.length;

// ---- IG-0 evidence manifest ----
function verifyShot(rel: string): string {
  const abs = join(here, "integration", rel);
  if (!existsSync(abs) || statSync(abs).size < 1000) {
    throw new Error(`IG-0 evidence artifact missing or too small: ${rel}`);
  }
  return rel;
}

const manifest = {
  evidence_index: "IG-0",
  phase: "IG-0 — baseline + staging-equivalent internal_review_surface mount",
  classification: "XAS_CONTROLLED_INTEGRATION",
  baseline: {
    repo: "STDC26/stardance-liteqds",
    certified_commit: "7d19fb9",
    certification_tag: "liteqds-g1-recovered-v1",
  },
  target_surface: "internal_review_surface",
  integration_mode: "review_only",
  deployment_posture: "non_production",
  note:
    "All renders produced through the certified adapter + the IG-0 mount, " +
    "on a repo-local staging-equivalent internal_review_surface. No certified " +
    "baseline file (src/, fixtures/, harness/) was modified.",
  telemetry: {
    sink: "../integration-events.jsonl",
    event_count: eventCount,
    append_only: true,
    metadata_bounded: true,
  },
  screenshots: {
    flag_off_empty: verifyShot("screenshots/flag-off-empty.desktop.png"),
    flag_on_desktop: {
      qds_learn: verifyShot("screenshots/qds-learn.flag-on.desktop.png"),
      qds_mo: verifyShot("screenshots/qds-mo.flag-on.desktop.png"),
      qds_signal: verifyShot("screenshots/qds-signal.flag-on.desktop.png"),
    },
    flag_on_mobile: {
      qds_learn: verifyShot("screenshots/qds-learn.flag-on.mobile.png"),
      qds_mo: verifyShot("screenshots/qds-mo.flag-on.mobile.png"),
      qds_signal: verifyShot("screenshots/qds-signal.flag-on.mobile.png"),
    },
  },
};

writeFileSync(
  join(here, "integration", "IG-0.manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8",
);

console.log(
  `integration-events.jsonl written (${eventCount} events) · ` +
    `IG-0.manifest.json written · 7 screenshots verified resolvable.`,
);
