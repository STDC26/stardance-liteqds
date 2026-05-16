import { expect, test } from "@playwright/test";
import { FIXTURES, openHarness } from "./_helpers";

// M-01..04 — mobile visibility. Runs only in the mobile project (iPhone 12).
test.describe("M — mobile visibility", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile",
      "mobile-project-only checks",
    );
  });

  for (const fixture of FIXTURES) {
    test.describe(fixture, () => {
      test.beforeEach(async ({ page }) => {
        await openHarness(page, { fixture });
        await expect(page.getByTestId("qualification-card")).toBeVisible();
      });

      test("M-01 · a trust limitation is visible without expansion", async ({
        page,
      }) => {
        await expect(
          page.getByTestId("trust-indicator-always-visible"),
        ).toBeVisible();
      });

      test("M-02 · governance_class is not stripped", async ({ page }) => {
        await expect(
          page.getByTestId("governance-class-badge"),
        ).toBeVisible();
      });

      test("M-03 · runtime_authorization is not stripped", async ({ page }) => {
        await expect(
          page.getByTestId("runtime-authorization-indicator"),
        ).toBeVisible();
      });

      test("M-04 · human_review_required is not stripped", async ({ page }) => {
        await expect(
          page.getByTestId("human-review-required"),
        ).toBeVisible();
      });
    });
  }
});
