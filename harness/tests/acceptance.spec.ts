import { expect, test } from "@playwright/test";
import { FIXTURES, harnessState, openHarness } from "./_helpers";
import learn from "../../fixtures/qds-learn.json" with { type: "json" };
import mo from "../../fixtures/qds-mo.json" with { type: "json" };
import signal from "../../fixtures/qds-signal.json" with { type: "json" };

const ENVELOPES: Record<string, typeof learn> = {
  "qds-learn": learn,
  "qds-mo": mo,
  "qds-signal": signal,
};

// AS-01..16 — Render Harness acceptance criteria. Render-path criteria run
// against all three fixtures; refusal-path criteria run once.
test.describe("AS — Render Harness acceptance", () => {
  for (const fixture of FIXTURES) {
    test.describe(fixture, () => {
      test.beforeEach(async ({ page }) => {
        await openHarness(page, { fixture });
        await expect(page.getByTestId("qualification-card")).toBeVisible();
      });

      test("AS-01 · envelope consumed without mutation", async ({ page }) => {
        const state = await harnessState(page);
        expect(state.outcome).toBe("rendered");
        expect(state.envelopeOriginal).not.toBeNull();
        expect(state.envelopeRendered).toBe(state.envelopeOriginal);
      });

      test("AS-02 · panel_title rendered", async ({ page }) => {
        await expect(page.getByTestId("panel-title")).toHaveText(
          ENVELOPES[fixture]!.panel_spec.panel_title,
        );
      });

      test("AS-03 · panel_subject_label rendered", async ({ page }) => {
        await expect(page.getByTestId("panel-subject-label")).toHaveText(
          ENVELOPES[fixture]!.panel_spec.panel_subject_label,
        );
      });

      test("AS-04 · qualification_type_label rendered", async ({ page }) => {
        await expect(page.getByTestId("qualification-type-label")).toHaveText(
          ENVELOPES[fixture]!.panel_spec.qualification_type_label,
        );
      });

      test("AS-05 · verdict options rendered in order with routing summaries", async ({
        page,
      }) => {
        const expected =
          ENVELOPES[fixture]!.panel_spec.verdict_options_render;
        const options = page.getByTestId("verdict-option");
        await expect(options).toHaveCount(expected.length);
        for (let i = 0; i < expected.length; i++) {
          await expect(options.nth(i)).toHaveAttribute(
            "data-option-id",
            expected[i]!.option_id,
          );
          await expect(
            options.nth(i).getByTestId("verdict-routing-summary"),
          ).toHaveText(expected[i]!.routing_summary);
        }
      });

      test("AS-06 · suggested_confidence rendered directionally", async ({
        page,
      }) => {
        const label = page.getByTestId("directional-confidence-label");
        await expect(label).toBeVisible();
        await expect(label).toHaveAttribute(
          "data-confidence-key",
          ENVELOPES[fixture]!.panel_spec.suggested_confidence,
        );
        expect((await label.innerText()).trim().length).toBeGreaterThan(0);
      });

      test("AS-07 · no numeric confidence rendering", async ({ page }) => {
        const text = await page.getByTestId("directional-confidence").innerText();
        expect(text).not.toMatch(/[0-9]/);
      });

      test("AS-08 · no institutional-confidence vocabulary in the read", async ({
        page,
      }) => {
        const text = (
          await page.getByTestId("directional-confidence").innerText()
        ).toLowerCase();
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

      test("AS-09 · governance_class visible", async ({ page }) => {
        const badge = page.getByTestId("governance-class-badge");
        await expect(badge).toBeVisible();
        await expect(badge).toHaveAttribute(
          "data-governance-class",
          "lite_experimental",
        );
      });

      test("AS-10 · human_review_required visible", async ({ page }) => {
        await expect(page.getByTestId("human-review-required")).toBeVisible();
      });

      test("AS-11 · trust limitations visible and expandable", async ({
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

      test("AS-12 · recourse path visible", async ({ page }) => {
        const recourse = page.getByTestId("recourse-path");
        await expect(recourse).toBeVisible();
        expect((await recourse.innerText()).length).toBeGreaterThan(10);
      });

      test("AS-16 · runtime_authorization rendered as not_authorized", async ({
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
    });
  }

  test("AS-13 · forbidden host surfaces are rejected", async ({ page }) => {
    await openHarness(page, {
      fixture: "qds-learn",
      host: "production_runtime_surface",
    });
    await expect(page.getByTestId("fwire-failure-surface")).toBeVisible();
    await expect(page.getByTestId("fwire-code")).toHaveText(
      "F-WIRE-06_FORBIDDEN_HOST_SURFACE",
    );
    await expect(page.getByTestId("qualification-card")).toHaveCount(0);
  });

  test("AS-14 · F-WIRE surfaces are visible", async ({ page }) => {
    await openHarness(page, { fixture: "qds-learn", variant: "malformed" });
    await expect(page.getByTestId("fwire-failure-surface")).toBeVisible();
    await expect(page.getByTestId("fwire-message")).toBeVisible();
  });

  test("AS-15 · no Proto promotion path exists", async ({ page }) => {
    await openHarness(page, { fixture: "qds-learn" });
    await expect(page.getByTestId("qualification-card")).toBeVisible();
    expect(await page.getByTestId("promote-to-proto").count()).toBe(0);
    const promoteApi = await page.evaluate(
      () =>
        (window as unknown as { XAS_PROMOTE_LITE_TO_PROTO?: unknown })
          .XAS_PROMOTE_LITE_TO_PROTO,
    );
    expect(promoteApi).toBeUndefined();
    const state = await harnessState(page);
    expect(state.promotionBlocked).toBe(true);
  });
});
