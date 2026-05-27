import { useState } from "react";
import type { QDSDefinition, QDSQuestion, QDSPathway, QDSAnswerOption } from "../types";
import { validateDefinition } from "../types";

interface BuilderProps {
  onSave: (def: QDSDefinition) => void;
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

export function Builder({ onSave, onCancel }: BuilderProps) {
  const [step, setStep] = useState<"meta" | "pathways" | "questions" | "cta" | "review">("meta");
  const [error, setError] = useState<string | null>(null);

  // Meta
  const [name, setName] = useState("");
  const [audience, setAudience] = useState("");
  const [objective, setObjective] = useState("");

  // Pathways
  const [pathways, setPathways] = useState<PathwayDraft[]>([
    { label: "", description: "" },
    { label: "", description: "" },
  ]);

  // Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { prompt: "", subtitle: "", answers: [{ label: "", weights: {} }, { label: "", weights: {} }] },
  ]);

  // CTA
  const [ctaHeading, setCtaHeading] = useState("Ready to connect?");
  const [ctaSubtitle, setCtaSubtitle] = useState("Leave your details and we'll follow up.");
  const [ctaButton, setCtaButton] = useState("Talk to the {{pathway}} team");
  const [ctaConfirmation, setCtaConfirmation] = useState("Thank you, {{name}}. We'll be in touch at {{email}}.");

  // Trust
  const [trustLimitations, setTrustLimitations] = useState(
    "QDS Lite surface — this is a directional read, not a binding decision.\nA human reviewer must validate before any engagement proceeds."
  );
  const [recoursePath, setRecoursePath] = useState("Request human review; a reviewer can override any directional read.");

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
    const next = [...questions];
    if (next[qIdx].answers.length <= 2) return;
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

  function buildDefinition(): QDSDefinition {
    const builtPathways = buildPathwayIds();
    const builtQuestions: QDSQuestion[] = questions.map((q, qi) => ({
      id: makeId("q", qi),
      prompt: q.prompt,
      subtitle: q.subtitle || undefined,
      answers: q.answers.map((a, ai): QDSAnswerOption => {
        const weights: Record<string, number> = {};
        for (const p of builtPathways) {
          // Weight keys in the draft use the same makeId("pathway", i) keys
          weights[p.id] = a.weights[p.id] ?? 0;
        }
        return { id: makeId(`q${qi}_a`, ai), label: a.label, weights };
      }),
    }));

    return {
      id: `custom-${Date.now()}`,
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
      createdAt: new Date().toISOString(),
    };
  }

  // Stable pathway IDs for weight editing (keyed by index)
  const pathwayIds = pathways.map((_, i) => makeId("pathway", i));

  function handleReview() {
    setError(null);
    const def = buildDefinition();
    const err = validateDefinition(def);
    if (err) {
      setError(err);
      return;
    }
    setStep("review");
  }

  function handleSave() {
    const def = buildDefinition();
    const err = validateDefinition(def);
    if (err) {
      setError(err);
      return;
    }
    onSave(def);
  }

  return (
    <div className="builder">
      <h2 className="builder-title">Create a new QDS</h2>

      {error && <div className="builder-error">{error}</div>}

      {step === "meta" && (
        <div className="builder-step">
          <h3>Basic Information</h3>
          <label className="builder-label">
            QDS Name
            <input className="builder-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Partner Readiness QDS" />
          </label>
          <label className="builder-label">
            Target Audience
            <input className="builder-input" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Who is this QDS for?" />
          </label>
          <label className="builder-label">
            Qualification Objective
            <input className="builder-input" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What does this QDS determine?" />
          </label>
          <div className="builder-nav">
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-primary" onClick={() => setStep("pathways")}>Next: Pathways</button>
          </div>
        </div>
      )}

      {step === "pathways" && (
        <div className="builder-step">
          <h3>Pathways / Outcomes</h3>
          <p className="builder-hint">Define at least two outcome pathways that respondents can be routed to.</p>
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
          <p className="builder-hint">
            Each answer carries a weight for each pathway. Higher weight = stronger signal toward that pathway.
          </p>
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
            <button className="btn-primary" onClick={handleReview}>Review</button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="builder-step">
          <h3>Review QDS Definition</h3>
          <div className="builder-review">
            <div className="review-field"><strong>Name:</strong> {name}</div>
            <div className="review-field"><strong>Audience:</strong> {audience}</div>
            <div className="review-field"><strong>Objective:</strong> {objective}</div>
            <div className="review-field"><strong>Pathways:</strong> {pathways.map((p) => p.label).join(", ")}</div>
            <div className="review-field"><strong>Questions:</strong> {questions.length}</div>
            <div className="review-field"><strong>Total answers:</strong> {questions.reduce((s, q) => s + q.answers.length, 0)}</div>
          </div>
          <div className="builder-nav">
            <button className="btn-secondary" onClick={() => setStep("cta")}>Back</button>
            <button className="btn-primary" onClick={handleSave}>Create QDS</button>
          </div>
        </div>
      )}
    </div>
  );
}
