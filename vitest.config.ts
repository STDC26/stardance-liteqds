import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Generator/fixture suites plus XAS logic suites (registration, adapter,
    // host eligibility). XAS DOM suites under xas/tests/ run under Playwright.
    include: [
      "tests/**/*.spec.ts",
      "xas/registration/**/*.spec.ts",
      "xas/adapter/**/*.spec.ts",
      "xas/host/**/*.spec.ts",
      "xas/integration/**/*.spec.ts",
      "xas/ig1/**/*.spec.ts",
    ],
  },
});
