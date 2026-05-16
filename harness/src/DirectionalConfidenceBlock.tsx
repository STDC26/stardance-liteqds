import {
  DIRECTIONAL_CONFIDENCE_LABEL,
  type DirectionalConfidence,
} from "../../src/index";

// Directional confidence only. Renders a word-label — never a number, never
// institutional-confidence vocabulary (no score / probability / percentage).
export function DirectionalConfidenceBlock({
  confidence,
}: {
  confidence: DirectionalConfidence;
}) {
  return (
    <div className="confidence-block" data-testid="directional-confidence">
      <span className="confidence-caption">Directional read</span>
      <span
        className="confidence-label"
        data-testid="directional-confidence-label"
        data-confidence-key={confidence}
      >
        {DIRECTIONAL_CONFIDENCE_LABEL[confidence]}
      </span>
    </div>
  );
}
