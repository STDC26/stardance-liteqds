import { expect, test } from "@playwright/test";
import { harnessState, openHarness } from "./_helpers";

// F-WIRE-01..06 — each failure code surfaces correctly through the component's
// own FWireFailureSurface.
test.describe("F-WIRE — refusal surfaces", () => {
  test("F-WIRE-01 · malformed envelope", async ({ page }) => {
    await openHarness(page, { fixture: "qds-learn", variant: "malformed" });
    await expect(page.getByTestId("fwire-code")).toHaveText(
      "F-WIRE-01_MALFORMED_ENVELOPE",
    );
    expect((await harnessState(page)).outcome).toBe("refused");
  });

  test("F-WIRE-02 · required field missing", async ({ page }) => {
    await openHarness(page, { fixture: "qds-learn", variant: "missing-field" });
    await expect(page.getByTestId("fwire-code")).toHaveText(
      "F-WIRE-02_REQUIRED_FIELD_MISSING",
    );
  });

  test("F-WIRE-03 · non-lite governance class", async ({ page }) => {
    await openHarness(page, { fixture: "qds-learn", variant: "non-lite" });
    await expect(page.getByTestId("fwire-code")).toHaveText(
      "F-WIRE-03_NON_LITE_GOVERNANCE_CLASS",
    );
  });

  test("F-WIRE-04 · viewport too small", async ({ page }) => {
    await page.setViewportSize({ width: 280, height: 640 });
    await openHarness(page, { fixture: "qds-learn" });
    await expect(page.getByTestId("fwire-code")).toHaveText(
      "F-WIRE-04_VIEWPORT_TOO_SMALL",
    );
  });

  test("F-WIRE-05 · band rendering violation", async ({ page }) => {
    await openHarness(page, { fixture: "qds-mo", variant: "band-violation" });
    await expect(page.getByTestId("fwire-code")).toHaveText(
      "F-WIRE-05_BAND_RENDERING_VIOLATION",
    );
  });

  test("F-WIRE-06 · forbidden host surface", async ({ page }) => {
    await openHarness(page, {
      fixture: "qds-learn",
      host: "customer_facing_surface",
    });
    await expect(page.getByTestId("fwire-code")).toHaveText(
      "F-WIRE-06_FORBIDDEN_HOST_SURFACE",
    );
  });

  test("every F-WIRE surface carries an operator-readable message", async ({
    page,
  }) => {
    for (const variant of ["malformed", "missing-field", "non-lite"]) {
      await openHarness(page, { fixture: "qds-learn", variant });
      const message = page.getByTestId("fwire-message");
      await expect(message).toBeVisible();
      expect((await message.innerText()).length).toBeGreaterThan(10);
    }
  });
});
