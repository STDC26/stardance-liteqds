import { useState } from "react";

// Trust-surface limitations. The first limitation is ALWAYS visible without
// expansion (M-01) and is tagged trust-indicator-always-visible. Remaining
// limitations sit behind an expand toggle (AS-11).
export function TrustLimitationPanel({
  limitations,
}: {
  limitations: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [first, ...rest] = limitations;

  return (
    <section className="trust-panel" data-testid="trust-limitation-panel">
      <h3 className="trust-heading">Trust surface limitations</h3>

      {first !== undefined && (
        <p
          className="trust-item trust-item-always"
          data-testid="trust-indicator-always-visible"
        >
          <span data-testid="trust-limitation-item">{first}</span>
        </p>
      )}

      {rest.length > 0 && (
        <>
          <button
            type="button"
            className="trust-expand"
            data-testid="trust-limitation-expand"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded
              ? "Hide additional limitations"
              : `Show ${rest.length} more limitation${rest.length > 1 ? "s" : ""}`}
          </button>
          {expanded && (
            <ul className="trust-list" data-testid="trust-limitation-rest">
              {rest.map((item, i) => (
                <li
                  className="trust-item"
                  data-testid="trust-limitation-item"
                  key={i}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
