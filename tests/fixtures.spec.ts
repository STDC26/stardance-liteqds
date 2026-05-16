import { describe, expect, it } from "vitest";
import { validateEnvelope } from "../src/index";
import learn from "../fixtures/qds-learn.json";
import mo from "../fixtures/qds-mo.json";
import signal from "../fixtures/qds-signal.json";

const fixtures = [
  ["qds-learn", learn],
  ["qds-mo", mo],
  ["qds-signal", signal],
] as const;

describe("LiteQDS fixtures", () => {
  for (const [name, raw] of fixtures) {
    describe(name, () => {
      it("validates against the envelope schema", () => {
        const result = validateEnvelope(raw);
        expect(result.ok, result.ok ? "" : result.detail).toBe(true);
      });

      it("carries all required trust signals", () => {
        const r = validateEnvelope(raw);
        if (!r.ok) throw new Error(r.detail);
        const p = r.envelope.panel_spec;
        expect(p.governance_class).toBe("lite_experimental");
        expect(p.runtime_authorization).toBe("not_authorized");
        expect(p.human_review_required).toBe(true);
        expect(p.trust_surface_limitations.length).toBeGreaterThan(0);
        expect(p.recourse_path.length).toBeGreaterThan(0);
        expect(r.envelope.insertion_brief.promotion_blocking_status).toBe(true);
      });

      it("carries a routing summary on every verdict option", () => {
        const r = validateEnvelope(raw);
        if (!r.ok) throw new Error(r.detail);
        for (const opt of r.envelope.panel_spec.verdict_options_render) {
          expect(opt.routing_summary.length).toBeGreaterThan(0);
        }
      });
    });
  }

  it("each fixture uses a distinct qualification type and routing pattern", () => {
    const types = new Set<string>();
    const patterns = new Set<string>();
    for (const [, raw] of fixtures) {
      const r = validateEnvelope(raw);
      if (!r.ok) throw new Error(r.detail);
      types.add(r.envelope.insertion_brief.target_qualification_type);
      patterns.add(r.envelope.insertion_brief.routing_pattern);
    }
    expect(types.size).toBe(3);
    expect(patterns.size).toBe(3);
  });
});
