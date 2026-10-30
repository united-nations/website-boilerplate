import { defineConfig, devices } from "@playwright/test";
const previewUrl = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  use: { baseURL: previewUrl, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1 --port 3100",
    url: `${previewUrl}/about`,
    reuseExistingServer: !process.env.CI,
  },
});
