// Feature flag abstraction for XAS controlled integration.
//
// Vendor-agnostic: integration code depends only on the XASFeatureFlagProvider
// interface, never on a flag vendor SDK. v0.1 ships LocalFeatureFlagProvider
// (in-memory). When the XAS flag system is confirmed, a new implementation of
// this interface is added — no integration code changes.

export const LITEQDS_INTERNAL_REVIEW_FLAG = "xas.liteqds.internal_review.enabled";

export interface XASFeatureFlagProvider {
  isEnabled(key: string): boolean;
}

/**
 * Local, in-memory flag provider. Fails closed: any key not explicitly set is
 * reported as disabled (default OFF).
 */
export class LocalFeatureFlagProvider implements XASFeatureFlagProvider {
  private readonly flags: Map<string, boolean>;

  constructor(initial: Record<string, boolean> = {}) {
    this.flags = new Map(Object.entries(initial));
  }

  isEnabled(key: string): boolean {
    return this.flags.get(key) ?? false;
  }

  set(key: string, value: boolean): void {
    this.flags.set(key, value);
  }
}

// Read the LiteQDS internal-review flag from a URL query string. Used by the
// staging-equivalent surface harness. Default OFF — only an explicit
// `?flag=on` enables it.
export function flagProviderFromQuery(search: string): LocalFeatureFlagProvider {
  const on = new URLSearchParams(search).get("flag") === "on";
  return new LocalFeatureFlagProvider({ [LITEQDS_INTERNAL_REVIEW_FLAG]: on });
}
