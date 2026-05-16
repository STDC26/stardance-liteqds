import type { Page } from "@playwright/test";

export const FIXTURES = ["qds-learn", "qds-mo", "qds-signal"] as const;
export type FixtureName = (typeof FIXTURES)[number];

export interface OpenOpts {
  fixture?: string;
  variant?: string;
  host?: string;
}

// Navigate the harness with URL-driven fixture / variant / host selection.
export async function openHarness(page: Page, opts: OpenOpts = {}) {
  const q = new URLSearchParams();
  if (opts.fixture) q.set("fixture", opts.fixture);
  if (opts.variant) q.set("variant", opts.variant);
  if (opts.host) q.set("host", opts.host);
  const qs = q.toString();
  await page.goto(`/${qs ? `?${qs}` : ""}`);
}

export interface HarnessState {
  outcome: "rendered" | "refused";
  fwireCode: string | null;
  fixture: string;
  variant: string;
  host: string;
  viewportWidth: number;
  envelopeFrozen: boolean | null;
  promotionBlocked: boolean | null;
  envelopeOriginal: string | null;
  envelopeRendered: string | null;
}

// Read the harness-exposed introspection state.
export async function harnessState(page: Page): Promise<HarnessState> {
  return page.evaluate(() => {
    const w = window as unknown as { __LITEQDS__: HarnessState };
    return w.__LITEQDS__;
  });
}
