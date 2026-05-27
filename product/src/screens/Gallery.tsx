import type { QDSDefinition } from "../types";
import { isPreset } from "../library";

interface GalleryProps {
  definitions: QDSDefinition[];
  onSelect: (def: QDSDefinition) => void;
  onEdit: (def: QDSDefinition) => void;
  onDuplicate: (def: QDSDefinition) => void;
  onDelete: (def: QDSDefinition) => void;
  onCreate: () => void;
}

export function Gallery({ definitions, onSelect, onEdit, onDuplicate, onDelete, onCreate }: GalleryProps) {
  return (
    <div className="gallery">
      <div className="gallery-header">
        <h2 className="gallery-title">QDS Flows</h2>
        <button className="btn-primary" onClick={onCreate}>
          + Create new QDS
        </button>
      </div>
      <p className="gallery-subtitle">
        Select a flow to run, or manage your library.
      </p>

      <div className="gallery-grid">
        {definitions.map((def) => {
          const preset = isPreset(def.id);
          return (
            <div className="gallery-card" key={def.id}>
              <button
                className="gallery-card-main"
                onClick={() => onSelect(def)}
              >
                <span className="gallery-card-name">{def.name}</span>
                <span className="gallery-card-meta">
                  {def.questions.length} questions · {def.pathways.length} pathways
                </span>
                <span className="gallery-card-audience">{def.audience}</span>
              </button>
              <div className="gallery-card-actions">
                {preset && <span className="gallery-card-badge">Preset</span>}
                <button
                  className="gallery-action"
                  title="Duplicate"
                  onClick={(e) => { e.stopPropagation(); onDuplicate(def); }}
                >
                  Duplicate
                </button>
                {!preset && (
                  <>
                    <button
                      className="gallery-action"
                      title="Edit"
                      onClick={(e) => { e.stopPropagation(); onEdit(def); }}
                    >
                      Edit
                    </button>
                    <button
                      className="gallery-action gallery-action-danger"
                      title="Delete"
                      onClick={(e) => { e.stopPropagation(); onDelete(def); }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
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
