import { describe, expect, it } from "vitest";
import {
  LITEQDS_INTERNAL_REVIEW_FLAG,
  LocalFeatureFlagProvider,
  flagProviderFromQuery,
} from "./XASFeatureFlagProvider";

describe("XAS feature flag provider", () => {
  it("defaults every unset flag to OFF (fails closed)", () => {
    const provider = new LocalFeatureFlagProvider();
    expect(provider.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)).toBe(false);
    expect(provider.isEnabled("any.other.key")).toBe(false);
  });

  it("reports a flag as enabled only when explicitly set ON", () => {
    const provider = new LocalFeatureFlagProvider({
      [LITEQDS_INTERNAL_REVIEW_FLAG]: true,
    });
    expect(provider.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)).toBe(true);
    provider.set(LITEQDS_INTERNAL_REVIEW_FLAG, false);
    expect(provider.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)).toBe(false);
  });

  it("derives an OFF provider from an empty query string", () => {
    expect(
      flagProviderFromQuery("").isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG),
    ).toBe(false);
  });

  it("derives an ON provider only from ?flag=on", () => {
    expect(
      flagProviderFromQuery("?flag=on").isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG),
    ).toBe(true);
    expect(
      flagProviderFromQuery("?flag=yes").isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG),
    ).toBe(false);
  });
});
