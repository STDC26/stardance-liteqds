import { describe, expect, it } from "vitest";
import {
  FailClosedFeatureFlagProvider,
  FeatureFlagProviderRegistry,
  LITEQDS_INTERNAL_REVIEW_FLAG,
  LocalFeatureFlagProvider,
  StaticFeatureFlagProvider,
} from "./featureFlagProviders";

describe("swappable feature-flag provider architecture", () => {
  it("StaticFeatureFlagProvider reports unset flags as OFF", () => {
    const provider = new StaticFeatureFlagProvider({
      [LITEQDS_INTERNAL_REVIEW_FLAG]: true,
    });
    expect(provider.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)).toBe(true);
    expect(provider.isEnabled("anything.else")).toBe(false);
  });

  it("FailClosedFeatureFlagProvider reports every flag OFF", () => {
    const provider = new FailClosedFeatureFlagProvider();
    expect(provider.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)).toBe(false);
  });

  it("registry fails closed when no provider is active", () => {
    const registry = new FeatureFlagProviderRegistry();
    registry.registerProvider(
      "static-on",
      new StaticFeatureFlagProvider({ [LITEQDS_INTERNAL_REVIEW_FLAG]: true }),
    );
    // Registered but not activated — still OFF.
    expect(registry.activeProviderName).toBeNull();
    expect(registry.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)).toBe(false);
  });

  it("registry uses the active provider once activated", () => {
    const registry = new FeatureFlagProviderRegistry();
    registry.registerProvider(
      "static-on",
      new StaticFeatureFlagProvider({ [LITEQDS_INTERNAL_REVIEW_FLAG]: true }),
    );
    registry.activate("static-on");
    expect(registry.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)).toBe(true);
  });

  it("registry supports swapping the active provider", () => {
    const registry = new FeatureFlagProviderRegistry();
    registry.registerProvider("local-off", new LocalFeatureFlagProvider());
    registry.registerProvider(
      "static-on",
      new StaticFeatureFlagProvider({ [LITEQDS_INTERNAL_REVIEW_FLAG]: true }),
    );
    registry.activate("static-on");
    expect(registry.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)).toBe(true);
    registry.activate("local-off");
    expect(registry.isEnabled(LITEQDS_INTERNAL_REVIEW_FLAG)).toBe(false);
    expect(registry.registeredProviderNames).toEqual(["local-off", "static-on"]);
  });

  it("registry rejects activation of an unknown provider", () => {
    const registry = new FeatureFlagProviderRegistry();
    expect(() => registry.activate("does-not-exist")).toThrow();
  });
});
