// Generic scoring/routing — scores intake answers against any QDSDefinition
// and produces a governed LiteQDS envelope.

import type { LiteQDSGeneratorInput, DirectionalConfidence } from "../../src/index";
import type { QDSDefinition } from "./types";

export interface ScoringResult {
  /** Winning pathway ID */
  pathwayId: string;
  /** Winning pathway label */
  pathwayLabel: string;
  confidence: DirectionalConfidence;
  scores: Record<string, number>;
  generatorInput: LiteQDSGeneratorInput;
}

const DEFAULT_THRESHOLDS: [number, number] = [5, 2];

/** Score intake answers against a QDSDefinition. Returns null if input is incomplete (fail-closed). */
export function scoreDefinition(
  def: QDSDefinition,
  answers: Record<string, string>,
): ScoringResult | null {
  // Fail closed: every question must be answered.
  for (const q of def.questions) {
    if (!answers[q.id]) return null;
  }

  // Initialize scores for all pathways
  const scores: Record<string, number> = {};
  for (const p of def.pathways) {
    scores[p.id] = 0;
  }

  // Accumulate weights
  for (const q of def.questions) {
    const selected = q.answers.find((a) => a.id === answers[q.id]);
    if (!selected) return null; // unknown answer — fail closed
    for (const [pid, weight] of Object.entries(selected.weights)) {
      if (pid in scores) {
        scores[pid] += weight;
      }
    }
  }

  // Determine dominant pathway
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const winnerId = sorted[0][0];
  const topScore = sorted[0][1];
  const secondScore = sorted.length > 1 ? sorted[1][1] : 0;

  const [qualThreshold, mixedThreshold] = def.confidenceThresholds ?? DEFAULT_THRESHOLDS;
  const gap = topScore - secondScore;

  let confidence: DirectionalConfidence;
  if (gap >= qualThreshold) {
    confidence = "directional_qualified_lean";
  } else if (gap >= mixedThreshold) {
    confidence = "directional_mixed_signal";
  } else {
    confidence = "directional_not_qualified_lean";
  }

  const winner = def.pathways.find((p) => p.id === winnerId)!;
  const generatorInput = buildGeneratorInput(def, winner.id, winner.label, confidence);

  return {
    pathwayId: winner.id,
    pathwayLabel: winner.label,
    confidence,
    scores,
    generatorInput,
  };
}

function buildGeneratorInput(
  def: QDSDefinition,
  winnerId: string,
  winnerLabel: string,
  confidence: DirectionalConfidence,
): LiteQDSGeneratorInput {
  // Build verdict options — winner first, then others, then human review
  const verdictOptions = def.pathways.map((p) => ({
    option_id: `route_${p.id}`,
    label: `Route to ${p.label}`,
    routing_summary: p.description,
  }));

  // Move winner to top
  const matchIdx = verdictOptions.findIndex((v) => v.option_id === `route_${winnerId}`);
  if (matchIdx > 0) {
    const [matched] = verdictOptions.splice(matchIdx, 1);
    verdictOptions.unshift(matched);
  }

  // Always include human review option
  verdictOptions.push({
    option_id: "human_review",
    label: "Request human review",
    routing_summary: "Signal is unclear or mixed — routes to a human reviewer for manual qualification.",
  });

  const recoursePath = def.trust.recoursePath.replace(/\{\{pathway\}\}/g, winnerLabel);

  return {
    panel_title: `${def.name} — ${winnerLabel}`,
    panel_subject_label: `${def.objective}`,
    qualification_type: `${def.id}_qualification`,
    qualification_type_label: def.name,
    verdict_options: verdictOptions,
    directional_confidence: confidence,
    trust_surface_limitations: [...def.trust.limitations],
    routing_pattern: `${def.id}_${winnerId}_routing`,
    eligible_host_surfaces: ["qds_lite_product_surface", "experimental_sandbox"],
    forbidden_host_surfaces: [
      "production_runtime_surface",
      "governed_decision_surface",
    ],
    recourse_path: recoursePath,
  };
}
