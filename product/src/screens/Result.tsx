import { useState } from "react";
import type { LiteQDSEnvelope } from "../../../src/index";
import { QualificationCard } from "../../../harness/src/QualificationCard";
import type { ScoringResult } from "../scoring";

interface ResultProps {
  envelope: LiteQDSEnvelope;
  scoring: ScoringResult;
  onRestart: () => void;
}

const PATHWAY_CTA: Record<string, { team: string; action: string }> = {
  SD: { team: "Stardance", action: "Talk to the Stardance team" },
  DO: { team: "Docente", action: "Talk to the Docente team" },
  VMG: { team: "VMG", action: "Talk to the VMG team" },
};

export function Result({ envelope, scoring, onRestart }: ResultProps) {
  const [lead, setLead] = useState({ name: "", email: "", note: "" });
  const [submitted, setSubmitted] = useState(false);

  const cta = PATHWAY_CTA[scoring.pathway] ?? PATHWAY_CTA.SD;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lead.name.trim() || !lead.email.trim()) return;
    // In a real deployment this would POST to an API.
    // For the MVP we log to console and show confirmation.
    console.log("[QDS Lite Lead Capture]", {
      pathway: scoring.pathway,
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
          Directional pathway: <strong>{cta.team}</strong>
        </p>
      </div>

      <QualificationCard envelope={envelope} />

      <div className="result-cta-section">
        {!submitted ? (
          <>
            <h3 className="cta-heading">Ready to connect?</h3>
            <p className="cta-subtitle">
              Leave your details and the {cta.team} team will follow up.
            </p>
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
                {cta.action}
              </button>
            </form>
          </>
        ) : (
          <div className="cta-confirmation">
            <p className="cta-confirmed-text">
              Thank you, {lead.name}. The {cta.team} team will be in touch at{" "}
              <strong>{lead.email}</strong>.
            </p>
          </div>
        )}
      </div>

      <button className="btn-secondary result-restart" onClick={onRestart}>
        Start over
      </button>
    </div>
  );
}
