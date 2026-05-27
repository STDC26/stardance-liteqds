// ReadinessReview — pre-save/run quality gate. Checks the QDSDefinition
// for structural soundness, signal quality, and governance compliance.

import type { QDSDefinition } from "../types";
import { validateDefinition } from "../types";

interface ReadinessReviewProps {
  definition: QDSDefinition;
  onConfirmSave: () => void;
  onConfirmRun: () => void;
  onBack: () => void;
}

interface Check {
  label: string;
  status: "pass" | "warn" | "fail";
  detail?: string;
}

function runChecks(def: QDSDefinition): Check[] {
  const checks: Check[] = [];

  // 1. Schema validation
  const schemaErr = validateDefinition(def);
  checks.push({
    label: "Schema validation",
    status: schemaErr ? "fail" : "pass",
    detail: schemaErr ?? "All required fields present and valid.",
  });

  // 2. Question count
  const qCount = def.questions.length;
  checks.push({
    label: "Question count",
    status: qCount >= 4 && qCount <= 8 ? "pass" : qCount >= 2 ? "warn" : "fail",
    detail: `${qCount} question${qCount !== 1 ? "s" : ""}. ${qCount < 4 ? "Consider adding more for better signal." : qCount > 8 ? "Consider reducing to avoid fatigue." : "Good range for signal quality."}`,
  });

  // 3. Pathway count
  const pCount = def.pathways.length;
  checks.push({
    label: "Pathway count",
    status: pCount >= 2 && pCount <= 5 ? "pass" : pCount > 5 ? "warn" : "fail",
    detail: `${pCount} pathway${pCount !== 1 ? "s" : ""}. ${pCount < 2 ? "At least two required." : pCount > 5 ? "Many pathways may dilute signal." : "Good."}`,
  });

  // 4. Weight differentiation — check that questions have signal value
  let lowSignalQuestions = 0;
  for (const q of def.questions) {
    const hasContrast = q.answers.some((a) => {
      const vals = Object.values(a.weights);
      return vals.some((v) => v > 0) && (Math.max(...vals) - Math.min(...vals)) > 0;
    });
    if (!hasContrast) lowSignalQuestions++;
  }
  checks.push({
    label: "Signal differentiation",
    status: lowSignalQuestions === 0 ? "pass" : lowSignalQuestions <= 1 ? "warn" : "fail",
    detail: lowSignalQuestions === 0
      ? "All questions have weight contrast across pathways."
      : `${lowSignalQuestions} question${lowSignalQuestions > 1 ? "s" : ""} with no weight differentiation — ${lowSignalQuestions > 1 ? "they add" : "it adds"} no routing signal.`,
  });

  // 5. Answer count per question
  const thinQuestions = def.questions.filter((q) => q.answers.length < 2).length;
  checks.push({
    label: "Answer coverage",
    status: thinQuestions === 0 ? "pass" : "fail",
    detail: thinQuestions === 0
      ? "All questions have at least two answer options."
      : `${thinQuestions} question${thinQuestions > 1 ? "s" : ""} with fewer than two answers.`,
  });

  // 6. Trust limitations
  checks.push({
    label: "Trust limitations",
    status: def.trust.limitations.length >= 2 ? "pass" : def.trust.limitations.length >= 1 ? "warn" : "fail",
    detail: `${def.trust.limitations.length} trust limitation${def.trust.limitations.length !== 1 ? "s" : ""}. ${def.trust.limitations.length < 2 ? "Consider adding more for governance visibility." : "Good coverage."}`,
  });

  // 7. Recourse path
  checks.push({
    label: "Recourse path",
    status: def.trust.recoursePath.length > 10 ? "pass" : "warn",
    detail: def.trust.recoursePath.length > 10
      ? "Recourse path is defined."
      : "Recourse path is very short — ensure respondents know how to escalate.",
  });

  // 8. CTA completeness
  const ctaComplete = def.cta.heading && def.cta.subtitle && def.cta.buttonLabel && def.cta.confirmationMessage;
  checks.push({
    label: "CTA configuration",
    status: ctaComplete ? "pass" : "warn",
    detail: ctaComplete
      ? "All CTA fields are configured."
      : "Some CTA fields are empty — the lead capture may look incomplete.",
  });

  // 9. Human review enforcement (always pass — governance invariant)
  checks.push({
    label: "Human review required",
    status: "pass",
    detail: "Enforced by LiteQDS substrate — cannot be overridden by QDS definitions.",
  });

  return checks;
}

export function ReadinessReview({ definition, onConfirmSave, onConfirmRun, onBack }: ReadinessReviewProps) {
  const checks = runChecks(definition);
  const hasFailures = checks.some((c) => c.status === "fail");
  const hasWarnings = checks.some((c) => c.status === "warn");

  return (
    <div className="readiness">
      <h2 className="readiness-title">Readiness Review</h2>
      <p className="readiness-name">{definition.name}</p>

      <div className="readiness-summary">
        {hasFailures ? (
          <div className="readiness-verdict readiness-verdict-fail">
            This QDS has issues that must be fixed before it can run.
          </div>
        ) : hasWarnings ? (
          <div className="readiness-verdict readiness-verdict-warn">
            This QDS is runnable but has quality suggestions.
          </div>
        ) : (
          <div className="readiness-verdict readiness-verdict-pass">
            This QDS passes all readiness checks.
          </div>
        )}
      </div>

      <div className="readiness-checks">
        {checks.map((check, i) => (
          <div className={`readiness-check readiness-check-${check.status}`} key={i}>
            <div className="readiness-check-header">
              <span className={`readiness-dot readiness-dot-${check.status}`} />
              <span className="readiness-check-label">{check.label}</span>
              <span className={`readiness-status readiness-status-${check.status}`}>
                {check.status === "pass" ? "Pass" : check.status === "warn" ? "Warning" : "Fail"}
              </span>
            </div>
            {check.detail && (
              <p className="readiness-check-detail">{check.detail}</p>
            )}
          </div>
        ))}
      </div>

      <div className="readiness-gov-strip">
        <span className="gov-badge gov-class">Lite experimental</span>
        <span className="gov-badge gov-review">Human review required</span>
      </div>

      <div className="readiness-actions">
        <button className="btn-secondary" onClick={onBack}>Back to editor</button>
        <button
          className="btn-secondary"
          onClick={onConfirmSave}
          disabled={hasFailures}
        >
          Save to library
        </button>
        <button
          className="btn-primary"
          onClick={onConfirmRun}
          disabled={hasFailures}
        >
          Save &amp; run
        </button>
      </div>
    </div>
  );
}
