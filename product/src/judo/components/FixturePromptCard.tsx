export function FixturePromptCard({
  fixture,
  onGenerate,
}: {
  fixture: { title: string; prompt: string; decisionType: string };
  onGenerate: () => void;
}) {
  return (
    <div className="ddw-fixture-card" data-testid="fixture-prompt-card">
      <span className="ddw-fixture-badge" data-testid="fixture-label">
        Opportunity Qualification Fixture
      </span>
      <h2 className="ddw-fixture-prompt" data-testid="fixture-prompt">
        {fixture.prompt}
      </h2>
      <p className="ddw-fixture-title">{fixture.title}</p>
      <button
        className="btn-primary"
        onClick={onGenerate}
        data-testid="generate-design"
      >
        Generate Qualification Design
      </button>
    </div>
  );
}
