import { test, expect } from "@playwright/test";

test("magic link login establishes an authenticated session", async ({ page, request }) => {
  await page.goto("/");

  const response = await request.get("/api/issue-trees");
  expect(response.status()).toBe(200);

  const cookies = await page.context().cookies();
  const hasSupabaseCookie = cookies.some((cookie) => cookie.name.startsWith("sb-") && cookie.value);
  expect(hasSupabaseCookie).toBeTruthy();
});
