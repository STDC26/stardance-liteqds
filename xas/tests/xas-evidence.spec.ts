import { expect, test } from "@playwright/test";
import { FIXTURES, openXAS } from "./_helpers";

// Captures XAS-XX evidence screenshots. Fixture cards (rendered through the
// XAS adapter) are captured under desktop + mobile; F-WIRE refusal surfaces
// are captured once under desktop.
const SHOTS = "xas/evidence/screenshots";

test.describe("XAS evidence capture", () => {
  for (const fixture of FIXTURES) {
    test(`xas render evidence · ${fixture}`, async ({ page }, testInfo) => {
      await openXAS(page, { fixture });
      await expect(page.getByTestId("qualification-card")).toBeVisible();
      await page.getByTestId("qualification-card").screenshot({
        path: `${SHOTS}/${fixture}.${testInfo.project.name}.png`,
      });
    });
  }

  const FWIRE_CASES = [
    { id: "f-wire-01", open: { fixture: "qds-learn", variant: "malformed" } },
    { id: "f-wire-02", open: { fixture: "qds-learn", variant: "missing-field" } },
    { id: "f-wire-03", open: { fixture: "qds-learn", variant: "non-lite" } },
    { id: "f-wire-05", open: { fixture: "qds-mo", variant: "band-violation" } },
    {
      id: "f-wire-06",
      open: { fixture: "qds-learn", host: "production_runtime_surface" },
    },
  ] as const;

  for (const c of FWIRE_CASES) {
    test(`xas fwire evidence · ${c.id}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "desktop-only capture");
      await openXAS(page, c.open);
      await expect(page.getByTestId("fwire-failure-surface")).toBeVisible();
      await page.getByTestId("fwire-failure-surface").screenshot({
        path: `${SHOTS}/${c.id}.desktop.png`,
      });
    });
  }

  test("xas fwire evidence · f-wire-04", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only capture");
    await page.setViewportSize({ width: 280, height: 640 });
    await openXAS(page, { fixture: "qds-learn" });
    await expect(page.getByTestId("fwire-failure-surface")).toBeVisible();
    await page.getByTestId("fwire-failure-surface").screenshot({
      path: `${SHOTS}/f-wire-04.desktop.png`,
    });
  });
});
