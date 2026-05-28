// Node-only file-backed append-only sink for integration telemetry.
//
// Kept separate from integrationTelemetry.ts so that module stays browser-safe.
// v0.1 sink is a local JSONL file; no production backend is connected.

import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { assertBoundedMetadata, type IntegrationEvent } from "./integrationTelemetry";

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
