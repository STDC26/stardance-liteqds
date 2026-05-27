import { useState } from "react";
import { INTAKE_QUESTIONS } from "../questions";

interface IntakeProps {
  onComplete: (answers: Record<string, string>) => void;
}

export function Intake({ onComplete }: IntakeProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = INTAKE_QUESTIONS[step];
  const total = INTAKE_QUESTIONS.length;
  const isLast = step === total - 1;
  const selectedAnswer = answers[question.id] ?? null;

  function selectAnswer(answerId: string) {
    const next = { ...answers, [question.id]: answerId };
    setAnswers(next);

    if (isLast) {
      // All questions answered — submit
      onComplete(next);
    } else {
      // Auto-advance after a brief visual beat
      setTimeout(() => setStep(step + 1), 180);
    }
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="intake">
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

      {step > 0 && (
        <button className="btn-secondary intake-back" onClick={goBack}>
          Back
        </button>
      )}
    </div>
  );
}
