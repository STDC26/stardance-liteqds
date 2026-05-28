import { useState } from "react";
import type { QDSDefinition } from "../types";

interface IntakeProps {
  definition: QDSDefinition;
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export function Intake({ definition, onComplete, onBack }: IntakeProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = definition.questions;
  const question = questions[step];
  const total = questions.length;
  const isLast = step === total - 1;
  const selectedAnswer = answers[question.id] ?? null;

  function selectAnswer(answerId: string) {
    const next = { ...answers, [question.id]: answerId };
    setAnswers(next);

    if (isLast) {
      onComplete(next);
    } else {
      setTimeout(() => setStep(step + 1), 180);
    }
  }

  function goBack() {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onBack();
    }
  }

  return (
    <div className="intake">
      <div className="intake-def-name">{definition.name}</div>

      <div className="intake-progress">
        <div className="intake-progress-bar">
          <div
            className="intake-progress-fill"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
        <span className="intake-progress-label">
          {step + 1} of {total}
        </span>
      </div>

      <div className="intake-question" key={question.id}>
        <h2 className="intake-prompt">{question.prompt}</h2>
        {question.subtitle && (
          <p className="intake-subtitle">{question.subtitle}</p>
        )}

        <div className="intake-answers">
          {question.answers.map((a) => (
            <button
              key={a.id}
              className={`intake-answer ${selectedAnswer === a.id ? "intake-answer-selected" : ""}`}
              onClick={() => selectAnswer(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-secondary intake-back" onClick={goBack}>
        {step > 0 ? "Back" : "Exit"}
      </button>
    </div>
  );
}
