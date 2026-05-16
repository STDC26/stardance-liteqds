// Builds the XAS-XX evidence manifest. Every artifact is a render produced
// THROUGH the XAS adapter (xas/harness). Verifies each screenshot resolves
// before writing — a missing artifact fails the build.
//
//   npm run test:xas && npm run xas:evidence:manifest

import { existsSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const DESKTOP = { width: 1280, height: 900 } as const;
const MOBILE = { width: 393, height: 851, device: "Pixel 5" } as const;

const FIXTURES = ["qds_learn", "qds_mo", "qds_signal"] as const;
const FIXTURE_FILE: Record<(typeof FIXTURES)[number], string> = {
  qds_learn: "qds-learn",
  qds_mo: "qds-mo",
  qds_signal: "qds-signal",
};

const FWIRE = [
  { code: "F-WIRE-01_MALFORMED_ENVELOPE", file: "f-wire-01" },
  { code: "F-WIRE-02_REQUIRED_FIELD_MISSING", file: "f-wire-02" },
  { code: "F-WIRE-03_NON_LITE_GOVERNANCE_CLASS", file: "f-wire-03" },
  { code: "F-WIRE-04_VIEWPORT_TOO_SMALL", file: "f-wire-04" },
  { code: "F-WIRE-05_BAND_RENDERING_VIOLATION", file: "f-wire-05" },
  { code: "F-WIRE-06_FORBIDDEN_HOST_SURFACE", file: "f-wire-06" },
] as const;

function verify(relPath: string): string {
  const abs = join(here, relPath);
  if (!existsSync(abs)) {
    throw new Error(`XAS evidence artifact missing: ${relPath}`);
  }
  if (statSync(abs).size < 1000) {
    throw new Error(`XAS evidence artifact too small to be a render: ${relPath}`);
  }
  return relPath;
}

const E1_desktop = Object.fromEntries(
  FIXTURES.map((key) => [
    key,
    {
      artifact: verify(`screenshots/${FIXTURE_FILE[key]}.desktop.png`),
      viewport: DESKTOP,
      rendered_via: "xas_adapter",
      contains_rendered_card: true,
    },
  ]),
);

const E2_mobile = Object.fromEntries(
  FIXTURES.map((key) => [
    key,
    {
      artifact: verify(`screenshots/${FIXTURE_FILE[key]}.mobile.png`),
      viewport: MOBILE,
      rendered_via: "xas_adapter",
      contains_rendered_card: true,
    },
  ]),
);

const fwire_items = FWIRE.map((f) => ({
  code: f.code,
  artifact: verify(`screenshots/${f.file}.desktop.png`),
  viewport: DESKTOP,
  rendered_via: "xas_adapter",
  surface_owner: "liteqds_component",
}));

const manifest = {
  evidence_index: "xas-xx-validation-prep",
  classification: "XAS_INTEGRATION_VALIDATION",
  baseline: {
    repo: "STDC26/stardance-liteqds",
    certified_commit: "7d19fb9",
    certification_tag: "liteqds-g1-recovered-v1",
  },
  note:
    "All artifacts are renders produced THROUGH the XAS insertion adapter " +
    "(xas/harness), using the certified renderer components unchanged. No " +
    "renderer, generator, or fixture was modified.",
  captured_by: "xas/tests/xas-evidence.spec.ts",
  viewports: { desktop: DESKTOP, mobile: MOBILE },
  E1_desktop,
  E2_mobile,
  fwire_artifacts: { count: fwire_items.length, items: fwire_items },
};

writeFileSync(
  join(here, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8",
);

console.log(
  `xas/evidence/manifest.json written — ${FIXTURES.length} desktop + ` +
    `${FIXTURES.length} mobile + ${fwire_items.length} F-WIRE artifacts ` +
    `verified resolvable.`,
);
