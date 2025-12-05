import { createPlaywrightConfig } from "@constellation/test-utils/playwright";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3001";

export default createPlaywrightConfig({
  testDir: "./tests",
  baseURL: BASE_URL,
  storageState: "storageState.json",
  globalSetup: "./tests/global-setup.ts",
  envFile: "../../.env.test",
  webServerCommand: "pnpm dev --hostname 127.0.0.1 --port 3001",
  webServerUrl: BASE_URL,
});
