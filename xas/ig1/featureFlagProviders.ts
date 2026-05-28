// IG-1 PREPARATION — swappable feature-flag provider architecture.
//
// Expands the IG-0 XASFeatureFlagProvider into a swappable architecture: a
// real XAS flag provider can be slotted later by registering + activating it,
// with no change to integration code. No provider here couples to a flag
// vendor. Every path fails closed (default OFF).

import type { XASFeatureFlagProvider } from "../integration/XASFeatureFlagProvider";

export type { XASFeatureFlagProvider };
export { LITEQDS_INTERNAL_REVIEW_FLAG, LocalFeatureFlagProvider } from "../integration/XASFeatureFlagProvider";

/** Immutable provider backed by a fixed flag map. Unset keys are OFF. */
export class StaticFeatureFlagProvider implements XASFeatureFlagProvider {
  constructor(private readonly flags: Readonly<Record<string, boolean>>) {}
  isEnabled(key: string): boolean {
    return this.flags[key] ?? false;
  }
}

/** Provider that reports every flag OFF. The fail-closed default. */
export class FailClosedFeatureFlagProvider implements XASFeatureFlagProvider {
  isEnabled(): boolean {
    return false;
  }
}

/**
 * Swappable flag-provider selector.
 *
 * Named providers are registered; exactly one is active at a time. A live XAS
 * flag provider can be added later via registerProvider/activate without
 * touching integration code. When no provider is active, the registry fails
 * closed — every flag reports OFF.
 */
export class FeatureFlagProviderRegistry implements XASFeatureFlagProvider {
  private readonly providers = new Map<string, XASFeatureFlagProvider>();
  private readonly failClosed = new FailClosedFeatureFlagProvider();
  private activeName: string | null = null;

  registerProvider(name: string, provider: XASFeatureFlagProvider): void {
    this.providers.set(name, provider);
  }

  activate(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`unknown feature-flag provider '${name}'`);
    }
    this.activeName = name;
  }

  get active(): XASFeatureFlagProvider {
    if (this.activeName === null) return this.failClosed;
    return this.providers.get(this.activeName) ?? this.failClosed;
  }

  get activeProviderName(): string | null {
    return this.activeName;
  }

  get registeredProviderNames(): string[] {
    return [...this.providers.keys()];
  }

  isEnabled(key: string): boolean {
    return this.active.isEnabled(key);
  }
}
