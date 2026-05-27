import { useState } from "react";
import { generateLiteQDSPanel, type LiteQDSEnvelope } from "../../src/index";
import { scoreDefinition, type ScoringResult } from "./scoring";
import { PRESETS } from "./presets";
import type { QDSDefinition } from "./types";
import { Landing } from "./screens/Landing";
import { Gallery } from "./screens/Gallery";
import { Builder } from "./screens/Builder";
import { Intake } from "./screens/Intake";
import { Result } from "./screens/Result";

type Screen = "landing" | "gallery" | "builder" | "intake" | "result" | "error";

interface ResultState {
  envelope: LiteQDSEnvelope;
  scoring: ScoringResult;
}

export function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [customDefs, setCustomDefs] = useState<QDSDefinition[]>([]);
  const [activeDef, setActiveDef] = useState<QDSDefinition | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allDefinitions = [...PRESETS, ...customDefs];

  function handleSelectDef(def: QDSDefinition) {
    setActiveDef(def);
    setScreen("intake");
  }

  function handleBuilderSave(def: QDSDefinition) {
    setCustomDefs([...customDefs, def]);
    setActiveDef(def);
    setScreen("intake");
  }

  function handleIntakeComplete(answers: Record<string, string>) {
    if (!activeDef) {
      setError("No QDS definition selected.");
      setScreen("error");
      return;
    }

    const scoring = scoreDefinition(activeDef, answers);

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
      setError(e instanceof Error ? e.message : "An unexpected error occurred during qualification.");
      setScreen("error");
    }
  }

  function handleRestart() {
    setResult(null);
    setError(null);
    if (activeDef) {
      setScreen("intake");
    } else {
      setScreen("gallery");
    }
  }

  function handleGallery() {
    setResult(null);
    setError(null);
    setActiveDef(null);
    setScreen("gallery");
  }

  function handleHome() {
    setResult(null);
    setError(null);
    setActiveDef(null);
    setScreen("landing");
  }

  return (
    <main className="product-root">
      <header className="product-header">
        <button className="product-brand" onClick={handleHome}>QDS Lite</button>
        <span className="product-gov-badge">Experimental Lite surface</span>
      </header>

      {screen === "landing" && (
        <Landing
          onStart={() => setScreen("builder")}
          onGallery={() => setScreen("gallery")}
        />
      )}
      {screen === "gallery" && (
        <Gallery
          definitions={allDefinitions}
          onSelect={handleSelectDef}
          onCreate={() => setScreen("builder")}
        />
      )}
      {screen === "builder" && (
        <Builder
          onSave={handleBuilderSave}
          onCancel={() => setScreen("gallery")}
        />
      )}
      {screen === "intake" && activeDef && (
        <Intake
          definition={activeDef}
          onComplete={handleIntakeComplete}
          onBack={handleGallery}
        />
      )}
      {screen === "result" && result && activeDef && (
        <Result
          definition={activeDef}
          envelope={result.envelope}
          scoring={result.scoring}
          onRestart={handleRestart}
          onGallery={handleGallery}
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
          <button className="btn-secondary" onClick={handleGallery}>
            Back to QDS flows
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
