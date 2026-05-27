// Three demo QDS definitions — created without code changes via the
// QDSDefinition schema. Each demonstrates a different qualification domain.

import type { QDSDefinition } from "./types";

export const PRESET_STARDANCE_GROWTH: QDSDefinition = {
  id: "preset-sd-growth-fit",
  name: "Stardance Growth Fit QDS",
  audience: "Founders, product leads, and growth operators evaluating Stardance",
  objective: "Determine whether Stardance is the right growth infrastructure for the prospect's stage and goals",
  pathways: [
    { id: "strong_fit", label: "Strong Fit", description: "High alignment with Stardance growth infrastructure — ready for onboarding conversation." },
    { id: "exploratory", label: "Exploratory Fit", description: "Moderate alignment — would benefit from a discovery call to clarify fit." },
    { id: "not_yet", label: "Not Yet Ready", description: "Low alignment at current stage — revisit when foundational elements are in place." },
  ],
  questions: [
    {
      id: "revenue_stage",
      prompt: "What is your current revenue stage?",
      answers: [
        { id: "pre_rev", label: "Pre-revenue", weights: { strong_fit: 0, exploratory: 1, not_yet: 2 } },
        { id: "early", label: "Early revenue ($1K-$50K/mo)", weights: { strong_fit: 2, exploratory: 1, not_yet: 0 } },
        { id: "growth", label: "Growth stage ($50K+/mo)", weights: { strong_fit: 3, exploratory: 0, not_yet: 0 } },
      ],
    },
    {
      id: "growth_model",
      prompt: "What is your primary growth model?",
      answers: [
        { id: "organic", label: "Organic / word of mouth", weights: { strong_fit: 1, exploratory: 2, not_yet: 0 } },
        { id: "paid", label: "Paid acquisition", weights: { strong_fit: 2, exploratory: 1, not_yet: 0 } },
        { id: "product_led", label: "Product-led growth", weights: { strong_fit: 3, exploratory: 0, not_yet: 0 } },
        { id: "none", label: "No defined growth model yet", weights: { strong_fit: 0, exploratory: 1, not_yet: 2 } },
      ],
    },
    {
      id: "team_capacity",
      prompt: "Does your team have capacity to implement new growth tooling?",
      answers: [
        { id: "yes", label: "Yes — we have dedicated resources", weights: { strong_fit: 3, exploratory: 0, not_yet: 0 } },
        { id: "partial", label: "Partially — it would require reprioritization", weights: { strong_fit: 1, exploratory: 2, not_yet: 0 } },
        { id: "no", label: "No — we're fully allocated", weights: { strong_fit: 0, exploratory: 0, not_yet: 3 } },
      ],
    },
    {
      id: "data_infra",
      prompt: "How mature is your data infrastructure?",
      answers: [
        { id: "mature", label: "Mature — analytics, tracking, and pipelines in place", weights: { strong_fit: 3, exploratory: 0, not_yet: 0 } },
        { id: "basic", label: "Basic — some analytics, limited pipelines", weights: { strong_fit: 1, exploratory: 2, not_yet: 0 } },
        { id: "minimal", label: "Minimal — mostly manual or ad hoc", weights: { strong_fit: 0, exploratory: 1, not_yet: 2 } },
      ],
    },
    {
      id: "timeline",
      prompt: "When would you want to start with growth tooling?",
      answers: [
        { id: "now", label: "Immediately", weights: { strong_fit: 3, exploratory: 1, not_yet: 0 } },
        { id: "quarter", label: "Next quarter", weights: { strong_fit: 2, exploratory: 1, not_yet: 0 } },
        { id: "later", label: "Later this year or beyond", weights: { strong_fit: 0, exploratory: 1, not_yet: 2 } },
      ],
    },
    {
      id: "budget",
      prompt: "Do you have budget allocated for growth infrastructure?",
      answers: [
        { id: "yes", label: "Yes — budget is approved", weights: { strong_fit: 3, exploratory: 0, not_yet: 0 } },
        { id: "pending", label: "Pending approval", weights: { strong_fit: 1, exploratory: 2, not_yet: 0 } },
        { id: "no", label: "No budget allocated", weights: { strong_fit: 0, exploratory: 0, not_yet: 3 } },
      ],
    },
  ],
  cta: {
    heading: "Ready to explore Stardance?",
    subtitle: "Leave your details and we'll connect you with the right person.",
    buttonLabel: "Talk to the Stardance team",
    confirmationMessage: "Thank you, {{name}}. The Stardance team will be in touch at {{email}}.",
  },
  trust: {
    limitations: [
      "QDS Lite surface — this is a directional growth-fit read, not a binding assessment.",
      "No predictive or institutional scoring is applied.",
      "A human reviewer must validate before any engagement proceeds.",
      "Responses are self-reported and not independently verified.",
    ],
    recoursePath: "Request a direct conversation with the Stardance team; a reviewer can override any directional read.",
  },
  createdAt: "2026-05-26T00:00:00.000Z",
};

