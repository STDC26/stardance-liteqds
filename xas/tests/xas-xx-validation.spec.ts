import { expect, test } from "@playwright/test";
import { FIXTURES, openXAS, xasState } from "./_helpers";
import {
  FORBIDDEN_HOST_SURFACES,
  LITEQDS_REGISTRATION,
  XASRegistrationError,
  createInMemoryRegistry,
  registerLiteQDSWithXAS,
} from "../registration/liteqds.registration";
import { LiteQDSXASAdapter } from "../adapter/LiteQDSXASAdapter";
import { checkHostEligibility } from "../host/hostEligibility";
import learn from "../../fixtures/qds-learn.json" with { type: "json" };
import mo from "../../fixtures/qds-mo.json" with { type: "json" };
import signal from "../../fixtures/qds-signal.json" with { type: "json" };

const ENVELOPES = { "qds-learn": learn, "qds-mo": mo, "qds-signal": signal };
const ELIGIBLE_HOST = { host_surface: "uxc_activation_surface" };

// Required-field testids the certified renderer must expose for every fixture.
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

test.describe("XAS-XX validation — XAS-01 through XAS-14", () => {
  test("XAS-01 · LiteQDS registers with the XAS registration shape", () => {
    const registry = createInMemoryRegistry();
    const reg = registerLiteQDSWithXAS(registry, {
      allowed_hosts: ["uxc_activation_surface"],
    });
    expect(registry.registered).toContain(reg);
    expect(reg.component_id).toBe("liteqds-panel-v0.1");
    expect(reg.source_chain.certification_tag).toBe("liteqds-g1-recovered-v1");
  });

  test("XAS-02 · registration rejects forbidden host configurations", () => {
    for (const host of FORBIDDEN_HOST_SURFACES) {
      const registry = createInMemoryRegistry();
      expect(() =>
        registerLiteQDSWithXAS(registry, { allowed_hosts: [host] }),
      ).toThrow(XASRegistrationError);
      expect(registry.registered).toHaveLength(0);
    }
  });

  test("XAS-03 · insertion-time host check rejects forbidden hosts", () => {
    const adapter = new LiteQDSXASAdapter();
    for (const host of FORBIDDEN_HOST_SURFACES) {
      expect(checkHostEligibility(host, "insertion_time")).not.toBeNull();
      const result = adapter.insert(learn, { host_surface: host });
      expect(result.status).toBe("refused");
      if (result.status === "refused") {
        expect(result.code).toBe("F-WIRE-06_FORBIDDEN_HOST_SURFACE");
      }
    }
  });

  test("XAS-04 · envelope deep-freeze applied before render handoff", () => {
    const adapter = new LiteQDSXASAdapter();
    const result = adapter.insert(learn, ELIGIBLE_HOST);
    if (result.status !== "ready_to_render") throw new Error("not ready");
    expect(result.envelope_frozen).toBe(true);
    expect(Object.isFrozen(result.frozenEnvelope)).toBe(true);
    expect(Object.isFrozen(result.frozenEnvelope.panel_spec)).toBe(true);
    expect(
      Object.isFrozen(result.frozenEnvelope.insertion_brief),
    ).toBe(true);
  });

  test("XAS-05 · no envelope mutation between receipt and render", async ({
    page,
  }) => {
    // Adapter side: source fixture untouched.
    const adapter = new LiteQDSXASAdapter();
    const before = JSON.stringify(learn);
    adapter.insert(learn, ELIGIBLE_HOST);
    expect(JSON.stringify(learn)).toBe(before);
    // Render side: envelope identical before and after render.
    await openXAS(page, { fixture: "qds-learn" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();
    const state = await xasState(page);
    expect(state.envelopeRendered).toBe(state.envelopeOriginal);
  });

  test("XAS-06 · component renders identical required fields for all fixtures", async ({
    page,
  }) => {
    for (const fixture of FIXTURES) {
      await openXAS(page, { fixture });
      await expect(page.getByTestId("qualification-card")).toBeVisible();
      for (const testid of REQUIRED_FIELD_TESTIDS) {
        await expect(
          page.getByTestId(testid),
          `${fixture} · ${testid}`,
        ).toBeVisible();
      }
    }
  });

  for (const fixture of FIXTURES) {
    test(`XAS-07/08/09/10 · trust signals visible after insertion · ${fixture}`, async ({
      page,
    }) => {
      await openXAS(page, { fixture });
      await expect(page.getByTestId("qualification-card")).toBeVisible();
      // XAS-07
      await expect(page.getByTestId("governance-class-badge")).toBeVisible();
      // XAS-08
      await expect(
        page.getByTestId("runtime-authorization-indicator"),
      ).toHaveAttribute("data-runtime-authorization", "not_authorized");
      // XAS-09
      await expect(page.getByTestId("human-review-required")).toBeVisible();
      // XAS-10
      await expect(
        page.getByTestId("trust-indicator-always-visible"),
      ).toBeVisible();
      const before = await page.getByTestId("trust-limitation-item").count();
      await page.getByTestId("trust-limitation-expand").click();
      expect(await page.getByTestId("trust-limitation-item").count()).toBeGreaterThan(
        before,
      );
    });
  }

  test("XAS-11 · mobile trust limitation hard-lock preserved", async ({
    page,
  }, testInfo) => {
    await openXAS(page, { fixture: "qds-learn" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();
    // Always-visible trust indicator holds at every viewport; the mobile
    // project exercises this assertion under the Pixel 5 viewport.
    await expect(
      page.getByTestId("trust-indicator-always-visible"),
    ).toBeVisible();
    if (testInfo.project.name === "mobile") {
      await expect(page.getByTestId("governance-class-badge")).toBeVisible();
      await expect(
        page.getByTestId("runtime-authorization-indicator"),
      ).toBeVisible();
      await expect(page.getByTestId("human-review-required")).toBeVisible();
    }
  });

  const FWIRE_CASES = [
    { code: "F-WIRE-01_MALFORMED_ENVELOPE", open: { fixture: "qds-learn", variant: "malformed" } },
    { code: "F-WIRE-02_REQUIRED_FIELD_MISSING", open: { fixture: "qds-learn", variant: "missing-field" } },
    { code: "F-WIRE-03_NON_LITE_GOVERNANCE_CLASS", open: { fixture: "qds-learn", variant: "non-lite" } },
    { code: "F-WIRE-05_BAND_RENDERING_VIOLATION", open: { fixture: "qds-mo", variant: "band-violation" } },
    { code: "F-WIRE-06_FORBIDDEN_HOST_SURFACE", open: { fixture: "qds-learn", host: "production_runtime_surface" } },
  ] as const;

  for (const c of FWIRE_CASES) {
    test(`XAS-12 · ${c.code} renders through component-owned refusal surface`, async ({
      page,
    }) => {
      await openXAS(page, c.open);
      const surface = page.getByTestId("fwire-failure-surface");
      await expect(surface).toBeVisible();
      await expect(surface).toHaveAttribute(
        "data-surface-owner",
        "liteqds_component",
      );
      await expect(page.getByTestId("fwire-code")).toHaveText(c.code);
      // No XAS-branded error page wraps the refusal.
      expect(await page.getByTestId("qualification-card").count()).toBe(0);
    });
  }

  test("XAS-12 · F-WIRE-04 viewport-too-small renders through refusal surface", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 280, height: 640 });
    await openXAS(page, { fixture: "qds-learn" });
    const surface = page.getByTestId("fwire-failure-surface");
    await expect(surface).toBeVisible();
    await expect(surface).toHaveAttribute(
      "data-surface-owner",
      "liteqds_component",
    );
    await expect(page.getByTestId("fwire-code")).toHaveText(
      "F-WIRE-04_VIEWPORT_TOO_SMALL",
    );
  });

  test("XAS-13 · no DTO, trace, institutional or numeric confidence emitted", async ({
    page,
  }) => {
    for (const fixture of FIXTURES) {
      await openXAS(page, { fixture });
      await expect(page.getByTestId("qualification-card")).toBeVisible();
      const state = await xasState(page);
      const serialized = (state.envelopeOriginal ?? "").toLowerCase();
      for (const banned of ["dto", "decision_trace", "\"trace\"", "institutional_"]) {
        expect(serialized, `${fixture}`).not.toContain(banned);
      }
      const confidence = (
        await page.getByTestId("directional-confidence").innerText()
      ).toLowerCase();
      expect(confidence).not.toMatch(/[0-9]/);
      for (const word of ["score", "probability", "percent", "institutional"]) {
        expect(confidence).not.toContain(word);
      }
    }
  });

  test("XAS-14 · no Proto promotion or runtime authorization path exists", async ({
    page,
  }) => {
    await openXAS(page, { fixture: "qds-learn" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();
    expect(await page.getByTestId("promote-to-proto").count()).toBe(0);
    const promoteApi = await page.evaluate(
      () =>
        (window as unknown as { XAS_PROMOTE_LITE_TO_PROTO?: unknown })
          .XAS_PROMOTE_LITE_TO_PROTO,
    );
    expect(promoteApi).toBeUndefined();
    const state = await xasState(page);
    expect(state.promotionBlocked).toBe(true);
    // Registration contract itself blocks promotion and authorizes no runtime.
    expect(LITEQDS_REGISTRATION.promotion_to_proto.promotion_blocking_status).toBe(
      true,
    );
    expect(LITEQDS_REGISTRATION.runtime_authorization).toBe("not_authorized");
  });
});
