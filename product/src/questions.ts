// QDS Lite intake questions — each answer carries pathway signal weights.
// Pathways: SD (Stardance), DO (Docente), VMG.

export type Pathway = "SD" | "DO" | "VMG";

export interface AnswerOption {
  id: string;
  label: string;
  /** Signal weight added to each pathway when this answer is selected. */
  weights: Record<Pathway, number>;
}

export interface IntakeQuestion {
  id: string;
  prompt: string;
  subtitle?: string;
  answers: AnswerOption[];
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    id: "domain",
    prompt: "What best describes your primary focus?",
    subtitle: "This helps us understand which qualification path fits your work.",
    answers: [
      { id: "platform", label: "Building a product or platform", weights: { SD: 3, DO: 0, VMG: 0 } },
      { id: "education", label: "Creating educational or training content", weights: { SD: 0, DO: 3, VMG: 0 } },
      { id: "media", label: "Growing an audience or media presence", weights: { SD: 0, DO: 0, VMG: 3 } },
      { id: "hybrid", label: "A combination of these", weights: { SD: 1, DO: 1, VMG: 1 } },
    ],
  },
  {
    id: "stage",
    prompt: "What stage is your project in?",
    answers: [
      { id: "exploring", label: "Exploring — still defining the idea", weights: { SD: 1, DO: 1, VMG: 1 } },
      { id: "planning", label: "Planning — idea is clear, building a roadmap", weights: { SD: 2, DO: 1, VMG: 1 } },
      { id: "building", label: "Building — actively developing", weights: { SD: 2, DO: 2, VMG: 1 } },
      { id: "scaling", label: "Scaling — live and growing", weights: { SD: 1, DO: 1, VMG: 2 } },
    ],
  },
  {
    id: "goal",
    prompt: "What is your most important goal right now?",
    answers: [
      { id: "ship", label: "Ship a functional product or tool", weights: { SD: 3, DO: 0, VMG: 0 } },
      { id: "teach", label: "Launch a course, curriculum, or learning path", weights: { SD: 0, DO: 3, VMG: 0 } },
      { id: "grow", label: "Grow reach, audience, or distribution", weights: { SD: 0, DO: 0, VMG: 3 } },
      { id: "monetize", label: "Monetize an existing offering", weights: { SD: 1, DO: 1, VMG: 1 } },
    ],
  },
  {
    id: "team",
    prompt: "How large is your team?",
    answers: [
      { id: "solo", label: "Solo — just me", weights: { SD: 1, DO: 2, VMG: 2 } },
      { id: "small", label: "Small team (2-5 people)", weights: { SD: 2, DO: 1, VMG: 1 } },
      { id: "org", label: "Organization (6+ people)", weights: { SD: 2, DO: 1, VMG: 0 } },
    ],
  },
  {
    id: "timeline",
    prompt: "What is your target timeline?",
    answers: [
      { id: "immediate", label: "As soon as possible", weights: { SD: 1, DO: 1, VMG: 2 } },
      { id: "quarter", label: "Within the next 1-3 months", weights: { SD: 2, DO: 2, VMG: 1 } },
      { id: "half", label: "3-6 months", weights: { SD: 2, DO: 1, VMG: 1 } },
      { id: "long", label: "6+ months — long-term initiative", weights: { SD: 1, DO: 1, VMG: 0 } },
    ],
  },
  {
    id: "challenge",
    prompt: "What is your biggest challenge right now?",
    subtitle: "Select the one that feels most pressing.",
    answers: [
      { id: "technical", label: "Technical — architecture, tooling, or infrastructure", weights: { SD: 3, DO: 0, VMG: 0 } },
      { id: "content", label: "Content — curriculum design, material quality", weights: { SD: 0, DO: 3, VMG: 1 } },
      { id: "distribution", label: "Distribution — reaching the right people", weights: { SD: 0, DO: 1, VMG: 3 } },
      { id: "clarity", label: "Clarity — unsure which direction to take", weights: { SD: 1, DO: 1, VMG: 1 } },
    ],
  },
  {
    id: "experience",
    prompt: "How much experience do you have with qualification or discovery tools?",
    answers: [
      { id: "none", label: "None — this is new to me", weights: { SD: 0, DO: 1, VMG: 1 } },
      { id: "some", label: "Some — I have used similar tools before", weights: { SD: 1, DO: 1, VMG: 1 } },
      { id: "experienced", label: "Experienced — I work with these regularly", weights: { SD: 2, DO: 1, VMG: 0 } },
    ],
  },
];
