// Append-only integration telemetry for XAS controlled integration.
//
// Records bounded metadata about LiteQDS mount events on the internal review
// surface. It must NEVER persist payload content, DTOs, traces, subject-level
// data, or confidence semantics. The guard enforces this by construction.
//
// v0.1 sink: a local append-only JSONL file (xas/evidence/integration-events.jsonl).
// No production telemetry backend is connected until the XAS owner confirms one.

import { appendFileSync, existsSync, readFileSync } from "node:fs";

export const LITEQDS_COMPONENT_ID = "liteqds-panel-v0.1";
// Placeholder reviewer group — real reviewer identities are supplied by DRJ.
export const REVIEWER_GROUP_PLACEHOLDER = "liteqds_internal_review_alpha";

export interface IntegrationEvent {
  event_id: string;
  event_type: string;
  host_surface: string;
  flag_state: "on" | "off";
  component_id: string;
  reviewer_group: string;
  fixture_ref: string;
  outcome: string;
  fwire_code?: string;
  emitted_at: string;
}

// The complete allow-list. Any field outside this set is rejected.
export const ALLOWED_EVENT_FIELDS = [
  "event_id",
  "event_type",
  "host_surface",
  "flag_state",
  "component_id",
  "reviewer_group",
  "fixture_ref",
  "outcome",
  "fwire_code",
  "emitted_at",
] as const;

// Defense in depth — payload/decision vocabulary is rejected even if it were
// somehow allow-listed.
const FORBIDDEN_EVENT_FIELD_PATTERNS = [
  /dto/i,
  /decision_trace/i,
  /^trace$/i,
  /payload/i,
  /panel_title/i,
  /subject/i,
  /institutional/i,
  /confidence/i,
  /verdict/i,
];

export class IntegrationTelemetryViolation extends Error {
  constructor(public readonly forbidden_field: string) {
    super(
      `INTEGRATION-TELEMETRY VIOLATION: field '${forbidden_field}' is not a ` +
        `permitted bounded-metadata field. Allowed: ${ALLOWED_EVENT_FIELDS.join(", ")}.`,
    );
    this.name = "IntegrationTelemetryViolation";
  }
}

function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export interface IntegrationEventInput {
  event_type: string;
  host_surface: string;
  flag_state: "on" | "off";
  fixture_ref: string;
  outcome: string;
  fwire_code?: string;
  emitted_at?: string;
}

// Build a bounded-metadata event. component_id and reviewer_group are fixed;
// event_id is a deterministic content hash.
export function buildIntegrationEvent(
  input: IntegrationEventInput,
): IntegrationEvent {
  const emitted_at = input.emitted_at ?? new Date().toISOString();
  const event_id = `xas-int-${fnv1a(
    [input.event_type, input.host_surface, input.fixture_ref, input.outcome, emitted_at].join(
      "|",
    ),
  )}`;
  const event: IntegrationEvent = {
    event_id,
    event_type: input.event_type,
    host_surface: input.host_surface,
    flag_state: input.flag_state,
    component_id: LITEQDS_COMPONENT_ID,
    reviewer_group: REVIEWER_GROUP_PLACEHOLDER,
    fixture_ref: input.fixture_ref,
    outcome: input.outcome,
    ...(input.fwire_code ? { fwire_code: input.fwire_code } : {}),
    emitted_at,
  };
  assertBoundedMetadata(event);
  return event;
}

// Throws IntegrationTelemetryViolation if the record carries any field outside
// the allow-list, any forbidden-pattern key, or any non-string value.
export function assertBoundedMetadata(record: Record<string, unknown>): void {
  for (const key of Object.keys(record)) {
    if (!(ALLOWED_EVENT_FIELDS as readonly string[]).includes(key)) {
      throw new IntegrationTelemetryViolation(key);
    }
    for (const pattern of FORBIDDEN_EVENT_FIELD_PATTERNS) {
      if (pattern.test(key)) {
        throw new IntegrationTelemetryViolation(key);
      }
    }
    if (typeof record[key] !== "string") {
      throw new IntegrationTelemetryViolation(
        `${key} (non-string value forbidden in telemetry)`,
      );
    }
  }
}

export function isBoundedMetadataEvent(record: Record<string, unknown>): boolean {
  try {
    assertBoundedMetadata(record);
    return true;
  } catch {
    return false;
  }
}

// Append one event to the JSONL sink. Append-only: existing lines are never
// read-modified or deleted.
export function appendIntegrationEvent(
  sinkPath: string,
  event: IntegrationEvent,
): void {
  assertBoundedMetadata(event);
  appendFileSync(sinkPath, JSON.stringify(event) + "\n", "utf8");
}

export function readIntegrationEvents(sinkPath: string): IntegrationEvent[] {
  if (!existsSync(sinkPath)) return [];
  return readFileSync(sinkPath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as IntegrationEvent);
}
