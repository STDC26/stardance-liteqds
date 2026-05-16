import type { Page } from "@playwright/test";

export const FIXTURES = ["qds-learn", "qds-mo", "qds-signal"] as const;
export type FixtureName = (typeof FIXTURES)[number];

export interface OpenOpts {
  fixture?: string;
  variant?: string;
  host?: string;
}

// Navigate the XAS integration harness.
export async function openXAS(page: Page, opts: OpenOpts = {}) {
  const q = new URLSearchParams();
  if (opts.fixture) q.set("fixture", opts.fixture);
  if (opts.variant) q.set("variant", opts.variant);
  if (opts.host) q.set("host", opts.host);
  const qs = q.toString();
  await page.goto(`/${qs ? `?${qs}` : ""}`);
}

export interface XASState {
  outcome: "rendered" | "refused";
  fwireCode: string | null;
  fixture: string;
  variant: string;
  host: string;
  viewportWidth: number;
  adapterRenderTarget: string;
  envelopeFrozen: boolean | null;
  promotionBlocked: boolean | null;
  envelopeOriginal: string | null;
  envelopeRendered: string | null;
}

export async function xasState(page: Page): Promise<XASState> {
  return page.evaluate(() => {
    const w = window as unknown as { __LITEQDS_XAS__: XASState };
    return w.__LITEQDS_XAS__;
  });
}
