// Scoring/routing model — maps intake answers to a pathway and generates
// a LiteQDS generator input envelope.

import type { LiteQDSGeneratorInput, DirectionalConfidence } from "../../src/index";
import { INTAKE_QUESTIONS, type Pathway, type AnswerOption } from "./questions";

export interface ScoringResult {
  pathway: Pathway;
  confidence: DirectionalConfidence;
  scores: Record<Pathway, number>;
  generatorInput: LiteQDSGeneratorInput;
}

const PATHWAY_LABELS: Record<Pathway, string> = {
  SD: "Stardance",
  DO: "Docente",
  VMG: "VMG",
};

const PATHWAY_DESCRIPTIONS: Record<Pathway, string> = {
  SD: "Platform and product development",
  DO: "Education, learning paths, and curriculum",
  VMG: "Video, media, and audience growth",
};

/** Score intake answers and produce a routing result. Returns null if input is incomplete. */
export function scoreIntake(answers: Record<string, string>): ScoringResult | null {
  // Fail closed: every question must be answered.
  for (const q of INTAKE_QUESTIONS) {
    if (!answers[q.id]) return null;
  }

  const scores: Record<Pathway, number> = { SD: 0, DO: 0, VMG: 0 };

  for (const q of INTAKE_QUESTIONS) {
    const selected = q.answers.find((a: AnswerOption) => a.id === answers[q.id]);
    if (!selected) return null; // unknown answer — fail closed
    scores.SD += selected.weights.SD;
    scores.DO += selected.weights.DO;
    scores.VMG += selected.weights.VMG;
  }

  // Determine dominant pathway
  const sorted = (Object.entries(scores) as [Pathway, number][]).sort((a, b) => b[1] - a[1]);
  const pathway = sorted[0][0];
  const topScore = sorted[0][1];
  const secondScore = sorted[1][1];

  // Determine directional confidence based on separation
  const gap = topScore - secondScore;
  let confidence: DirectionalConfidence;
  if (gap >= 5) {
    confidence = "directional_qualified_lean";
  } else if (gap >= 2) {
    confidence = "directional_mixed_signal";
  } else {
    confidence = "directional_not_qualified_lean";
  }

  const generatorInput = buildGeneratorInput(pathway, confidence, answers);

  return { pathway, confidence, scores, generatorInput };
}

function buildGeneratorInput(
  pathway: Pathway,
  confidence: DirectionalConfidence,
  answers: Record<string, string>,
): LiteQDSGeneratorInput {
  const label = PATHWAY_LABELS[pathway];
  const desc = PATHWAY_DESCRIPTIONS[pathway];

  // Build verdict options for the three pathways, with the matched one first
  const pathways: Pathway[] = ["SD", "DO", "VMG"];
  const verdictOptions = pathways.map((p) => ({
    option_id: `route_${p.toLowerCase()}`,
    label: `Route to ${PATHWAY_LABELS[p]}`,
    routing_summary: `Qualified for ${PATHWAY_LABELS[p]} pathway — ${PATHWAY_DESCRIPTIONS[p]}.`,
  }));

  // Move matched pathway to top
  const matchIdx = verdictOptions.findIndex((v) => v.option_id === `route_${pathway.toLowerCase()}`);
  if (matchIdx > 0) {
    const [matched] = verdictOptions.splice(matchIdx, 1);
    verdictOptions.unshift(matched);
  }

  // Add human review option
  verdictOptions.push({
    option_id: "human_review",
    label: "Request human review",
    routing_summary: "Signal is unclear or mixed — routes to a human reviewer for manual qualification.",
  });

  return {
    panel_title: `${label} Pathway Qualification`,
    panel_subject_label: `Intake discovery — ${desc.toLowerCase()}`,
    qualification_type: `${pathway.toLowerCase()}_pathway_qualification`,
    qualification_type_label: `${label} Pathway Qualification`,
    verdict_options: verdictOptions,
    directional_confidence: confidence,
    trust_surface_limitations: [
      "QDS Lite surface — this is a directional qualification, not a binding decision.",
      "No institutional confidence or predictive scoring is applied.",
      "A human reviewer must validate before any engagement proceeds.",
      "Intake responses are self-reported and not independently verified.",
    ],
    routing_pattern: `${pathway.toLowerCase()}_intake_routing`,
    eligible_host_surfaces: ["qds_lite_product_surface", "experimental_sandbox"],
    forbidden_host_surfaces: [
      "production_runtime_surface",
      "governed_decision_surface",
    ],
    recourse_path: `Request a direct conversation with the ${label} team; a reviewer can override any directional read.`,
  };
}
