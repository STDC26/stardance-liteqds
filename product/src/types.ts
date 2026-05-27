// QDSDefinition — the configurable schema for any QDS Lite flow.
// An author fills this out (via Builder or code), and the runtime
// renders the intake, scores it, and produces a governed result.

export interface QDSPathway {
  /** Short machine-readable ID, e.g. "growth_fit" */
  id: string;
  /** Human-readable label, e.g. "Growth Fit" */
  label: string;
  /** One-line description for the result card routing summary */
  description: string;
}

export interface QDSAnswerOption {
  id: string;
  label: string;
  /** Weight added to each pathway when selected. Keys must match pathway IDs. */
  weights: Record<string, number>;
}

export interface QDSQuestion {
  id: string;
  prompt: string;
  subtitle?: string;
  answers: QDSAnswerOption[];
}

export interface QDSCtaConfig {
  /** Heading shown above the lead form */
  heading: string;
  /** Subtitle / helper text */
  subtitle: string;
  /** Button label template. Use {{pathway}} for the winning pathway label. */
  buttonLabel: string;
  /** Confirmation message template. Use {{name}}, {{email}}, {{pathway}}. */
  confirmationMessage: string;
}

export interface QDSTrustConfig {
  /** Trust surface limitations shown on the result card */
  limitations: string[];
  /** Recourse path template. Use {{pathway}} for the winning pathway label. */
  recoursePath: string;
}

export interface QDSDefinition {
  /** Unique ID for this QDS definition */
  id: string;
  /** Display name, e.g. "Stardance Growth Fit QDS" */
  name: string;
  /** Target audience description */
  audience: string;
  /** What this QDS qualifies for */
  objective: string;
  /** Available outcome pathways */
  pathways: QDSPathway[];
  /** Intake questions with weighted answers */
  questions: QDSQuestion[];
  /** Lead capture CTA configuration */
  cta: QDSCtaConfig;
  /** Trust and governance display configuration */
  trust: QDSTrustConfig;
  /** Confidence gap thresholds: [qualifiedLean, mixedSignal]. Default [5, 2]. */
  confidenceThresholds?: [number, number];
  /** ISO timestamp of when this definition was created */
  createdAt: string;
}

/** Validate that a QDSDefinition has the minimum required structure. */
export function validateDefinition(def: QDSDefinition): string | null {
  if (!def.id || !def.name) return "QDS name is required.";
  if (!def.objective) return "Qualification objective is required.";
  if (def.pathways.length < 2) return "At least two pathways are required.";
  if (def.questions.length < 1) return "At least one question is required.";

  const pathwayIds = new Set(def.pathways.map((p) => p.id));

  for (const q of def.questions) {
    if (!q.prompt) return `Question "${q.id}" has no prompt.`;
    if (q.answers.length < 2) return `Question "${q.id}" needs at least two answers.`;
    for (const a of q.answers) {
      for (const pid of Object.keys(a.weights)) {
        if (!pathwayIds.has(pid)) {
          return `Answer "${a.id}" references unknown pathway "${pid}".`;
        }
      }
    }
  }

  if (!def.cta.heading || !def.cta.buttonLabel) {
    return "CTA heading and button label are required.";
  }
  if (def.trust.limitations.length < 1) {
    return "At least one trust limitation is required.";
  }

  return null;
}
