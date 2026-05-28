import { expect, test } from "@playwright/test";
import { execSync } from "node:child_process";
import {
  FORBIDDEN_HOST_SURFACES,
  XASRegistrationError,
  createInMemoryRegistry,
  registerLiteQDSWithXAS,
} from "../registration/liteqds.registration";
import { LiteQDSXASAdapter } from "../adapter/LiteQDSXASAdapter";
import { isBoundedMetadataEvent } from "../integration/integrationTelemetry";

// XAS-INT-01..12 — post-integration validation suite, IG-0 staging-equivalent.
// Runs against the internal_review_surface harness (xas/integration-harness).

const FIXTURES = ["qds-learn", "qds-mo", "qds-signal"] as const;
const SHOTS = "xas/evidence/integration/screenshots";

const REQUIRED_FIELD_TESTIDS = [
  "panel-title",
  "panel-subject-label",
  "qualification-type-label",
  "verdict-options",
  "directional-confidence",
  "governance-class-badge",
  "runtime-authorization-indicator",
  "human-review-required",
  "trust-indicator-always-visible",
  "recourse-path",
];

interface IRSOpts {
  flag?: "on" | "off";
  fixture?: string;
  variant?: string;
}

async function openIRS(
  page: import("@playwright/test").Page,
  opts: IRSOpts = {},
) {
  const q = new URLSearchParams();
  if (opts.flag === "on") q.set("flag", "on");
  if (opts.fixture) q.set("fixture", opts.fixture);
  if (opts.variant) q.set("variant", opts.variant);
  const qs = q.toString();
  await page.goto(`/${qs ? `?${qs}` : ""}`);
}

async function intState(page: import("@playwright/test").Page) {
  return page.evaluate(
    () => (window as unknown as { __XAS_INT__: Record<string, unknown> }).__XAS_INT__,
  );
}

