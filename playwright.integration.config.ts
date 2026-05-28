import { defineConfig, devices } from "@playwright/test";

// XAS-INT suite (IG-0). Runs against the staging-equivalent
// internal_review_surface harness, served by `vite preview` on port 4319.
export default defineConfig({
  testDir: "./xas/integration-tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report-integration" }],
  ],
  outputDir: "./test-results-integration",
  use: {
    baseURL: "http://localhost:4319",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run integration:preview",
    url: "http://localhost:4319",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
