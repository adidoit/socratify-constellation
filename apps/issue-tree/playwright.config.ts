import { defineConfig } from "@playwright/test";
import { createPlaywrightConfig } from "@constellation/test-utils/playwright";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

const baseConfig = createPlaywrightConfig({
  testDir: "./tests",
  baseURL: BASE_URL,
  storageState: "storageState.json",
  globalSetup: "./tests/global-setup.ts",
  envFile: "../../.env.test",
  webServerCommand: "pnpm dev --hostname 127.0.0.1 --port 3000",
  webServerUrl: BASE_URL,
});

export default defineConfig({
  ...baseConfig,
  projects: [
    ...(baseConfig.projects ?? []),
    {
      name: "api",
      testDir: "./tests/api",
      use: {
        baseURL: BASE_URL,
      },
    },
  ],
});
