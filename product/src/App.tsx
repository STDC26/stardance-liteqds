import { useState, useCallback } from "react";
import { generateLiteQDSPanel, type LiteQDSEnvelope } from "../../src/index";
import { scoreDefinition, type ScoringResult } from "./scoring";
import {
  getAllDefinitions,
  saveDefinition,
  updateDefinition,
  duplicateDefinition,
  deleteDefinition,
} from "./library";
import type { QDSDefinition } from "./types";
import { Landing } from "./screens/Landing";
import { Gallery } from "./screens/Gallery";
import { Builder } from "./screens/Builder";
import { ReadinessReview } from "./screens/ReadinessReview";
import { Intake } from "./screens/Intake";
import { Result } from "./screens/Result";
import { DecisionDesignWorkspace } from "./judo/DecisionDesignWorkspace";

type Screen = "landing" | "gallery" | "builder" | "readiness" | "intake" | "result" | "error" | "decision-design";

interface ResultState {
  envelope: LiteQDSEnvelope;
  scoring: ScoringResult;
}

export function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [editSource, setEditSource] = useState<QDSDefinition | undefined>(undefined);
  const [pendingDef, setPendingDef] = useState<QDSDefinition | null>(null);
  const [activeDef, setActiveDef] = useState<QDSDefinition | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refresh definitions from library on each render
  const definitions = getAllDefinitions();

  // -- Gallery actions --
  function handleSelectDef(def: QDSDefinition) {
    setActiveDef(def);
    setScreen("intake");
  }

  function handleEditDef(def: QDSDefinition) {
    setEditSource(def);
    setScreen("builder");
  }

  function handleDuplicateDef(def: QDSDefinition) {
    duplicateDefinition(def.id);
    // Stay on gallery — it will re-render with the new copy
    setScreen("gallery");
  }

  function handleDeleteDef(def: QDSDefinition) {
    deleteDefinition(def.id);
    setScreen("gallery");
  }

  // -- Builder --
  function handleBuilderSubmit(def: QDSDefinition) {
    setPendingDef(def);
    setScreen("readiness");
  }

  // -- Readiness Review --
  function handleReadinessSave() {
    if (!pendingDef) return;
    if (editSource) {
      updateDefinition(pendingDef);
    } else {
      saveDefinition(pendingDef);
    }
    setEditSource(undefined);
    setPendingDef(null);
    setScreen("gallery");
  }

  function handleReadinessRun() {
    if (!pendingDef) return;
    if (editSource) {
      updateDefinition(pendingDef);
    } else {
      saveDefinition(pendingDef);
    }
    setEditSource(undefined);
    setPendingDef(null);
    setActiveDef(pendingDef);
    setScreen("intake");
  }

  function handleReadinessBack() {
    // Go back to builder with the pending def as edit source
    setEditSource(pendingDef ?? undefined);
    setPendingDef(null);
    setScreen("builder");
  }

  // -- Intake --
  const handleIntakeComplete = useCallback((answers: Record<string, string>) => {
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
  }, [activeDef]);

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
    setEditSource(undefined);
    setPendingDef(null);
    setScreen("gallery");
  }

  function handleHome() {
    setResult(null);
    setError(null);
    setActiveDef(null);
    setEditSource(undefined);
    setPendingDef(null);
    setScreen("landing");
  }

  return (
    <main className="product-root">
      <header className="product-header">
        <button className="product-brand" onClick={handleHome}>QDS Lite</button>
        <span className="product-gov-badge">Experimental Lite surface</span>
      </header>

      {screen === "decision-design" && (
        <DecisionDesignWorkspace onBack={handleHome} />
      )}
      {screen === "landing" && (
        <Landing
          onStart={() => setScreen("builder")}
          onGallery={() => setScreen("gallery")}
          onDecisionDesign={() => setScreen("decision-design")}
        />
      )}
      {screen === "gallery" && (
        <Gallery
          definitions={definitions}
          onSelect={handleSelectDef}
          onEdit={handleEditDef}
          onDuplicate={handleDuplicateDef}
          onDelete={handleDeleteDef}
          onCreate={() => { setEditSource(undefined); setScreen("builder"); }}
        />
      )}
      {screen === "builder" && (
        <Builder
          editSource={editSource}
          onSubmit={handleBuilderSubmit}
          onCancel={handleGallery}
        />
      )}
      {screen === "readiness" && pendingDef && (
        <ReadinessReview
          definition={pendingDef}
          onConfirmSave={handleReadinessSave}
          onConfirmRun={handleReadinessRun}
          onBack={handleReadinessBack}
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
