import { useState } from "react";
import type { QDSDefinition, QDSQuestion, QDSPathway, QDSAnswerOption } from "../types";
import { getStepGuidance, type BuilderStep, EXAMPLE_CHIPS } from "../cognitionGuidance";

interface BuilderProps {
  /** If provided, the builder opens in edit mode with pre-filled values. */
  editSource?: QDSDefinition;
  onSubmit: (def: QDSDefinition) => void;
  onCancel: () => void;
}

function makeId(prefix: string, index: number): string {
  return `${prefix}_${index}`;
}

interface PathwayDraft {
  label: string;
  description: string;
}

interface AnswerDraft {
  label: string;
  weights: Record<string, number>;
}

interface QuestionDraft {
  prompt: string;
  subtitle: string;
  answers: AnswerDraft[];
}

function Guidance({ step }: { step: BuilderStep }) {
  const guidance = getStepGuidance(step);
  return (
    <div className="guidance">
      <div className="guidance-primary">
        <div className="guidance-badge">Guidance</div>
        <strong className="guidance-title">{guidance.primary.title}</strong>
        <p className="guidance-body">{guidance.primary.body}</p>
      </div>
      {guidance.tips.length > 0 && (
        <div className="guidance-tips">
          {guidance.tips.map((tip, i) => (
            <div className="guidance-tip" key={i}>
              <strong className="guidance-tip-title">{tip.title}</strong>
              <p className="guidance-tip-body">{tip.body}</p>
            </div>
          ))}
        </div>
      )}
      {guidance.avoid.length > 0 && (
        <div className="guidance-avoid">
          <strong className="guidance-avoid-heading">Avoid</strong>
          <ul className="guidance-avoid-list">
            {guidance.avoid.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Cognition-enhanced meta step components ---

function ExampleChips({
  chips,
  currentValue,
  onSelect,
}: {
  chips: string[];
  currentValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="example-chips">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          className={`example-chip ${currentValue === chip ? "example-chip-active" : ""}`}
          onClick={() => onSelect(chip)}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

function LiveConceptPreview({
  name,
  audience,
  objective,
}: {
  name: string;
  audience: string;
  objective: string;
}) {
  const hasContent = name || audience || objective;

  return (
    <div className="concept-preview">
      <div className="concept-preview-header">
        <span className="concept-preview-badge">Emerging QDS Concept</span>
      </div>
      {hasContent ? (
        <div className="concept-preview-body">
          {name && (
            <p className="concept-preview-line">
              <strong>{name}</strong>
            </p>
          )}
          {audience && objective ? (
            <p className="concept-preview-line concept-preview-sentence">
              A qualification experience for <em>{audience}</em> to help
              determine <em>{objective.toLowerCase().replace(/\.$/, "")}</em>.
            </p>
          ) : audience ? (
            <p className="concept-preview-line concept-preview-sentence">
              Designed for <em>{audience}</em>.
            </p>
          ) : objective ? (
            <p className="concept-preview-line concept-preview-sentence">
              Purpose: <em>{objective}</em>
            </p>
          ) : null}
        </div>
      ) : (
        <p className="concept-preview-empty">
          As you define the basics, this preview will summarize the
          qualification system you are shaping.
        </p>
      )}
    </div>
  );
}

function WeakInputCoach({ field, value }: { field: "name" | "audience" | "objective"; value: string }) {
  if (!value || value.length < 3) return null;

  const trimmed = value.trim();
  let message: string | null = null;

  if (field === "name") {
    const weak = /^(new|test|my|untitled|qds|flow)\b/i.test(trimmed) || trimmed.length < 8;
    if (weak) message = "Consider naming the decision moment this QDS supports, not just the topic.";
  } else if (field === "objective") {
    const vague = trimmed.split(/\s+/).length < 4 || /^(qualify|check|test|assess)$/i.test(trimmed);
    if (vague) message = "Add the operational decision this QDS should help clarify.";
  } else if (field === "audience") {
    const broad = /^(everyone|anyone|people|users|customers)$/i.test(trimmed);
    if (broad) message = "Narrow the audience to improve downstream pathway quality.";
  }

  if (!message) return null;

  return <p className="weak-input-coach">{message}</p>;
}

// Convert a QDSDefinition into draft state for editing
function toDrafts(def: QDSDefinition) {
  const pathways: PathwayDraft[] = def.pathways.map((p) => ({
    label: p.label,
    description: p.description,
  }));

  // Build a mapping from original pathway IDs to draft pathway IDs
  const idMap: Record<string, string> = {};
  def.pathways.forEach((p, i) => {
    idMap[p.id] = makeId("pathway", i);
  });

  const questions: QuestionDraft[] = def.questions.map((q) => ({
    prompt: q.prompt,
    subtitle: q.subtitle ?? "",
    answers: q.answers.map((a) => {
      const weights: Record<string, number> = {};
      for (const [origId, w] of Object.entries(a.weights)) {
        const draftId = idMap[origId];
        if (draftId) weights[draftId] = w;
      }
      return { label: a.label, weights };
    }),
  }));

  return { pathways, questions };
}

export function Builder({ editSource, onSubmit, onCancel }: BuilderProps) {
  const isEdit = !!editSource;
  const [step, setStep] = useState<BuilderStep>("meta");
  const [error, setError] = useState<string | null>(null);

  // Initialize from editSource if present
  const initDrafts = editSource ? toDrafts(editSource) : null;

  // Meta
  const [name, setName] = useState(editSource?.name ?? "");
  const [audience, setAudience] = useState(editSource?.audience ?? "");
  const [objective, setObjective] = useState(editSource?.objective ?? "");

  // Pathways
  const [pathways, setPathways] = useState<PathwayDraft[]>(
    initDrafts?.pathways ?? [
      { label: "", description: "" },
      { label: "", description: "" },
    ]
  );

  // Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initDrafts?.questions ?? [
      { prompt: "", subtitle: "", answers: [{ label: "", weights: {} }, { label: "", weights: {} }] },
    ]
  );

  // CTA
  const [ctaHeading, setCtaHeading] = useState(editSource?.cta.heading ?? "Ready to connect?");
  const [ctaSubtitle, setCtaSubtitle] = useState(editSource?.cta.subtitle ?? "Leave your details and we'll follow up.");
  const [ctaButton, setCtaButton] = useState(editSource?.cta.buttonLabel ?? "Talk to the {{pathway}} team");
  const [ctaConfirmation, setCtaConfirmation] = useState(editSource?.cta.confirmationMessage ?? "Thank you, {{name}}. We'll be in touch at {{email}}.");

  // Trust
  const [trustLimitations, setTrustLimitations] = useState(
    editSource?.trust.limitations.join("\n") ??
    "QDS Lite surface — this is a directional read, not a binding decision.\nA human reviewer must validate before any engagement proceeds."
  );
  const [recoursePath, setRecoursePath] = useState(
    editSource?.trust.recoursePath ??
    "Request human review; a reviewer can override any directional read."
  );

  function updatePathway(idx: number, field: keyof PathwayDraft, value: string) {
    const next = [...pathways];
    next[idx] = { ...next[idx], [field]: value };
    setPathways(next);
  }

  function addPathway() {
    setPathways([...pathways, { label: "", description: "" }]);
  }

  function removePathway(idx: number) {
    if (pathways.length <= 2) return;
    setPathways(pathways.filter((_, i) => i !== idx));
  }

  function updateQuestion(qIdx: number, field: "prompt" | "subtitle", value: string) {
    const next = [...questions];
    next[qIdx] = { ...next[qIdx], [field]: value };
    setQuestions(next);
  }

  function updateAnswer(qIdx: number, aIdx: number, label: string) {
    const next = [...questions];
    const q = { ...next[qIdx], answers: [...next[qIdx].answers] };
    q.answers[aIdx] = { ...q.answers[aIdx], label };
    next[qIdx] = q;
    setQuestions(next);
  }

  function updateWeight(qIdx: number, aIdx: number, pathwayId: string, value: number) {
    const next = [...questions];
    const q = { ...next[qIdx], answers: [...next[qIdx].answers] };
    const a = { ...q.answers[aIdx], weights: { ...q.answers[aIdx].weights } };
    a.weights[pathwayId] = value;
    q.answers[aIdx] = a;
    next[qIdx] = q;
    setQuestions(next);
  }

  function addAnswer(qIdx: number) {
    const next = [...questions];
    const q = { ...next[qIdx], answers: [...next[qIdx].answers, { label: "", weights: {} }] };
    next[qIdx] = q;
    setQuestions(next);
  }

  function removeAnswer(qIdx: number, aIdx: number) {
    if (questions[qIdx].answers.length <= 2) return;
    const next = [...questions];
    const q = { ...next[qIdx], answers: next[qIdx].answers.filter((_, i) => i !== aIdx) };
    next[qIdx] = q;
    setQuestions(next);
  }

  function addQuestion() {
    setQuestions([...questions, { prompt: "", subtitle: "", answers: [{ label: "", weights: {} }, { label: "", weights: {} }] }]);
  }

  function removeQuestion(idx: number) {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  }

  function buildPathwayIds(): QDSPathway[] {
    return pathways.map((p, i) => ({
      id: makeId("pathway", i),
      label: p.label,
      description: p.description,
    }));
  }

  const pathwayIds = pathways.map((_, i) => makeId("pathway", i));

  function buildDefinition(): QDSDefinition {
    const builtPathways = buildPathwayIds();
    const builtQuestions: QDSQuestion[] = questions.map((q, qi) => ({
      id: makeId("q", qi),
      prompt: q.prompt,
      subtitle: q.subtitle || undefined,
      answers: q.answers.map((a, ai): QDSAnswerOption => {
        const weights: Record<string, number> = {};
        for (const p of builtPathways) {
          weights[p.id] = a.weights[p.id] ?? 0;
        }
        return { id: makeId(`q${qi}_a`, ai), label: a.label, weights };
      }),
    }));

    return {
      id: editSource?.id ?? `custom-${Date.now()}`,
      name,
      audience,
      objective,
      pathways: builtPathways,
      questions: builtQuestions,
      cta: {
        heading: ctaHeading,
        subtitle: ctaSubtitle,
        buttonLabel: ctaButton,
        confirmationMessage: ctaConfirmation,
      },
      trust: {
        limitations: trustLimitations.split("\n").filter((l) => l.trim()),
        recoursePath,
      },
      createdAt: editSource?.createdAt ?? new Date().toISOString(),
    };
  }

  function handleSubmit() {
    setError(null);
    const def = buildDefinition();
    onSubmit(def);
  }

  return (
    <div className="builder">
      <h2 className="builder-title">{isEdit ? `Edit: ${name || "QDS"}` : "Create a new QDS"}</h2>

      {error && <div className="builder-error">{error}</div>}

      <Guidance step={step} />

      {step === "meta" && (
        <div className="builder-step">
          <div className="progression-frame">
            <strong className="progression-frame-title">Shape the QDS foundation</strong>
            <p className="progression-frame-body">
              Define the core purpose, audience, and operating context. The goal
              is not perfect wording yet — it is enough clarity for the system to
              help structure the qualification flow.
            </p>
          </div>

          <h3>Basic Information</h3>

          <label className="builder-label">
            QDS Name
            <span className="field-guidance">Use a name that describes the decision or qualification moment, not just the topic.</span>
            <input className="builder-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Partner Readiness Check" />
            <ExampleChips chips={EXAMPLE_CHIPS.name} currentValue={name} onSelect={setName} />
            <WeakInputCoach field="name" value={name} />
          </label>

          <label className="builder-label">
            Target Audience
            <span className="field-guidance">Identify who is answering and what context they bring. Specific audiences produce sharper qualification signal.</span>
            <input className="builder-input" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Founders with $1M+ ARR evaluating growth tooling" />
            <ExampleChips chips={EXAMPLE_CHIPS.audience} currentValue={audience} onSelect={setAudience} />
            <WeakInputCoach field="audience" value={audience} />
          </label>

          <label className="builder-label">
            Qualification Objective
            <span className="field-guidance">Describe the operational decision this QDS should support. What should be clearer after someone completes the flow?</span>
            <input className="builder-input" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="e.g. Determine readiness for technical integration" />
            <ExampleChips chips={EXAMPLE_CHIPS.objective} currentValue={objective} onSelect={setObjective} />
            <WeakInputCoach field="objective" value={objective} />
          </label>

          <LiveConceptPreview name={name} audience={audience} objective={objective} />

          <div className="builder-nav">
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-primary" onClick={() => setStep("pathways")}>Next: Pathways</button>
          </div>
        </div>
      )}

      {step === "pathways" && (
        <div className="builder-step">
          <h3>Pathways / Outcomes</h3>
          {pathways.map((p, i) => (
            <div className="builder-pathway" key={i}>
              <div className="builder-pathway-header">
                <span className="builder-pathway-num">Pathway {i + 1}</span>
                {pathways.length > 2 && (
                  <button className="builder-remove" onClick={() => removePathway(i)}>Remove</button>
                )}
              </div>
              <input className="builder-input" value={p.label} onChange={(e) => updatePathway(i, "label", e.target.value)} placeholder="Label (e.g. Strong Fit)" />
              <input className="builder-input" value={p.description} onChange={(e) => updatePathway(i, "description", e.target.value)} placeholder="Description (shown on result card)" />
            </div>
          ))}
          <button className="btn-secondary builder-add" onClick={addPathway}>+ Add pathway</button>
          <div className="builder-nav">
            <button className="btn-secondary" onClick={() => setStep("meta")}>Back</button>
            <button className="btn-primary" onClick={() => setStep("questions")}>Next: Questions</button>
          </div>
        </div>
      )}

      {step === "questions" && (
        <div className="builder-step">
          <h3>Questions</h3>
          {questions.map((q, qi) => (
            <div className="builder-question" key={qi}>
              <div className="builder-pathway-header">
                <span className="builder-pathway-num">Question {qi + 1}</span>
                {questions.length > 1 && (
                  <button className="builder-remove" onClick={() => removeQuestion(qi)}>Remove</button>
                )}
              </div>
              <input className="builder-input" value={q.prompt} onChange={(e) => updateQuestion(qi, "prompt", e.target.value)} placeholder="Question prompt" />
              <input className="builder-input builder-input-small" value={q.subtitle} onChange={(e) => updateQuestion(qi, "subtitle", e.target.value)} placeholder="Subtitle (optional)" />

              <div className="builder-answers">
                {q.answers.map((a, ai) => (
                  <div className="builder-answer" key={ai}>
                    <div className="builder-answer-row">
                      <input className="builder-input builder-answer-label" value={a.label} onChange={(e) => updateAnswer(qi, ai, e.target.value)} placeholder={`Answer ${ai + 1}`} />
                      {q.answers.length > 2 && (
                        <button className="builder-remove-sm" onClick={() => removeAnswer(qi, ai)}>x</button>
                      )}
                    </div>
                    <div className="builder-weights">
                      {pathways.map((p, pi) => (
                        <label className="builder-weight" key={pi}>
                          <span className="builder-weight-label">{p.label || `P${pi + 1}`}</span>
                          <input
                            className="builder-weight-input"
                            type="number"
                            min={0}
                            max={10}
                            value={a.weights[pathwayIds[pi]] ?? 0}
                            onChange={(e) => updateWeight(qi, ai, pathwayIds[pi], Number(e.target.value))}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="builder-add-sm" onClick={() => addAnswer(qi)}>+ Add answer</button>
              </div>
            </div>
          ))}
          <button className="btn-secondary builder-add" onClick={addQuestion}>+ Add question</button>
          <div className="builder-nav">
            <button className="btn-secondary" onClick={() => setStep("pathways")}>Back</button>
            <button className="btn-primary" onClick={() => setStep("cta")}>Next: CTA &amp; Trust</button>
          </div>
        </div>
      )}

      {step === "cta" && (
        <div className="builder-step">
          <h3>Lead Capture &amp; Trust</h3>
          <label className="builder-label">
            CTA Heading
            <input className="builder-input" value={ctaHeading} onChange={(e) => setCtaHeading(e.target.value)} />
          </label>
          <label className="builder-label">
            CTA Subtitle
            <input className="builder-input" value={ctaSubtitle} onChange={(e) => setCtaSubtitle(e.target.value)} />
          </label>
          <label className="builder-label">
            Button Label <span className="builder-hint-inline">use {"{{pathway}}"} for pathway name</span>
            <input className="builder-input" value={ctaButton} onChange={(e) => setCtaButton(e.target.value)} />
          </label>
          <label className="builder-label">
            Confirmation Message <span className="builder-hint-inline">use {"{{name}}"}, {"{{email}}"}, {"{{pathway}}"}</span>
            <input className="builder-input" value={ctaConfirmation} onChange={(e) => setCtaConfirmation(e.target.value)} />
          </label>
          <label className="builder-label">
            Trust Limitations <span className="builder-hint-inline">one per line</span>
            <textarea className="builder-textarea" value={trustLimitations} onChange={(e) => setTrustLimitations(e.target.value)} />
          </label>
          <label className="builder-label">
            Recourse Path
            <input className="builder-input" value={recoursePath} onChange={(e) => setRecoursePath(e.target.value)} />
          </label>
          <div className="builder-nav">
            <button className="btn-secondary" onClick={() => setStep("questions")}>Back</button>
            <button className="btn-primary" onClick={handleSubmit}>
              {isEdit ? "Save changes" : "Review & Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
