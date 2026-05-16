import { defineConfig, devices } from "@playwright/test";

// G1 proof suite. Runs against the built harness served by `vite preview`.
export default defineConfig({
  testDir: "./harness/tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "./test-results",
  use: {
    baseURL: "http://localhost:4317",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { ...devices["iPhone 12"] } },
  ],
  webServer: {
    command: "npm run harness:preview",
    url: "http://localhost:4317",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
