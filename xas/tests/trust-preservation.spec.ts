import { expect, test } from "@playwright/test";
import { FIXTURES, openXAS } from "./_helpers";

// X4 — trust signals must survive routing through the XAS adapter into the
// certified renderer. Runs against all three fixtures.
test.describe("XAS trust signal preservation", () => {
  for (const fixture of FIXTURES) {
    test.describe(fixture, () => {
      test.beforeEach(async ({ page }) => {
        await openXAS(page, { fixture });
        await expect(page.getByTestId("qualification-card")).toBeVisible();
      });

      test("governance_class remains visible", async ({ page }) => {
        const badge = page.getByTestId("governance-class-badge");
        await expect(badge).toBeVisible();
        await expect(badge).toHaveAttribute(
          "data-governance-class",
          "lite_experimental",
        );
      });

      test("runtime_authorization remains visible as not_authorized", async ({
        page,
      }) => {
        const indicator = page.getByTestId("runtime-authorization-indicator");
        await expect(indicator).toBeVisible();
        await expect(indicator).toHaveAttribute(
          "data-runtime-authorization",
          "not_authorized",
        );
        await expect(indicator).toContainText("Not authorized for runtime");
      });

      test("human_review_required remains visible", async ({ page }) => {
        await expect(page.getByTestId("human-review-required")).toBeVisible();
      });

      test("trust_surface_limitations remain visible and expandable", async ({
        page,
      }) => {
        await expect(
          page.getByTestId("trust-indicator-always-visible"),
        ).toBeVisible();
        const before = await page.getByTestId("trust-limitation-item").count();
        await page.getByTestId("trust-limitation-expand").click();
        const after = await page.getByTestId("trust-limitation-item").count();
        expect(after).toBeGreaterThan(before);
      });

      test("no institutional or numeric confidence appears in the read", async ({
        page,
      }) => {
        const text = (
          await page.getByTestId("directional-confidence").innerText()
        ).toLowerCase();
        expect(text).not.toMatch(/[0-9]/);
        for (const word of [
          "score",
          "probability",
          "percent",
          "institutional",
          "certainty",
          "likelihood",
        ]) {
          expect(text).not.toContain(word);
        }
      });
    });
  }
});
