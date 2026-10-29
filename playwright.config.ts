import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/about",
    reuseExistingServer: !process.env.CI,
  },
});
