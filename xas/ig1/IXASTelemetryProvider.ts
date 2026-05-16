// IG-1 PREPARATION — append-only XAS telemetry provider abstraction.
//
// Vendor-agnostic. IG-1 preparation ships ONLY non-outbound providers. No
// provider here opens a network connection — binding a production telemetry
// backend is prohibited until IG-1 execution is separately authorized.

import {
  assertBoundedMetadata,
  type IntegrationEvent,
} from "../integration/integrationTelemetry";

export type TelemetryProviderMode = "dry_run" | "local";

export interface IXASTelemetryProvider {
  readonly mode: TelemetryProviderMode;
  // Must be false for every IG-1-preparation provider — no outbound telemetry.
  readonly outbound: boolean;
  emit(event: IntegrationEvent): void;
  readAll(): readonly IntegrationEvent[];
  readonly count: number;
}

/**
 * In-memory append-only telemetry provider.
 *
 * Append-only: emitted events are pushed and never modified or removed.
 * Non-outbound: events stay in process memory; nothing is sent anywhere.
 * Every event is validated as bounded metadata before it is recorded.
 */
export class InMemoryTelemetryProvider implements IXASTelemetryProvider {
  readonly mode = "dry_run" as const;
  readonly outbound = false as const;
  private readonly events: IntegrationEvent[] = [];

  emit(event: IntegrationEvent): void {
    assertBoundedMetadata(event);
    this.events.push(event);
  }

  readAll(): readonly IntegrationEvent[] {
    return this.events;
  }

  get count(): number {
    return this.events.length;
  }
}
