import { z } from "zod";
import {
  DIRECTIONAL_CONFIDENCE,
  GOVERNANCE_CLASS,
  RUNTIME_AUTHORIZATION,
  type LiteQDSEnvelope,
  type LiteQDSGeneratorInput,
} from "./types";
import type { FWireCode } from "./f-wire";

// Fail-closed error. Every generation failure carries an F-WIRE code so the
// refusal can be surfaced through the component, never swallowed.
export class LiteQDSGenerationError extends Error {
  constructor(
    public readonly code: FWireCode,
    public readonly detail: string,
  ) {
    super(`${code}: ${detail}`);
    this.name = "LiteQDSGenerationError";
  }
}

// Keys that must never appear in a LiteQDS panel_spec / insertion_brief.
// Institutional-confidence semantics and DTO/trace artifacts are forbidden.
export const FORBIDDEN_OUTPUT_FIELD_PATTERNS: RegExp[] = [
  /confidence_score/i,
  /confidence_interval/i,
  /confidence_pct/i,
  /numeric_confidence/i,
  /probability/i,
  /institutional_/i,
  /^score$/i,
  /^dto/i,
  /decision_trace/i,
  /^trace$/i,
];

const VerdictOptionSchema = z.object({
  option_id: z.string().min(1),
  label: z.string().min(1),
  routing_summary: z.string().min(1),
  band: z.string().min(1).optional(),
});

const bandRule = (
  options: { band?: string }[],
  band_label: string | undefined,
): boolean => !options.some((o) => o.band) || typeof band_label === "string";

export const GeneratorInputSchema = z
  .object({
    panel_title: z.string().min(1),
    panel_subject_label: z.string().min(1),
    qualification_type: z.string().min(1),
    qualification_type_label: z.string().min(1),
    verdict_options: z.array(VerdictOptionSchema).min(1),
    directional_confidence: z.enum(DIRECTIONAL_CONFIDENCE),
    trust_surface_limitations: z.array(z.string().min(1)).min(1),
    routing_pattern: z.string().min(1),
    eligible_host_surfaces: z.array(z.string().min(1)).min(1),
    forbidden_host_surfaces: z.array(z.string().min(1)).min(1),
    recourse_path: z.string().min(1),
    band_label: z.string().min(1).optional(),
    generated_at: z.string().min(1).optional(),
  })
  .strict()
  .refine((v) => bandRule(v.verdict_options, v.band_label), {
    message: "band_label is required when any verdict option declares a band",
    path: ["band_label"],
  });

export const PanelSpecSchema = z
  .object({
    panel_id: z.string().min(1),
    panel_title: z.string().min(1),
    panel_subject_label: z.string().min(1),
    qualification_type_label: z.string().min(1),
    verdict_options_render: z.array(VerdictOptionSchema).min(1),
    suggested_confidence: z.enum(DIRECTIONAL_CONFIDENCE),
    trust_surface_limitations: z.array(z.string().min(1)).min(1),
    recourse_path: z.string().min(1),
    band_label: z.string().min(1).optional(),
    governance_class: z.literal(GOVERNANCE_CLASS),
    runtime_authorization: z.literal(RUNTIME_AUTHORIZATION),
    human_review_required: z.literal(true),
  })
  .strict()
  .refine((v) => bandRule(v.verdict_options_render, v.band_label), {
    message: "band_label is required when any verdict option declares a band",
    path: ["band_label"],
  });

export const InsertionBriefSchema = z
  .object({
    brief_id: z.string().min(1),
    target_qualification_type: z.string().min(1),
    routing_pattern: z.string().min(1),
    eligible_host_surfaces: z.array(z.string().min(1)).min(1),
    forbidden_host_surfaces: z.array(z.string().min(1)).min(1),
    promotion_blocking_status: z.literal(true),
    generated_at: z.string().min(1),
  })
  .strict();

export const EnvelopeSchema = z
  .object({
    panel_spec: PanelSpecSchema,
    insertion_brief: InsertionBriefSchema,
  })
  .strict();

// Validate raw generator input. Throws LiteQDSGenerationError (fail-closed).
export function validateGeneratorInput(raw: unknown): LiteQDSGeneratorInput {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new LiteQDSGenerationError(
      "F-WIRE-01_MALFORMED_ENVELOPE",
      "generator input is not an object",
    );
  }

  // A non-lite governance_class smuggled into the input is rejected outright.
  const obj = raw as Record<string, unknown>;
  if ("governance_class" in obj && obj.governance_class !== GOVERNANCE_CLASS) {
    throw new LiteQDSGenerationError(
      "F-WIRE-03_NON_LITE_GOVERNANCE_CLASS",
      `governance_class '${String(obj.governance_class)}' is not '${GOVERNANCE_CLASS}'`,
    );
  }

  const parsed = GeneratorInputSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join(".") || "(root)";
    throw new LiteQDSGenerationError(
      "F-WIRE-02_REQUIRED_FIELD_MISSING",
      `${path}: ${issue?.message ?? "invalid"}`,
    );
  }
  return parsed.data;
}

export type EnvelopeValidation =
  | { ok: true; envelope: LiteQDSEnvelope }
  | { ok: false; code: FWireCode; detail: string };

// Non-throwing envelope validation — the harness uses this to route F-WIRE
// refusals gracefully instead of crashing.
export function validateEnvelope(raw: unknown): EnvelopeValidation {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      ok: false,
      code: "F-WIRE-01_MALFORMED_ENVELOPE",
      detail: "envelope is not an object",
    };
  }
  const obj = raw as Record<string, unknown>;
  const panel = obj.panel_spec as Record<string, unknown> | undefined;
  if (panel && "governance_class" in panel && panel.governance_class !== GOVERNANCE_CLASS) {
    return {
      ok: false,
      code: "F-WIRE-03_NON_LITE_GOVERNANCE_CLASS",
      detail: `governance_class '${String(panel.governance_class)}' is not lite`,
    };
  }

  const parsed = EnvelopeSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join(".") || "(root)";
    const missing =
      issue?.code === "invalid_type" || issue?.code === "too_small";
    return {
      ok: false,
      code: missing
        ? "F-WIRE-02_REQUIRED_FIELD_MISSING"
        : "F-WIRE-01_MALFORMED_ENVELOPE",
      detail: `${path}: ${issue?.message ?? "invalid"}`,
    };
  }
  return { ok: true, envelope: parsed.data };
}
