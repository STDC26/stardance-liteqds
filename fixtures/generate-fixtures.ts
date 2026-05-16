// Fixture generator. Builds the three canonical LiteQDS fixtures by running
// the real Panel Generator, so every fixture is schema-valid by construction.
// Deterministic: each input carries a fixed generated_at.
//
// Run:  npm run fixtures:generate

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { generateLiteQDSPanel, type LiteQDSGeneratorInput } from "../src/index";

const here = dirname(fileURLToPath(import.meta.url));

const inputs: Record<string, LiteQDSGeneratorInput> = {
  // QDS-Learn — learning path qualification, linear single-subject routing.
  "qds-learn.json": {
    panel_title: "Learning Path Readiness",
    panel_subject_label: "Creator draft — untitled learning path",
    qualification_type: "learning_path_qualification",
    qualification_type_label: "Learning Path Qualification",
    verdict_options: [
      {
        option_id: "advance",
        label: "Advance to structured outline",
        routing_summary:
          "Routes the creator into the outline builder for a full path draft.",
      },
      {
        option_id: "hold",
        label: "Hold for more source material",
        routing_summary:
          "Returns the creator to material capture before qualification re-runs.",
      },
      {
        option_id: "restructure",
        label: "Restructure the subject scope",
        routing_summary:
          "Routes to scope narrowing — the subject is too broad to qualify.",
      },
    ],
    directional_confidence: "directional_mixed_signal",
    trust_surface_limitations: [
      "Experimental Lite surface — this is not a runtime decision.",
      "Directional read only; no institutional scoring is applied.",
      "A human reviewer must confirm before any path is acted on.",
    ],
    routing_pattern: "single_subject_linear",
    eligible_host_surfaces: [
      "uxc_activation_surface",
      "experimental_sandbox",
      "internal_review_surface",
    ],
    forbidden_host_surfaces: [
      "production_runtime_surface",
      "customer_facing_surface",
      "governed_decision_surface",
    ],
    recourse_path:
      "Request human review through the qualification review queue; a reviewer can override any directional read.",
    generated_at: "2026-02-01T00:00:00.000Z",
  },

  // QDS-MO — monetization offer qualification, multi-band routing.
  // Exercises banded verdict options + band_label.
  "qds-mo.json": {
    panel_title: "Monetization Offer Qualification",
    panel_subject_label: "Creator offer — cohort program draft",
    qualification_type: "monetization_offer_qualification",
    qualification_type_label: "Monetization Offer Qualification",
    verdict_options: [
      {
        option_id: "offer_setup",
        label: "Proceed to offer setup",
        routing_summary: "Routes into the offer configuration flow.",
        band: "ready_band",
      },
      {
        option_id: "pricing_review",
        label: "Proceed with a pricing review",
        routing_summary:
          "Routes into offer setup but flags pricing for reviewer attention.",
        band: "ready_band",
      },
      {
        option_id: "strengthen",
        label: "Hold — strengthen the offer",
        routing_summary:
          "Returns the creator to offer shaping before qualification re-runs.",
        band: "hold_band",
      },
    ],
    band_label: "Offer readiness bands",
    directional_confidence: "directional_qualified_lean",
    trust_surface_limitations: [
      "Experimental Lite surface — not authorized for runtime monetization decisions.",
      "Bands are directional groupings, not institutional confidence tiers.",
      "Human review is required before any offer is published.",
    ],
    routing_pattern: "multi_band_offer",
    eligible_host_surfaces: ["uxc_activation_surface", "experimental_sandbox"],
    forbidden_host_surfaces: [
      "production_runtime_surface",
      "customer_facing_surface",
      "governed_decision_surface",
    ],
    recourse_path:
      "Escalate to the monetization review queue; a reviewer can re-band or reject any directional read.",
    generated_at: "2026-02-01T00:00:00.000Z",
  },

  // QDS-Signal — signal intelligence qualification, branching review routing.
  "qds-signal.json": {
    panel_title: "Signal Intelligence Qualification",
    panel_subject_label: "Creator signal — early audience indicators",
    qualification_type: "signal_intelligence_qualification",
    qualification_type_label: "Signal Intelligence Qualification",
    verdict_options: [
      {
        option_id: "observe",
        label: "Continue observing the signal",
        routing_summary:
          "Routes the signal back to the observation window for more data.",
      },
      {
        option_id: "branch_review",
        label: "Branch into a focused review",
        routing_summary:
          "Routes into a focused reviewer-led signal review track.",
      },
      {
        option_id: "stand_down",
        label: "Stand down the signal",
        routing_summary:
          "Closes the signal track — indicators do not support qualification.",
      },
    ],
    directional_confidence: "directional_not_qualified_lean",
    trust_surface_limitations: [
      "Experimental Lite surface — signal reads are exploratory, not runtime.",
      "No predictive or institutional confidence is expressed here.",
      "A human reviewer owns every signal disposition.",
    ],
    routing_pattern: "branching_signal_review",
    eligible_host_surfaces: ["experimental_sandbox", "internal_review_surface"],
    forbidden_host_surfaces: [
      "production_runtime_surface",
      "customer_facing_surface",
      "governed_decision_surface",
    ],
    recourse_path:
      "Open a signal review ticket; a reviewer can re-open or re-route any stood-down signal.",
    generated_at: "2026-02-01T00:00:00.000Z",
  },
};

for (const [filename, input] of Object.entries(inputs)) {
  const envelope = generateLiteQDSPanel(input);
  const path = join(here, filename);
  writeFileSync(path, JSON.stringify(envelope, null, 2) + "\n", "utf8");
  console.log(`wrote ${filename}  (panel ${envelope.panel_spec.panel_id})`);
}
