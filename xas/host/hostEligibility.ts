// Host eligibility enforcement for the XAS integration boundary.
//
// Dual enforcement: the same check runs at xas_registration_time and at
// insertion_time. A rejection always carries F-WIRE-06 so it routes through
// the component's own F-WIRE-06 refusal surface — never an XAS error page.

import {
  ELIGIBLE_HOST_SURFACES,
  FORBIDDEN_HOST_SURFACES,
} from "../registration/liteqds.registration";

export type HostEnforcementPoint = "xas_registration_time" | "insertion_time";

export interface HostEligibilityFailure {
  code: "F-WIRE-06_FORBIDDEN_HOST_SURFACE";
  enforcement_point: HostEnforcementPoint;
  rejected_host: string;
  detail: string;
  eligible_alternatives: readonly string[];
}

/**
 * Check a host surface. Returns null when the host is eligible, or a
 * HostEligibilityFailure (F-WIRE-06) when it is forbidden or not on the
 * eligible list. Fails closed: anything not explicitly eligible is rejected.
 */
export function checkHostEligibility(
  host: string,
  enforcement_point: HostEnforcementPoint,
): HostEligibilityFailure | null {
  if ((FORBIDDEN_HOST_SURFACES as readonly string[]).includes(host)) {
    return {
      code: "F-WIRE-06_FORBIDDEN_HOST_SURFACE",
      enforcement_point,
      rejected_host: host,
      detail: `'${host}' is an explicitly forbidden host surface`,
      eligible_alternatives: ELIGIBLE_HOST_SURFACES,
    };
  }
  if (!(ELIGIBLE_HOST_SURFACES as readonly string[]).includes(host)) {
    return {
      code: "F-WIRE-06_FORBIDDEN_HOST_SURFACE",
      enforcement_point,
      rejected_host: host,
      detail: `'${host}' is not an eligible host surface`,
      eligible_alternatives: ELIGIBLE_HOST_SURFACES,
    };
  }
  return null;
}

export function isHostEligible(host: string): boolean {
  return checkHostEligibility(host, "insertion_time") === null;
}
