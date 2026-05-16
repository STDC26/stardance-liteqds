// XAS component registration contract for LiteQDS.
//
// This is additive integration scaffolding. It describes how XAS registers the
// certified LiteQDS component — it does not modify the renderer, generator, or
// fixtures. The certified G1 baseline is referenced, never altered.

import {
  F_WIRE_CODES,
  GOVERNANCE_CLASS,
  RUNTIME_AUTHORIZATION,
  type FWireCode,
  type GovernanceClass,
  type RuntimeAuthorization,
} from "../../src/index";

export const ELIGIBLE_HOST_SURFACES = [
  "uxc_activation_surface",
  "experimental_sandbox",
  "internal_review_surface",
] as const;

export const FORBIDDEN_HOST_SURFACES = [
  "production_runtime_surface",
  "customer_facing_surface",
  "governed_decision_surface",
] as const;

export type EligibleHostSurface = (typeof ELIGIBLE_HOST_SURFACES)[number];

export interface XASComponentRegistration {
  component_id: "liteqds-panel-v0.1";
  component_version: string;
  component_type: "qualification_surface_component";
  governance_class: GovernanceClass;
  runtime_authorization: RuntimeAuthorization;
  human_review_required: true;

  // Pointer to the certified G1 baseline. Identifies provenance — does not
  // re-execute or revalidate it.
  source_chain: {
    repo: "STDC26/stardance-liteqds";
    canonical_baseline_branch: "rebuild/liteqds-g1-recovery-v1";
    certified_commit: "7d19fb9";
    certification_tag: "liteqds-g1-recovered-v1";
    certification_level: "G1-RECOVERED";
    generator_commit: "d1a02fb";
    harness_commit: "6da0111";
    evidence_index_commit: "4575775";
  };

  host_eligibility: {
    eligible_host_surfaces: readonly string[];
    forbidden_host_surfaces: readonly string[];
    enforcement_points: readonly ["xas_registration_time", "insertion_time"];
  };

  trust_signal_contract: {
    governance_class_visible: true;
    runtime_authorization_visible: true;
    human_review_required_visible: true;
    trust_surface_limitations_visible: true;
    mobile_visibility_hard_locked: true;
  };

  failure_handling: {
    f_wire_codes: readonly FWireCode[];
    refusal_surface_owner: "liteqds_component";
    xas_must_not_wrap_in_xas_branded_error_page: true;
  };

  promotion_to_proto: {
    promotion_blocking_status: true;
    required_action: "re_run_through_proto_generator_path";
  };
}

export const LITEQDS_REGISTRATION: XASComponentRegistration = {
  component_id: "liteqds-panel-v0.1",
  component_version: "0.1.0",
  component_type: "qualification_surface_component",
  governance_class: GOVERNANCE_CLASS,
  runtime_authorization: RUNTIME_AUTHORIZATION,
  human_review_required: true,
  source_chain: {
    repo: "STDC26/stardance-liteqds",
    canonical_baseline_branch: "rebuild/liteqds-g1-recovery-v1",
    certified_commit: "7d19fb9",
    certification_tag: "liteqds-g1-recovered-v1",
    certification_level: "G1-RECOVERED",
    generator_commit: "d1a02fb",
    harness_commit: "6da0111",
    evidence_index_commit: "4575775",
  },
  host_eligibility: {
    eligible_host_surfaces: ELIGIBLE_HOST_SURFACES,
    forbidden_host_surfaces: FORBIDDEN_HOST_SURFACES,
    enforcement_points: ["xas_registration_time", "insertion_time"],
  },
  trust_signal_contract: {
    governance_class_visible: true,
    runtime_authorization_visible: true,
    human_review_required_visible: true,
    trust_surface_limitations_visible: true,
    mobile_visibility_hard_locked: true,
  },
  failure_handling: {
    f_wire_codes: F_WIRE_CODES,
    refusal_surface_owner: "liteqds_component",
    xas_must_not_wrap_in_xas_branded_error_page: true,
  },
  promotion_to_proto: {
    promotion_blocking_status: true,
    required_action: "re_run_through_proto_generator_path",
  },
};

export class XASRegistrationError extends Error {
  constructor(
    public readonly code: "XAS-REG-FORBIDDEN_HOST" | "XAS-REG-INELIGIBLE_HOST",
    public readonly detail: string,
  ) {
    super(`${code}: ${detail}`);
    this.name = "XASRegistrationError";
  }
}

export interface XASRoutingConfig {
  allowed_hosts: string[];
}

export interface XASRegistry {
  register(component: XASComponentRegistration): void;
  readonly registered: readonly XASComponentRegistration[];
}

export function createInMemoryRegistry(): XASRegistry {
  const store: XASComponentRegistration[] = [];
  return {
    register: (component) => {
      store.push(component);
    },
    get registered() {
      return store;
    },
  };
}

/**
 * Register LiteQDS with an XAS registry.
 *
 * Registration fails closed if the routing config targets any forbidden host
 * surface, or any surface not on the eligible list — enforced at
 * xas_registration_time before the component is admitted to the registry.
 */
export function registerLiteQDSWithXAS(
  registry: XASRegistry,
  routingConfig: XASRoutingConfig,
): XASComponentRegistration {
  for (const host of routingConfig.allowed_hosts) {
    if ((FORBIDDEN_HOST_SURFACES as readonly string[]).includes(host)) {
      throw new XASRegistrationError(
        "XAS-REG-FORBIDDEN_HOST",
        `routing config includes forbidden host '${host}'; registration aborted`,
      );
    }
    if (!(ELIGIBLE_HOST_SURFACES as readonly string[]).includes(host)) {
      throw new XASRegistrationError(
        "XAS-REG-INELIGIBLE_HOST",
        `routing config includes non-eligible host '${host}'; registration aborted`,
      );
    }
  }
  registry.register(LITEQDS_REGISTRATION);
  return LITEQDS_REGISTRATION;
}
