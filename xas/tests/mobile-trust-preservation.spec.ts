import { expect, test } from "@playwright/test";
import { FIXTURES, openXAS } from "./_helpers";

// X4 — mobile trust hard-lock must survive XAS adapter insertion. Runs only in
// the mobile project (Pixel 5).
test.describe("XAS mobile trust preservation", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile",
      "mobile-project-only checks",
    );
  });

  for (const fixture of FIXTURES) {
    test.describe(fixture, () => {
      test.beforeEach(async ({ page }) => {
        await openXAS(page, { fixture });
        await expect(page.getByTestId("qualification-card")).toBeVisible();
      });

      test("trust limitation hard-lock — one limitation visible without expansion", async ({
        page,
      }) => {
        await expect(
          page.getByTestId("trust-indicator-always-visible"),
        ).toBeVisible();
      });

      test("governance_class not stripped on mobile", async ({ page }) => {
        await expect(page.getByTestId("governance-class-badge")).toBeVisible();
      });

      test("runtime_authorization not stripped on mobile", async ({ page }) => {
        await expect(
          page.getByTestId("runtime-authorization-indicator"),
        ).toBeVisible();
      });

      test("human_review_required not stripped on mobile", async ({ page }) => {
        await expect(page.getByTestId("human-review-required")).toBeVisible();
      });
    });
  }
});
