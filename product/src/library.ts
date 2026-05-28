// QDS Library — localStorage-backed CRUD for QDSDefinitions.
// Presets are read-only and always present. Custom definitions are
// persisted to localStorage and support save, edit, duplicate, delete.

import type { QDSDefinition } from "./types";
import { PRESETS } from "./presets";

const STORAGE_KEY = "qds-lite-library";

/** Load custom definitions from localStorage. */
function loadCustom(): QDSDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QDSDefinition[];
  } catch {
    return [];
  }
}

/** Persist custom definitions to localStorage. */
function saveCustom(defs: QDSDefinition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defs));
}

/** Get all definitions: presets (read-only) + custom. */
export function getAllDefinitions(): QDSDefinition[] {
  return [...PRESETS, ...loadCustom()];
}

/** Get only custom (user-created) definitions. */
export function getCustomDefinitions(): QDSDefinition[] {
  return loadCustom();
}

/** Save a new custom definition. Returns the saved def. */
export function saveDefinition(def: QDSDefinition): QDSDefinition {
  const custom = loadCustom();
  // Ensure unique ID
  const existing = custom.findIndex((d) => d.id === def.id);
  if (existing >= 0) {
    custom[existing] = def;
  } else {
    custom.push(def);
  }
  saveCustom(custom);
  return def;
}

/** Update an existing custom definition by ID. */
export function updateDefinition(def: QDSDefinition): QDSDefinition | null {
  const custom = loadCustom();
  const idx = custom.findIndex((d) => d.id === def.id);
  if (idx < 0) return null;
  custom[idx] = { ...def, createdAt: custom[idx].createdAt };
  saveCustom(custom);
  return custom[idx];
}

/** Duplicate a definition (preset or custom). Returns the new copy. */
export function duplicateDefinition(sourceId: string): QDSDefinition | null {
  const all = getAllDefinitions();
  const source = all.find((d) => d.id === sourceId);
  if (!source) return null;

  const copy: QDSDefinition = {
    ...structuredClone(source),
    id: `custom-${Date.now()}`,
    name: `${source.name} (copy)`,
    createdAt: new Date().toISOString(),
  };

  const custom = loadCustom();
  custom.push(copy);
  saveCustom(custom);
  return copy;
}

/** Delete a custom definition. Returns true if found and deleted. */
export function deleteDefinition(id: string): boolean {
  // Never delete presets
  if (PRESETS.some((p) => p.id === id)) return false;
  const custom = loadCustom();
  const filtered = custom.filter((d) => d.id !== id);
  if (filtered.length === custom.length) return false;
  saveCustom(filtered);
  return true;
}

/** Check if a definition is a preset (read-only). */
export function isPreset(id: string): boolean {
  return PRESETS.some((p) => p.id === id);
}
