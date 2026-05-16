// IG-1 PREPARATION — XAS registry provider abstraction.
//
// Vendor-agnostic. IG-1 preparation ships ONLY DryRunRegistryProvider, which
// simulates registration in memory and never connects to a live registry. No
// live provider is implemented — connecting to a live registry is prohibited
// until IG-1 execution is separately authorized.

import {
  ELIGIBLE_HOST_SURFACES,
  FORBIDDEN_HOST_SURFACES,
  type XASComponentRegistration,
} from "../registration/liteqds.registration";

export type RegistryProviderMode = "dry_run" | "live";

export interface RegistryInsertionRequest {
  component: XASComponentRegistration;
  allowed_hosts: string[];
}

export interface RegistryInsertionOutcome {
  status: "registered" | "rejected";
  mode: RegistryProviderMode;
  component_id: string;
  detail: string;
  rejection_code?: "XAS-REG-FORBIDDEN_HOST" | "XAS-REG-INELIGIBLE_HOST";
}

export interface IXASRegistryProvider {
  readonly mode: RegistryProviderMode;
  register(request: RegistryInsertionRequest): RegistryInsertionOutcome;
  isRegistered(componentId: string): boolean;
  listRegistered(): readonly string[];
}

/**
 * Dry-run registry provider. Simulates registration entirely in memory.
 *
 * It performs the same host-eligibility checks a live provider would, so the
 * dry run is representative — but it never opens a connection, never mutates
 * anything outside this object, and produces no live side effect.
 */
export class DryRunRegistryProvider implements IXASRegistryProvider {
  readonly mode = "dry_run" as const;
  private readonly registered = new Set<string>();

  register(request: RegistryInsertionRequest): RegistryInsertionOutcome {
    const componentId = request.component.component_id;

    for (const host of request.allowed_hosts) {
      if ((FORBIDDEN_HOST_SURFACES as readonly string[]).includes(host)) {
        return {
          status: "rejected",
          mode: this.mode,
          component_id: componentId,
          detail: `forbidden host '${host}' in routing config`,
          rejection_code: "XAS-REG-FORBIDDEN_HOST",
        };
      }
      if (!(ELIGIBLE_HOST_SURFACES as readonly string[]).includes(host)) {
        return {
          status: "rejected",
          mode: this.mode,
          component_id: componentId,
          detail: `non-eligible host '${host}' in routing config`,
          rejection_code: "XAS-REG-INELIGIBLE_HOST",
        };
      }
    }

    this.registered.add(componentId);
    return {
      status: "registered",
      mode: this.mode,
      component_id: componentId,
      detail: "dry-run registration simulated — no live registry contacted",
    };
  }

  isRegistered(componentId: string): boolean {
    return this.registered.has(componentId);
  }

  listRegistered(): readonly string[] {
    return [...this.registered];
  }
}
