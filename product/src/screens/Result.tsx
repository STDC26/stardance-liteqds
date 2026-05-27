import { useState } from "react";
import type { LiteQDSEnvelope } from "../../../src/index";
import { QualificationCard } from "../../../harness/src/QualificationCard";
import type { ScoringResult } from "../scoring";
import type { QDSDefinition } from "../types";

interface ResultProps {
  definition: QDSDefinition;
  envelope: LiteQDSEnvelope;
  scoring: ScoringResult;
  onRestart: () => void;
  onGallery: () => void;
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

export function Result({ definition, envelope, scoring, onRestart, onGallery }: ResultProps) {
  const [lead, setLead] = useState({ name: "", email: "", note: "" });
  const [submitted, setSubmitted] = useState(false);

  const cta = definition.cta;
  const vars = { pathway: scoring.pathwayLabel, name: lead.name, email: lead.email };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lead.name.trim() || !lead.email.trim()) return;
    console.log("[QDS Lite Lead Capture]", {
      qdsId: definition.id,
      qdsName: definition.name,
      pathway: scoring.pathwayId,
      pathwayLabel: scoring.pathwayLabel,
      confidence: scoring.confidence,
      scores: scoring.scores,
      lead,
    });
    setSubmitted(true);
  }

  return (
    <div className="result">
      <div className="result-header">
        <h2 className="result-title">Your Qualification Result</h2>
        <p className="result-pathway">
          Directional pathway: <strong>{scoring.pathwayLabel}</strong>
        </p>
        <p className="result-qds-name">{definition.name}</p>
      </div>

      <QualificationCard envelope={envelope} />

      <div className="result-cta-section">
        {!submitted ? (
          <>
            <h3 className="cta-heading">{interpolate(cta.heading, vars)}</h3>
            <p className="cta-subtitle">{interpolate(cta.subtitle, vars)}</p>
            <form className="cta-form" onSubmit={handleSubmit}>
              <input
                className="cta-input"
                type="text"
                placeholder="Your name"
                required
                value={lead.name}
                onChange={(e) => setLead({ ...lead, name: e.target.value })}
              />
              <input
                className="cta-input"
                type="email"
                placeholder="Email address"
                required
                value={lead.email}
                onChange={(e) => setLead({ ...lead, email: e.target.value })}
              />
              <textarea
                className="cta-input cta-textarea"
                placeholder="Anything else you'd like us to know? (optional)"
                value={lead.note}
                onChange={(e) => setLead({ ...lead, note: e.target.value })}
              />
              <button className="btn-primary" type="submit">
                {interpolate(cta.buttonLabel, vars)}
              </button>
            </form>
          </>
        ) : (
          <div className="cta-confirmation">
            <p className="cta-confirmed-text">
              {interpolate(cta.confirmationMessage, { ...vars, name: lead.name, email: lead.email })}
            </p>
          </div>
        )}
      </div>

      <div className="result-actions">
        <button className="btn-secondary" onClick={onRestart}>
          Retake this QDS
        </button>
        <button className="btn-secondary" onClick={onGallery}>
          All QDS flows
        </button>
      </div>
    </div>
  );
}