export const PRESET_DOCENTE_LEARNING: QDSDefinition = {
  id: "preset-do-learning-fit",
  name: "Docente Learning Fit QDS",
  audience: "Educators, course creators, and training leads evaluating Docente",
  objective: "Determine whether Docente is the right platform for the prospect's learning content goals",
  pathways: [
    { id: "ready", label: "Ready to Build", description: "Strong alignment with Docente — ready to start building learning paths." },
    { id: "needs_shaping", label: "Needs Shaping", description: "Good potential but content or curriculum needs refinement first." },
    { id: "not_aligned", label: "Not Aligned", description: "Current goals don't align with Docente's learning path model." },
  ],
  questions: [
    {
      id: "content_type",
      prompt: "What type of learning content are you creating?",
      answers: [
        { id: "structured", label: "Structured courses with clear learning outcomes", weights: { ready: 3, needs_shaping: 0, not_aligned: 0 } },
        { id: "modular", label: "Modular content — lessons, guides, or tutorials", weights: { ready: 2, needs_shaping: 1, not_aligned: 0 } },
        { id: "informal", label: "Informal or community-based learning", weights: { ready: 0, needs_shaping: 1, not_aligned: 2 } },
        { id: "unsure", label: "Not sure yet — still defining the format", weights: { ready: 0, needs_shaping: 2, not_aligned: 1 } },
      ],
    },
    {
      id: "audience_size",
      prompt: "How large is your target learner audience?",
      answers: [
        { id: "large", label: "Large (500+ learners)", weights: { ready: 3, needs_shaping: 0, not_aligned: 0 } },
        { id: "medium", label: "Medium (50-500 learners)", weights: { ready: 2, needs_shaping: 1, not_aligned: 0 } },
        { id: "small", label: "Small (under 50 learners)", weights: { ready: 1, needs_shaping: 1, not_aligned: 1 } },
        { id: "unknown", label: "Don't know yet", weights: { ready: 0, needs_shaping: 2, not_aligned: 1 } },
      ],
    },
    {
      id: "existing_content",
      prompt: "How much existing content do you have?",
      answers: [
        { id: "extensive", label: "Extensive — ready to structure into a curriculum", weights: { ready: 3, needs_shaping: 0, not_aligned: 0 } },
        { id: "some", label: "Some — needs organization and gaps filled", weights: { ready: 1, needs_shaping: 2, not_aligned: 0 } },
        { id: "none", label: "Starting from scratch", weights: { ready: 0, needs_shaping: 1, not_aligned: 2 } },
      ],
    },
    {
      id: "monetization",
      prompt: "Do you plan to monetize your learning content?",
      answers: [
        { id: "yes", label: "Yes — paid courses or subscriptions", weights: { ready: 3, needs_shaping: 0, not_aligned: 0 } },
        { id: "maybe", label: "Possibly — exploring models", weights: { ready: 1, needs_shaping: 2, not_aligned: 0 } },
        { id: "no", label: "No — internal training or free content", weights: { ready: 1, needs_shaping: 1, not_aligned: 1 } },
      ],
    },
    {
      id: "assessment",
      prompt: "Do you need learner assessment or certification?",
      answers: [
        { id: "yes", label: "Yes — quizzes, exams, or certificates", weights: { ready: 3, needs_shaping: 0, not_aligned: 0 } },
        { id: "light", label: "Light — progress tracking only", weights: { ready: 2, needs_shaping: 1, not_aligned: 0 } },
        { id: "no", label: "No — consumption-only", weights: { ready: 0, needs_shaping: 1, not_aligned: 2 } },
      ],
    },
  ],
  cta: {
    heading: "Ready to build with Docente?",
    subtitle: "Leave your details and we'll match you with a learning design specialist.",
    buttonLabel: "Talk to the Docente team",
    confirmationMessage: "Thank you, {{name}}. The Docente team will be in touch at {{email}}.",
  },
  trust: {
    limitations: [
      "QDS Lite surface — this is a directional learning-fit read, not a binding assessment.",
      "No institutional confidence or predictive scoring is applied.",
      "A human reviewer must validate before any engagement proceeds.",
      "Responses are self-reported and not independently verified.",
    ],
    recoursePath: "Request a direct conversation with the Docente team; a reviewer can override any directional read.",
  },
  createdAt: "2026-05-26T00:00:00.000Z",
};

