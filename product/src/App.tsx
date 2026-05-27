import { useState } from "react";
import { generateLiteQDSPanel, type LiteQDSEnvelope } from "../../src/index";
import { scoreIntake, type ScoringResult } from "./scoring";
import { Landing } from "./screens/Landing";
import { Intake } from "./screens/Intake";
import { Result } from "./screens/Result";

type Screen = "landing" | "intake" | "result" | "error";

interface ResultState {
  envelope: LiteQDSEnvelope;
  scoring: ScoringResult;
}

export function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleStart() {
    setScreen("intake");
  }

  function handleIntakeComplete(answers: Record<string, string>) {
    const scoring = scoreIntake(answers);

    // Fail closed: incomplete or malformed input
    if (!scoring) {
      setError("Qualification could not be completed — intake was incomplete or contained invalid responses.");
      setScreen("error");
      return;
    }

    try {
      const envelope = generateLiteQDSPanel(scoring.generatorInput);
      setResult({ envelope, scoring });
      setScreen("result");
    } catch (e) {
      // Generator fail-closed (F-WIRE)
      setError(e instanceof Error ? e.message : "An unexpected error occurred during qualification.");
      setScreen("error");
    }
  }

  function handleRestart() {
    setResult(null);
    setError(null);
    setScreen("landing");
  }

  return (
    <main className="product-root">
      <header className="product-header">
        <span className="product-brand">QDS Lite</span>
        <span className="product-gov-badge">Experimental Lite surface</span>
      </header>

      {screen === "landing" && <Landing onStart={handleStart} />}
      {screen === "intake" && <Intake onComplete={handleIntakeComplete} />}
      {screen === "result" && result && (
        <Result
          envelope={result.envelope}
          scoring={result.scoring}
          onRestart={handleRestart}
        />
      )}
      {screen === "error" && (
        <div className="error-surface">
          <h2>Qualification refused</h2>
          <p className="error-detail">{error}</p>
          <p className="error-trust">
            QDS Lite fails closed when input is incomplete or malformed.
            No partial or speculative result is produced.
          </p>
          <button className="btn-secondary" onClick={handleRestart}>
            Start over
          </button>
        </div>
      )}

      <footer className="product-footer">
        <p>
          Human review required on all results. Not authorized for runtime decisions.
        </p>
      </footer>
    </main>
  );
}
