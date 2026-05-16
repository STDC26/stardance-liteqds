import { describe, expect, it } from "vitest";
import {
  DIRECTIONAL_CONFIDENCE,
  FORBIDDEN_OUTPUT_FIELD_PATTERNS,
  LiteQDSGenerationError,
  generateLiteQDSPanel,
  type LiteQDSGeneratorInput,
} from "../src/index";

// Minimal valid input. Fixed generated_at so the envelope is deterministic.
function validInput(
  overrides: Partial<LiteQDSGeneratorInput> = {},
): LiteQDSGeneratorInput {
  return {
    panel_title: "Learning Path Readiness Check",
    panel_subject_label: "Creator: untitled draft",
    qualification_type: "learning_path_qualification",
    qualification_type_label: "Learning Path Qualification",
    verdict_options: [
      {
        option_id: "advance",
        label: "Advance to structured outline",
        routing_summary: "Routes the creator into the outline builder.",
      },
      {
        option_id: "hold",
        label: "Hold for more material",
        routing_summary: "Routes back to material capture.",
      },
    ],
    directional_confidence: "directional_mixed_signal",
    trust_surface_limitations: [
      "Experimental surface — not a runtime decision.",
      "Directional only; no institutional scoring applied.",
    ],
    routing_pattern: "single_subject_linear",
    eligible_host_surfaces: ["uxc_activation_surface", "experimental_sandbox"],
    forbidden_host_surfaces: ["production_runtime_surface", "customer_facing_surface"],
    recourse_path: "Request human review via the qualification review queue.",
    generated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

// Recursively collect every object key in a value.
function collectKeys(value: unknown, acc: string[] = []): string[] {
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      acc.push(k);
      collectKeys(v, acc);
    }
  }
  return acc;
}

describe("LiteQDS Panel Generator — LCG acceptance", () => {
  it("LCG-01 · schema validates a complete input", () => {
    expect(() => generateLiteQDSPanel(validInput())).not.toThrow();
  });

  it("LCG-02 · panel_spec is emitted", () => {
    const env = generateLiteQDSPanel(validInput());
    expect(env.panel_spec).toBeDefined();
    expect(env.panel_spec.panel_id).toMatch(/^liteqds-panel-/);
    expect(env.panel_spec.verdict_options_render).toHaveLength(2);
  });

  it("LCG-03 · insertion_brief is emitted", () => {
    const env = generateLiteQDSPanel(validInput());
    expect(env.insertion_brief).toBeDefined();
    expect(env.insertion_brief.brief_id).toMatch(/^liteqds-brief-/);
    expect(env.insertion_brief.target_qualification_type).toBe(
      "learning_path_qualification",
    );
  });

  it("LCG-04 · governance_class is fixed as lite_experimental", () => {
    const env = generateLiteQDSPanel(validInput());
    expect(env.panel_spec.governance_class).toBe("lite_experimental");
    // A non-lite governance_class smuggled into input is rejected (F-WIRE-03).
    try {
      generateLiteQDSPanel(validInput({ governance_class: "proto_experimental" } as never));
      throw new Error("expected rejection");
    } catch (e) {
      expect(e).toBeInstanceOf(LiteQDSGenerationError);
      expect((e as LiteQDSGenerationError).code).toBe(
        "F-WIRE-03_NON_LITE_GOVERNANCE_CLASS",
      );
    }
  });

  it("LCG-05 · runtime_authorization is fixed as not_authorized", () => {
    const env = generateLiteQDSPanel(validInput());
    expect(env.panel_spec.runtime_authorization).toBe("not_authorized");
  });

  it("LCG-06 · human_review_required is fixed true", () => {
    const env = generateLiteQDSPanel(validInput());
    expect(env.panel_spec.human_review_required).toBe(true);
  });

  it("LCG-07 · trust_surface_limitations is emitted and non-empty", () => {
    const env = generateLiteQDSPanel(validInput());
    expect(Array.isArray(env.panel_spec.trust_surface_limitations)).toBe(true);
    expect(env.panel_spec.trust_surface_limitations.length).toBeGreaterThan(0);
    // An empty limitations array fails closed.
    expect(() =>
      generateLiteQDSPanel(validInput({ trust_surface_limitations: [] })),
    ).toThrow(LiteQDSGenerationError);
  });

  it("LCG-08 · suggested_confidence is directional only (never numeric)", () => {
    const env = generateLiteQDSPanel(validInput());
    expect(DIRECTIONAL_CONFIDENCE).toContain(env.panel_spec.suggested_confidence);
    expect(typeof env.panel_spec.suggested_confidence).toBe("string");
    expect(env.panel_spec.suggested_confidence).not.toMatch(/[0-9]/);
  });

  it("LCG-09 · no institutional-confidence fields anywhere in the envelope", () => {
    const env = generateLiteQDSPanel(validInput());
    const keys = collectKeys(env);
    for (const key of keys) {
      for (const pattern of FORBIDDEN_OUTPUT_FIELD_PATTERNS) {
        expect(
          pattern.test(key),
          `forbidden field '${key}' matched ${pattern}`,
        ).toBe(false);
      }
    }
  });

  it("LCG-10 · promotion_blocking_status is true", () => {
    const env = generateLiteQDSPanel(validInput());
    expect(env.insertion_brief.promotion_blocking_status).toBe(true);
  });
});

describe("LiteQDS Panel Generator — fail-closed behavior", () => {
  it("rejects a non-object input with F-WIRE-01", () => {
    for (const bad of [null, undefined, 42, "x", []]) {
      try {
        generateLiteQDSPanel(bad);
        throw new Error("expected rejection");
      } catch (e) {
        expect(e).toBeInstanceOf(LiteQDSGenerationError);
        expect((e as LiteQDSGenerationError).code).toBe(
          "F-WIRE-01_MALFORMED_ENVELOPE",
        );
      }
    }
  });

  it("rejects a missing required field with F-WIRE-02", () => {
    const { panel_title, ...withoutTitle } = validInput();
    void panel_title;
    try {
      generateLiteQDSPanel(withoutTitle);
      throw new Error("expected rejection");
    } catch (e) {
      expect(e).toBeInstanceOf(LiteQDSGenerationError);
      expect((e as LiteQDSGenerationError).code).toBe(
        "F-WIRE-02_REQUIRED_FIELD_MISSING",
      );
    }
  });

  it("enforces the band rule — banded options require band_label", () => {
    expect(() =>
      generateLiteQDSPanel(
        validInput({
          verdict_options: [
            {
              option_id: "a",
              label: "A",
              routing_summary: "routes a",
              band: "primary",
            },
          ],
        }),
      ),
    ).toThrow(LiteQDSGenerationError);
  });
});

describe("LiteQDS Panel Generator — determinism", () => {
  it("produces an identical envelope for identical input", () => {
    const a = generateLiteQDSPanel(validInput());
    const b = generateLiteQDSPanel(validInput());
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
