// Canonical LiteQDS types — controlled rebuild.
//
// Governance invariants emitted by the generator are LITERAL types so the
// compiler itself enforces that they can never widen.

export const GOVERNANCE_CLASS = "lite_experimental" as const;
export const RUNTIME_AUTHORIZATION = "not_authorized" as const;

export type GovernanceClass = typeof GOVERNANCE_CLASS;
export type RuntimeAuthorization = typeof RUNTIME_AUTHORIZATION;

// Confidence is DIRECTIONAL only — never numeric, never an institutional score.
export const DIRECTIONAL_CONFIDENCE = [
  "directional_qualified_lean",
  "directional_mixed_signal",
  "directional_not_qualified_lean",
] as const;

export type DirectionalConfidence = (typeof DIRECTIONAL_CONFIDENCE)[number];

// Human-readable, word-only labels for directional confidence. No digits.
export const DIRECTIONAL_CONFIDENCE_LABEL: Record<DirectionalConfidence, string> = {
  directional_qualified_lean: "Leaning qualified",
  directional_mixed_signal: "Mixed signal",
  directional_not_qualified_lean: "Leaning not qualified",
};

export interface VerdictOption {
  option_id: string;
  label: string;
  // Plain-language summary of where this verdict routes. Never a numeric score.
  routing_summary: string;
  // Optional band grouping. If any option has a band, panel.band_label is required.
  band?: string;
}

// Output A — the rendered panel specification.
export interface LiteQDSPanelSpec {
  panel_id: string;
  panel_title: string;
  panel_subject_label: string;
  qualification_type_label: string;
  verdict_options_render: VerdictOption[];
  suggested_confidence: DirectionalConfidence;
  trust_surface_limitations: string[];
  recourse_path: string;
  band_label?: string;
  governance_class: GovernanceClass;
  runtime_authorization: RuntimeAuthorization;
  human_review_required: true;
}

// Output B — the insertion brief (routing / host eligibility metadata).
export interface LiteQDSInsertionBrief {
  brief_id: string;
  target_qualification_type: string;
  routing_pattern: string;
  eligible_host_surfaces: string[];
  forbidden_host_surfaces: string[];
  promotion_blocking_status: true;
  generated_at: string;
}

// The generator emits both as a single envelope.
export interface LiteQDSEnvelope {
  panel_spec: LiteQDSPanelSpec;
  insertion_brief: LiteQDSInsertionBrief;
}

// Generator input. Governance fields are NOT accepted here — the generator
// fixes them. An input that smuggles a non-lite governance_class is rejected
// (F-WIRE-03) rather than silently honored.
export interface LiteQDSGeneratorInput {
  panel_title: string;
  panel_subject_label: string;
  qualification_type: string;
  qualification_type_label: string;
  verdict_options: VerdictOption[];
  directional_confidence: DirectionalConfidence;
  trust_surface_limitations: string[];
  routing_pattern: string;
  eligible_host_surfaces: string[];
  forbidden_host_surfaces: string[];
  recourse_path: string;
  band_label?: string;
  // Optional fixed timestamp — supplied for deterministic fixtures.
  generated_at?: string;
}
