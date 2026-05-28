import { describe, expect, it } from "vitest";
import {
  ELIGIBLE_HOST_SURFACES,
  FORBIDDEN_HOST_SURFACES,
} from "../registration/liteqds.registration";
import {
  checkHostEligibility,
  isHostEligible,
  type HostEnforcementPoint,
} from "./hostEligibility";

const POINTS: HostEnforcementPoint[] = [
  "xas_registration_time",
  "insertion_time",
];

describe("XAS host eligibility enforcement", () => {
  it("passes every eligible host at both enforcement points", () => {
    for (const point of POINTS) {
      for (const host of ELIGIBLE_HOST_SURFACES) {
        expect(checkHostEligibility(host, point)).toBeNull();
        expect(isHostEligible(host)).toBe(true);
      }
    }
  });

  it("fails closed on every forbidden host at both enforcement points", () => {
    for (const point of POINTS) {
      for (const host of FORBIDDEN_HOST_SURFACES) {
        const failure = checkHostEligibility(host, point);
        expect(failure).not.toBeNull();
        expect(failure!.code).toBe("F-WIRE-06_FORBIDDEN_HOST_SURFACE");
        expect(failure!.enforcement_point).toBe(point);
        expect(failure!.rejected_host).toBe(host);
        expect(isHostEligible(host)).toBe(false);
      }
    }
  });

  it("fails closed on an unknown (non-eligible) host", () => {
    const failure = checkHostEligibility("some_unlisted_surface", "insertion_time");
    expect(failure).not.toBeNull();
    expect(failure!.code).toBe("F-WIRE-06_FORBIDDEN_HOST_SURFACE");
    expect(isHostEligible("some_unlisted_surface")).toBe(false);
  });

  it("offers eligible alternatives on rejection", () => {
    const failure = checkHostEligibility(
      "production_runtime_surface",
      "insertion_time",
    );
    expect(failure!.eligible_alternatives).toEqual(ELIGIBLE_HOST_SURFACES);
  });
});
