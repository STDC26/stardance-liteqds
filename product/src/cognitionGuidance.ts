// Cognition Guidance — contextual tips displayed at each builder step.
// Follows the Clarity > Flow > Delight > Conviction pattern.

export type BuilderStep = "meta" | "pathways" | "questions" | "cta" | "review";

export interface GuidanceTip {
  /** Short heading */
  title: string;
  /** Guidance body — actionable advice */
  body: string;
}

export interface StepGuidance {
  /** Primary guidance callout for this step */
  primary: GuidanceTip;
  /** Additional tips shown inline */
  tips: GuidanceTip[];
  /** Common mistakes to avoid */
  avoid: string[];
}

export const BUILDER_GUIDANCE: Record<BuilderStep, StepGuidance> = {
  meta: {
    primary: {
      title: "Start with clarity",
      body: "A strong QDS name and objective make the flow self-explanatory. The audience field helps reviewers understand who this qualification is designed for.",
    },
    tips: [
      {
        title: "Name it for the outcome",
        body: "Name your QDS after what it determines, not what it collects. \"Partner Readiness QDS\" is better than \"Partner Survey.\"",
      },
      {
        title: "Be specific about audience",
        body: "\"Founders with $1M+ ARR evaluating growth tooling\" is more useful than \"potential customers.\"",
      },
    ],
    avoid: [
      "Generic names like \"New QDS\" or \"Test Flow\"",
      "Objectives that describe the process instead of the outcome",
    ],
  },
  pathways: {
    primary: {
      title: "Design clear outcomes",
      body: "Each pathway is a possible qualification result. Design them so a reviewer can immediately understand where to route the respondent. Two pathways is a minimum; three is typical.",
    },
    tips: [
      {
        title: "Make pathways mutually exclusive",
        body: "Pathways should represent distinct outcomes, not overlapping states. If two pathways sound similar, consider merging them.",
      },
      {
        title: "Include a \"not ready\" pathway",
        body: "Every QDS should have at least one pathway that signals \"not yet\" or \"needs more work\" — this preserves trust by not forcing a positive result.",
      },
      {
        title: "Write descriptions for the result card",
        body: "Pathway descriptions appear on the governed result card. Write them in a way that makes sense to the respondent, not just to your team.",
      },
    ],
    avoid: [
      "Only positive outcomes — this weakens trust boundaries",
      "More than five pathways — it dilutes signal clarity",
      "Vague labels like \"Other\" or \"Misc\"",
    ],
  },
  questions: {
    primary: {
      title: "Signal, not surveys",
      body: "Each question should generate meaningful signal toward one or more pathways. If a question doesn't change the routing, remove it. Weights determine how strongly each answer pushes toward a pathway.",
    },
    tips: [
      {
        title: "Aim for 4-8 questions",
        body: "Fewer than 4 questions rarely produces enough signal for confident routing. More than 8 creates fatigue without proportional signal gain.",
      },
      {
        title: "Use weight contrast",
        body: "Good signal comes from answers with different weight profiles. If every answer gives the same weights, the question adds no routing value.",
      },
      {
        title: "Ask about state, not opinion",
        body: "\"What is your current revenue stage?\" generates better signal than \"How do you feel about growth?\" Factual questions produce more reliable routing.",
      },
    ],
    avoid: [
      "Questions where all answers have identical weights",
      "Leading questions that assume the respondent's situation",
      "Open-ended questions (the intake is multiple-choice only)",
    ],
  },
  cta: {
    primary: {
      title: "Trust and handoff",
      body: "The CTA captures the lead, and trust limitations protect everyone. Trust limitations appear on the governed result card — they are not optional. At least one limitation must be present.",
    },
    tips: [
      {
        title: "Use template variables",
        body: "Use {{pathway}} in your button label and confirmation message to personalize the CTA based on the routing result. {{name}} and {{email}} are available in the confirmation.",
      },
      {
        title: "Keep trust limitations honest",
        body: "These are governance guardrails. They tell the respondent what this result is NOT — not a binding decision, not a guarantee, not a runtime authorization.",
      },
    ],
    avoid: [
      "Removing trust limitations — they are required by governance",
      "Overpromising in the CTA (\"guaranteed results\")",
      "Skipping the recourse path — respondents must have a way to escalate",
    ],
  },
  review: {
    primary: {
      title: "Final check before save",
      body: "Review the summary below. After saving, the QDS will appear in your library and can be run, edited, or duplicated. The Readiness Review will check for quality issues before the first run.",
    },
    tips: [],
    avoid: [],
  },
};

/** Get the guidance for a specific builder step. */
export function getStepGuidance(step: BuilderStep): StepGuidance {
  return BUILDER_GUIDANCE[step];
}