test.describe("XAS-INT — IG-0 post-integration validation", () => {
  test("XAS-INT-01 · flag OFF → LiteQDS panel not mounted, not reachable", async ({
    page,
  }) => {
    await openIRS(page, {});
    await expect(
      page.getByTestId("internal-review-surface-empty"),
    ).toBeVisible();
    expect(await page.getByTestId("qualification-card").count()).toBe(0);
    const state = await intState(page);
    expect(state.flagState).toBe("off");
    expect(state.mounted).toBe(false);
    expect(state.outcome).toBe("not_mounted");
  });

  test("XAS-INT-02 · flag ON → panel mounts in internal_review_surface", async ({
    page,
  }) => {
    await openIRS(page, { flag: "on" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();
    const state = await intState(page);
    expect(state.flagState).toBe("on");
    expect(state.mounted).toBe(true);
    expect(state.outcome).toBe("rendered");
    expect(state.hostSurface).toBe("internal_review_surface");
  });

  test("XAS-INT-03 · XAS-validated required fields render on the live mount", async ({
    page,
  }) => {
    for (const fixture of FIXTURES) {
      await openIRS(page, { flag: "on", fixture });
      await expect(page.getByTestId("qualification-card")).toBeVisible();
      for (const testid of REQUIRED_FIELD_TESTIDS) {
        await expect(
          page.getByTestId(testid),
          `${fixture} · ${testid}`,
        ).toBeVisible();
      }
    }
  });

  test("XAS-INT-04 · all trust signals visible in the operator context", async ({
    page,
  }) => {
    for (const fixture of FIXTURES) {
      await openIRS(page, { flag: "on", fixture });
      await expect(page.getByTestId("governance-class-badge")).toBeVisible();
      await expect(
        page.getByTestId("runtime-authorization-indicator"),
      ).toBeVisible();
      await expect(page.getByTestId("human-review-required")).toBeVisible();
      await expect(
        page.getByTestId("trust-indicator-always-visible"),
      ).toBeVisible();
      await expect(page.getByTestId("recourse-path")).toBeVisible();
    }
  });

  test("XAS-INT-05 · mobile trust hard-lock holds on the live surface", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-project-only");
    await openIRS(page, { flag: "on" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();
    await expect(
      page.getByTestId("trust-indicator-always-visible"),
    ).toBeVisible();
    await expect(page.getByTestId("governance-class-badge")).toBeVisible();
    await expect(
      page.getByTestId("runtime-authorization-indicator"),
    ).toBeVisible();
    await expect(page.getByTestId("human-review-required")).toBeVisible();
  });

  const FWIRE_HARNESS_CASES = [
    { code: "F-WIRE-01_MALFORMED_ENVELOPE", open: { flag: "on", variant: "malformed" } },
    { code: "F-WIRE-02_REQUIRED_FIELD_MISSING", open: { flag: "on", variant: "missing-field" } },
    { code: "F-WIRE-03_NON_LITE_GOVERNANCE_CLASS", open: { flag: "on", variant: "non-lite" } },
    { code: "F-WIRE-05_BAND_RENDERING_VIOLATION", open: { flag: "on", fixture: "qds-mo", variant: "band-violation" } },
  ] as const;

  for (const c of FWIRE_HARNESS_CASES) {
    test(`XAS-INT-06 · ${c.code} renders through the component-owned surface`, async ({
      page,
    }) => {
      await openIRS(page, c.open);
      const surface = page.getByTestId("fwire-failure-surface");
      await expect(surface).toBeVisible();
      await expect(surface).toHaveAttribute(
        "data-surface-owner",
        "liteqds_component",
      );
      await expect(page.getByTestId("fwire-code")).toHaveText(c.code);
    });
  }

  test("XAS-INT-06 · F-WIRE-04 viewport renders through the component surface", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 280, height: 640 });
    await openIRS(page, { flag: "on" });
    await expect(page.getByTestId("fwire-failure-surface")).toHaveAttribute(
      "data-surface-owner",
      "liteqds_component",
    );
    await expect(page.getByTestId("fwire-code")).toHaveText(
      "F-WIRE-04_VIEWPORT_TOO_SMALL",
    );
  });

  test("XAS-INT-06 · F-WIRE-06 (forbidden host) is component-owned via the adapter", () => {
    // internal_review_surface is eligible, so F-WIRE-06 is structurally not
    // reachable on this surface. The adapter still produces a component-owned
    // F-WIRE-06 for a forbidden host — verified directly.
    const adapter = new LiteQDSXASAdapter();
    const result = adapter.insert(
      { panel_spec: {}, insertion_brief: {} },
      { host_surface: "production_runtime_surface" },
    );
    expect(result.status).toBe("refused");
    if (result.status === "refused") {
      expect(result.render_target).toBe("FWireFailureSurface");
    }
  });

  test("XAS-INT-07 · forbidden host surfaces rejected from the registry", () => {
    for (const host of FORBIDDEN_HOST_SURFACES) {
      const registry = createInMemoryRegistry();
      expect(() =>
        registerLiteQDSWithXAS(registry, { allowed_hosts: [host] }),
      ).toThrow(XASRegistrationError);
    }
  });

  test("XAS-INT-08 · runtime_authorization renders not_authorized on the live mount", async ({
    page,
  }) => {
    await openIRS(page, { flag: "on" });
    await expect(
      page.getByTestId("runtime-authorization-indicator"),
    ).toHaveAttribute("data-runtime-authorization", "not_authorized");
    const state = await intState(page);
    expect(state.runtimeAuthorization).toBe("not_authorized");
  });

  test("XAS-INT-09 · no Proto promotion or runtime path reachable", async ({
    page,
  }) => {
    await openIRS(page, { flag: "on" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();
    expect(await page.getByTestId("promote-to-proto").count()).toBe(0);
    const promoteApi = await page.evaluate(
      () =>
        (window as unknown as { XAS_PROMOTE_LITE_TO_PROTO?: unknown })
          .XAS_PROMOTE_LITE_TO_PROTO,
    );
    expect(promoteApi).toBeUndefined();
    expect((await intState(page)).promotionBlocked).toBe(true);
  });

  test("XAS-INT-10 · telemetry is append-only and metadata-bounded", async ({
    page,
  }) => {
    await openIRS(page, { flag: "on" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();
    const events = await page.evaluate(
      () =>
        (window as unknown as { __XAS_INT_EVENTS__: Record<string, unknown>[] })
          .__XAS_INT_EVENTS__,
    );
    expect(events.length).toBeGreaterThan(0);
    for (const event of events) {
      // Bounded metadata only — no payload / DTO / trace fields.
      expect(isBoundedMetadataEvent(event)).toBe(true);
      expect(JSON.stringify(event).toLowerCase()).not.toContain("panel_title");
      expect(JSON.stringify(event).toLowerCase()).not.toContain("dto");
    }
  });

  test("XAS-INT-11 · rollback drill — single flag toggle detaches the panel", async ({
    page,
  }) => {
    // Flag ON: panel mounted.
    await openIRS(page, { flag: "on" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();
    // Single-step detach: flag OFF → panel unmounts, surface is empty.
    await openIRS(page, {});
    await expect(
      page.getByTestId("internal-review-surface-empty"),
    ).toBeVisible();
    expect(await page.getByTestId("qualification-card").count()).toBe(0);
    expect(await page.getByTestId("fwire-failure-surface").count()).toBe(0);
  });

  test("XAS-INT-12 · certified baseline files unchanged vs 7d19fb9", () => {
    // src/, fixtures/, harness/src/ must be byte-identical to the baseline.
    expect(() =>
      execSync("git diff --quiet 7d19fb9 -- src fixtures harness/src", {
        stdio: "pipe",
      }),
    ).not.toThrow();
  });
});

test.describe("XAS-INT evidence capture", () => {
  test("ig-0 evidence · flag-off empty surface", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only capture");
    await openIRS(page, {});
    await expect(
      page.getByTestId("internal-review-surface-empty"),
    ).toBeVisible();
    await page.getByTestId("internal-review-surface").screenshot({
      path: `${SHOTS}/flag-off-empty.desktop.png`,
    });
  });

  for (const fixture of FIXTURES) {
    test(`ig-0 evidence · flag-on render · ${fixture}`, async ({
      page,
    }, testInfo) => {
      await openIRS(page, { flag: "on", fixture });
      await expect(page.getByTestId("qualification-card")).toBeVisible();
      await page.getByTestId("internal-review-surface").screenshot({
        path: `${SHOTS}/${fixture}.flag-on.${testInfo.project.name}.png`,
      });
    });
  }
});
