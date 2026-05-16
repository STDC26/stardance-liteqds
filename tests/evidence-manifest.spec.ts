import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import manifest from "../harness/evidence/manifest.json";

const evidenceDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../harness/evidence",
);

function resolves(relPath: string): boolean {
  const abs = join(evidenceDir, relPath);
  return existsSync(abs) && statSync(abs).size >= 1000;
}

describe("G1 evidence manifest", () => {
  it("declares the controlled-rebuild classification", () => {
    expect(manifest.classification).toBe("CONTROLLED_REBUILD");
    expect(manifest.provenance_note).toMatch(/not recovered provenance/i);
  });

  it("maps three E1 desktop artifacts, each resolvable", () => {
    const entries = Object.values(manifest.E1_desktop);
    expect(entries).toHaveLength(3);
    for (const e of entries) {
      expect(resolves(e.artifact), e.artifact).toBe(true);
      expect(e.contains_rendered_card).toBe(true);
      expect(e.viewport.width).toBeGreaterThan(0);
      expect(e.viewport.height).toBeGreaterThan(0);
    }
  });

  it("maps three E2 mobile artifacts, each resolvable", () => {
    const entries = Object.values(manifest.E2_mobile);
    expect(entries).toHaveLength(3);
    for (const e of entries) {
      expect(resolves(e.artifact), e.artifact).toBe(true);
      expect(e.contains_rendered_card).toBe(true);
      expect(e.viewport.width).toBeGreaterThan(0);
      expect(e.viewport.height).toBeGreaterThan(0);
    }
  });

  it("confirms contains_rendered_card=true for all six fixture mappings", () => {
    const all = [
      ...Object.values(manifest.E1_desktop),
      ...Object.values(manifest.E2_mobile),
    ];
    expect(all).toHaveLength(6);
    expect(all.every((e) => e.contains_rendered_card === true)).toBe(true);
  });

  it("maps six F-WIRE artifacts, each resolvable", () => {
    expect(manifest.fwire_artifacts.count).toBe(6);
    expect(manifest.fwire_artifacts.items).toHaveLength(6);
    for (const item of manifest.fwire_artifacts.items) {
      expect(resolves(item.artifact), item.artifact).toBe(true);
      expect(item.code).toMatch(/^F-WIRE-0[1-6]_/);
    }
  });
});