export const PRESET_VMG_ADAPTATION: QDSDefinition = {
  id: "preset-vmg-adaptation",
  name: "VMG Adaptation Readiness QDS",
  audience: "Content creators, media teams, and brand strategists evaluating VMG",
  objective: "Determine whether the prospect is ready to adopt VMG's media adaptation framework",
  pathways: [
    { id: "adapt_ready", label: "Adaptation Ready", description: "Strong alignment — ready to begin VMG media adaptation." },
    { id: "foundation", label: "Foundation Needed", description: "Good intent but foundational media assets or strategy need building first." },
    { id: "premature", label: "Premature", description: "Not enough media presence or clarity to benefit from adaptation tooling yet." },
  ],
  questions: [
    {
      id: "media_presence",
      prompt: "How would you describe your current media presence?",
      answers: [
        { id: "established", label: "Established — active across multiple channels", weights: { adapt_ready: 3, foundation: 0, premature: 0 } },
        { id: "emerging", label: "Emerging — 1-2 channels, growing", weights: { adapt_ready: 1, foundation: 2, premature: 0 } },
        { id: "minimal", label: "Minimal — just getting started", weights: { adapt_ready: 0, foundation: 1, premature: 2 } },
      ],
    },
    {
      id: "content_volume",
      prompt: "How much content are you producing per month?",
      answers: [
        { id: "high", label: "High volume (20+ pieces)", weights: { adapt_ready: 3, foundation: 0, premature: 0 } },
        { id: "moderate", label: "Moderate (5-20 pieces)", weights: { adapt_ready: 2, foundation: 1, premature: 0 } },
        { id: "low", label: "Low (under 5 pieces)", weights: { adapt_ready: 0, foundation: 1, premature: 2 } },
      ],
    },
    {
      id: "repurposing",
      prompt: "Do you currently repurpose content across formats?",
      answers: [
        { id: "systematic", label: "Yes — we have a systematic repurposing workflow", weights: { adapt_ready: 3, foundation: 0, premature: 0 } },
        { id: "ad_hoc", label: "Sometimes — ad hoc, no consistent process", weights: { adapt_ready: 1, foundation: 2, premature: 0 } },
        { id: "no", label: "No — each piece is one-and-done", weights: { adapt_ready: 0, foundation: 1, premature: 2 } },
      ],
    },
    {
      id: "audience_data",
      prompt: "How well do you understand your audience segments?",
      answers: [
        { id: "deep", label: "Deep — we have personas, analytics, and segmentation", weights: { adapt_ready: 3, foundation: 0, premature: 0 } },
        { id: "basic", label: "Basic — we know who shows up but lack detailed data", weights: { adapt_ready: 1, foundation: 2, premature: 0 } },
        { id: "guessing", label: "Guessing — no real audience data yet", weights: { adapt_ready: 0, foundation: 0, premature: 3 } },
      ],
    },
    {
      id: "adaptation_goal",
      prompt: "What is your primary goal with media adaptation?",
      answers: [
        { id: "reach", label: "Expand reach to new audiences and channels", weights: { adapt_ready: 3, foundation: 0, premature: 0 } },
        { id: "efficiency", label: "Get more output from existing content", weights: { adapt_ready: 2, foundation: 1, premature: 0 } },
        { id: "clarity", label: "Figure out what content strategy to pursue", weights: { adapt_ready: 0, foundation: 1, premature: 2 } },
      ],
    },
    {
      id: "team_bandwidth",
      prompt: "Do you have team bandwidth to run an adaptation workflow?",
      answers: [
        { id: "yes", label: "Yes — dedicated content/media team", weights: { adapt_ready: 3, foundation: 0, premature: 0 } },
        { id: "partial", label: "Partial — could dedicate some hours", weights: { adapt_ready: 1, foundation: 2, premature: 0 } },
        { id: "no", label: "No — fully stretched", weights: { adapt_ready: 0, foundation: 0, premature: 3 } },
      ],
    },
  ],
  cta: {
    heading: "Ready to explore VMG?",
    subtitle: "Leave your details and a VMG strategist will reach out.",
    buttonLabel: "Talk to the VMG team",
    confirmationMessage: "Thank you, {{name}}. The VMG team will be in touch at {{email}}.",
  },
  trust: {
    limitations: [
      "QDS Lite surface — this is a directional adaptation-readiness read, not a binding assessment.",
      "No predictive or institutional scoring is applied.",
      "A human reviewer must validate before any engagement proceeds.",
      "Responses are self-reported and not independently verified.",
    ],
    recoursePath: "Request a direct conversation with the VMG team; a reviewer can override any directional read.",
  },
  createdAt: "2026-05-26T00:00:00.000Z",
};

export const PRESETS: QDSDefinition[] = [
  PRESET_STARDANCE_GROWTH,
  PRESET_DOCENTE_LEARNING,
  PRESET_VMG_ADAPTATION,
];
