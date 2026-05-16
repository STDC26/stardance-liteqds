import {
  GOVERNANCE_CLASS,
  RUNTIME_AUTHORIZATION,
  type LiteQDSEnvelope,
  type LiteQDSInsertionBrief,
  type LiteQDSPanelSpec,
} from "./types";
import { validateGeneratorInput } from "./validation";

// Environment-agnostic stable hash (FNV-1a) — keeps panel/brief IDs
// deterministic without a crypto dependency, so identical input always
// produces an identical envelope.
function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * Generate a LiteQDS envelope (panel_spec + insertion_brief).
 *
 * Governance fields are fixed by the generator and cannot be supplied by the
 * caller: governance_class=lite_experimental, runtime_authorization=
 * not_authorized, human_review_required=true, promotion_blocking_status=true.
 *
 * Fails closed (throws LiteQDSGenerationError with an F-WIRE code) on any
 * malformed or incomplete input.
 */
export function generateLiteQDSPanel(rawInput: unknown): LiteQDSEnvelope {
  const input = validateGeneratorInput(rawInput);

  const generated_at = input.generated_at ?? new Date().toISOString();

  const panel_id = `liteqds-panel-${fnv1a(
    [input.panel_title, input.panel_subject_label, input.qualification_type].join("|"),
  )}`;
  const brief_id = `liteqds-brief-${fnv1a(
    [input.qualification_type, input.routing_pattern].join("|"),
  )}`;

  const panel_spec: LiteQDSPanelSpec = {
    panel_id,
    panel_title: input.panel_title,
    panel_subject_label: input.panel_subject_label,
    qualification_type_label: input.qualification_type_label,
    verdict_options_render: input.verdict_options.map((o) => ({ ...o })),
    suggested_confidence: input.directional_confidence,
    trust_surface_limitations: [...input.trust_surface_limitations],
    recourse_path: input.recourse_path,
    ...(input.band_label ? { band_label: input.band_label } : {}),
    // Fixed governance invariants — not caller-supplied.
    governance_class: GOVERNANCE_CLASS,
    runtime_authorization: RUNTIME_AUTHORIZATION,
    human_review_required: true,
  };

  const insertion_brief: LiteQDSInsertionBrief = {
    brief_id,
    target_qualification_type: input.qualification_type,
    routing_pattern: input.routing_pattern,
    eligible_host_surfaces: [...input.eligible_host_surfaces],
    forbidden_host_surfaces: [...input.forbidden_host_surfaces],
    // Fixed — LiteQDS never auto-promotes to Proto.
    promotion_blocking_status: true,
    generated_at,
  };

  return { panel_spec, insertion_brief };
}
