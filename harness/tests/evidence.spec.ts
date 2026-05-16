import { expect, test } from "@playwright/test";
import { FIXTURES, openHarness } from "./_helpers";

// Captures the G1 evidence screenshots. Fixture cards are captured under both
// the desktop and mobile projects; F-WIRE surfaces are captured once (desktop).
const SHOTS = "harness/evidence/screenshots";

test.describe("Evidence capture", () => {
  for (const fixture of FIXTURES) {
    test(`render evidence · ${fixture}`, async ({ page }, testInfo) => {
      await openHarness(page, { fixture });
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
    test(`fwire evidence · ${c.id}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "desktop-only capture");
      await openHarness(page, c.open);
      await expect(page.getByTestId("fwire-failure-surface")).toBeVisible();
      await page.getByTestId("fwire-failure-surface").screenshot({
        path: `${SHOTS}/${c.id}.desktop.png`,
      });
    });
  }

  test("fwire evidence · f-wire-04", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only capture");
    await page.setViewportSize({ width: 280, height: 640 });
    await openHarness(page, { fixture: "qds-learn" });
    await expect(page.getByTestId("fwire-failure-surface")).toBeVisible();
    await page.getByTestId("fwire-failure-surface").screenshot({
      path: `${SHOTS}/f-wire-04.desktop.png`,
    });
  });
});
