import type { QDSDefinition } from "../types";

interface GalleryProps {
  definitions: QDSDefinition[];
  onSelect: (def: QDSDefinition) => void;
  onCreate: () => void;
}

export function Gallery({ definitions, onSelect, onCreate }: GalleryProps) {
  return (
    <div className="gallery">
      <div className="gallery-header">
        <h2 className="gallery-title">QDS Flows</h2>
        <button className="btn-primary" onClick={onCreate}>
          + Create new QDS
        </button>
      </div>
      <p className="gallery-subtitle">
        Select a qualification flow to preview, or create a new one.
      </p>

      <div className="gallery-grid">
        {definitions.map((def) => (
          <button
            key={def.id}
            className="gallery-card"
            onClick={() => onSelect(def)}
          >
            <span className="gallery-card-name">{def.name}</span>
            <span className="gallery-card-meta">
              {def.questions.length} questions · {def.pathways.length} pathways
            </span>
            <span className="gallery-card-audience">{def.audience}</span>
            {def.id.startsWith("preset-") && (
              <span className="gallery-card-badge">Preset</span>
            )}
          </button>
        ))}
      </div>

      <div className="gallery-trust">
        <p>
          All QDS flows enforce Lite governance: human review required, no
          runtime authorization, directional reads only.
        </p>
      </div>
    </div>
  );
}
