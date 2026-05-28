import { describe, expect, it } from "vitest";
import { LiteQDSXASAdapter } from "./LiteQDSXASAdapter";
import learn from "../../fixtures/qds-learn.json";
import mo from "../../fixtures/qds-mo.json";
import signal from "../../fixtures/qds-signal.json";

const FIXTURES = [
  ["qds-learn", learn],
  ["qds-mo", mo],
  ["qds-signal", signal],
] as const;

const ELIGIBLE_HOST = { host_surface: "uxc_activation_surface" };

describe("LiteQDS XAS insertion adapter", () => {
  for (const [name, fixture] of FIXTURES) {
    describe(name, () => {
      it("produces a ready_to_render handoff for an eligible host", () => {
        const adapter = new LiteQDSXASAdapter();
        const result = adapter.insert(fixture, ELIGIBLE_HOST);
        expect(result.status).toBe("ready_to_render");
        if (result.status !== "ready_to_render") return;
        expect(result.render_target).toBe("QualificationCard");
        expect(result.host_context).toEqual(ELIGIBLE_HOST);
      });

      it("deep-freezes the envelope before handoff", () => {
        const adapter = new LiteQDSXASAdapter();
        const result = adapter.insert(fixture, ELIGIBLE_HOST);
        if (result.status !== "ready_to_render") throw new Error("not ready");
        expect(result.envelope_frozen).toBe(true);
        expect(Object.isFrozen(result.frozenEnvelope)).toBe(true);
        expect(Object.isFrozen(result.frozenEnvelope.panel_spec)).toBe(true);
        expect(
          Object.isFrozen(
            result.frozenEnvelope.panel_spec.verdict_options_render,
          ),
        ).toBe(true);
      });

      it("does not mutate the caller's envelope (deep equality before/after)", () => {
        const adapter = new LiteQDSXASAdapter();
        const before = JSON.stringify(fixture);
        adapter.insert(fixture, ELIGIBLE_HOST);
        const after = JSON.stringify(fixture);
        expect(after).toBe(before);
        // The source fixture object is itself untouched (not frozen by adapter).
        expect(Object.isFrozen(fixture)).toBe(false);
      });

      it("hands off panel_spec + insertion_brief unchanged from source", () => {
        const adapter = new LiteQDSXASAdapter();
        const result = adapter.insert(fixture, ELIGIBLE_HOST);
        if (result.status !== "ready_to_render") throw new Error("not ready");
        expect(result.frozenEnvelope.panel_spec).toEqual(fixture.panel_spec);
        expect(result.frozenEnvelope.insertion_brief).toEqual(
          fixture.insertion_brief,
        );
      });

      it("refuses a forbidden host with F-WIRE-06", () => {
        const adapter = new LiteQDSXASAdapter();
        const result = adapter.insert(fixture, {
          host_surface: "production_runtime_surface",
        });
        expect(result.status).toBe("refused");
        if (result.status !== "refused") return;
        expect(result.code).toBe("F-WIRE-06_FORBIDDEN_HOST_SURFACE");
        expect(result.render_target).toBe("FWireFailureSurface");
      });
    });
  }

  it("refuses a malformed envelope with an F-WIRE code", () => {
    const adapter = new LiteQDSXASAdapter();
    const result = adapter.insert("not-an-envelope", ELIGIBLE_HOST);
    expect(result.status).toBe("refused");
    if (result.status !== "refused") return;
    expect(result.code).toBe("F-WIRE-01_MALFORMED_ENVELOPE");
  });

  it("refuses a non-lite envelope with F-WIRE-03", () => {
    const adapter = new LiteQDSXASAdapter();
    const tampered = structuredClone(learn) as { panel_spec: { governance_class: string } };
    tampered.panel_spec.governance_class = "proto_experimental";
    const result = adapter.insert(tampered, ELIGIBLE_HOST);
    expect(result.status).toBe("refused");
    if (result.status !== "refused") return;
    expect(result.code).toBe("F-WIRE-03_NON_LITE_GOVERNANCE_CLASS");
  });
});
