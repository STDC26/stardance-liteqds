// JUDO DDW — Locked Healthcare Expansion Fixture
// Source: Spec v1.0 §9

export const healthcareExpansionFixture = {
  id: "fixture-healthcare-expansion-001",
  title: "Healthcare Expansion Opportunity Qualification",
  prompt: "Should we expand into healthcare?",
  decisionType: "OPPORTUNITY_QUALIFICATION" as const,
  expectedOutcome:
    "Generate a governed candidate qualification system for healthcare expansion.",
  locked: true,
};
