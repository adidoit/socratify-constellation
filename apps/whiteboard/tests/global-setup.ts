import { chromium, type FullConfig } from "@playwright/test";
import { loginWithMagicLink } from "@constellation/test-utils/playwright";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3001";
const REDIRECT_URL =
  process.env.PLAYWRIGHT_REDIRECT_URL || `${BASE_URL.replace(/\/$/, "")}/auth/callback?next=/`;
const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL || "testuser@example.com";

async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await loginWithMagicLink(page, {
    email: TEST_EMAIL,
    redirectTo: REDIRECT_URL,
    waitForPathContains: "/auth/callback",
    baseUrl: BASE_URL,
  });

  await page.context().storageState({ path: "storageState.json" });
  await browser.close();
}

export default globalSetup;
