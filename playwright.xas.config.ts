import { defineConfig, devices } from "@playwright/test";

// XAS-XX validation suite. Runs against the XAS harness (xas/harness),
// served by `vite preview` on port 4318.
export default defineConfig({
  testDir: "./xas/tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report-xas" }]],
  outputDir: "./test-results-xas",
  use: {
    baseURL: "http://localhost:4318",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run xas:preview",
    url: "http://localhost:4318",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
