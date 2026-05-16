import { expect, test } from "@playwright/test";
import { FIXTURES, harnessState, openHarness } from "./_helpers";

// FB-xx — forbidden-behavior checks. The directive enumerates FB-01/02/03/06/
// 07/08/10; each is interpreted against the LiteQDS prohibited-scope rules and
// documented inline. UT-01 covers payload immutability.
test.describe("FB — forbidden behavior", () => {
  test("FB-01 · no DTO or decision-trace artifact in the envelope", async ({
    page,
  }) => {
    await openHarness(page, { fixture: "qds-learn" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();
    const state = await harnessState(page);
    const serialized = (state.envelopeOriginal ?? "").toLowerCase();
    for (const banned of ["dto", "decision_trace", "\"trace\""]) {
      expect(serialized).not.toContain(banned);
    }
  });

  test("FB-02 · no institutional-confidence semantics in the read", async ({
    page,
  }) => {
    await openHarness(page, { fixture: "qds-mo" });
    const text = (
      await page.getByTestId("directional-confidence").innerText()
    ).toLowerCase();
    for (const word of ["institutional", "confidence score", "certainty"]) {
      expect(text).not.toContain(word);
    }
  });

  test("FB-03 · no numeric confidence value rendered", async ({ page }) => {
    await openHarness(page, { fixture: "qds-signal" });
    const text = await page
      .getByTestId("directional-confidence")
      .innerText();
    expect(text).not.toMatch(/[0-9]/);
  });

  test("FB-06 · forbidden host surface is refused, not silently rendered", async ({
    page,
  }) => {
    for (const host of [
      "production_runtime_surface",
      "customer_facing_surface",
      "governed_decision_surface",
    ]) {
      await openHarness(page, { fixture: "qds-learn", host });
      const state = await harnessState(page);
      expect(state.outcome).toBe("refused");
      expect(state.fwireCode).toBe("F-WIRE-06_FORBIDDEN_HOST_SURFACE");
    }
  });

  test("FB-07 · no auto-promotion to Proto", async ({ page }) => {
    await openHarness(page, { fixture: "qds-learn" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();
    expect(await page.getByTestId("promote-to-proto").count()).toBe(0);
    const api = await page.evaluate(
      () =>
        (window as unknown as { XAS_PROMOTE_LITE_TO_PROTO?: unknown })
          .XAS_PROMOTE_LITE_TO_PROTO,
    );
    expect(api).toBeUndefined();
    expect((await harnessState(page)).promotionBlocked).toBe(true);
  });

  test("FB-08 · runtime_authorization is never authorized", async ({ page }) => {
    for (const fixture of FIXTURES) {
      await openHarness(page, { fixture });
      const indicator = page.getByTestId("runtime-authorization-indicator");
      await expect(indicator).toHaveAttribute(
        "data-runtime-authorization",
        "not_authorized",
      );
      const state = await harnessState(page);
      expect(state.envelopeOriginal).toContain("\"not_authorized\"");
      expect(state.envelopeOriginal).not.toContain("\"authorized\"");
    }
  });

  test("FB-10 · F-WIRE refusal is component-owned, not host-branded", async ({
    page,
  }) => {
    await openHarness(page, { fixture: "qds-learn", variant: "malformed" });
    const surface = page.getByTestId("fwire-failure-surface");
    await expect(surface).toBeVisible();
    // The refusal surface declares the component as its owner.
    await expect(surface).toHaveAttribute(
      "data-surface-owner",
      "liteqds_component",
    );
  });
});

test.describe("UT — immutability", () => {
  test("UT-01 · envelope is deep-frozen and resists mutation", async ({
    page,
  }) => {
    await openHarness(page, { fixture: "qds-learn" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();

    const state = await harnessState(page);
    expect(state.envelopeFrozen).toBe(true);
    expect(state.envelopeRendered).toBe(state.envelopeOriginal);

    // attemptMutation returns true when the write was blocked.
    const mutationBlocked = await page.evaluate(() => {
      const w = window as unknown as {
        __LITEQDS__: { attemptMutation: () => boolean };
      };
      return w.__LITEQDS__.attemptMutation();
    });
    expect(mutationBlocked).toBe(true);

    // Title in the DOM is untouched after the mutation attempt.
    expect(await page.getByTestId("panel-title").innerText()).not.toBe(
      "MUTATED",
    );
  });
});
