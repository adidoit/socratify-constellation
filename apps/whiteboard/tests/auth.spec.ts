import { test, expect } from "@playwright/test";

test("magic link login works and Critique button runs", async ({ page }) => {
  await page.goto("/");

  // Load example board and run critique through the UI.
  await page.getByRole("button", { name: "Load Example" }).click();
  const critiqueButton = page.getByRole("button", { name: "Critique" });
  await critiqueButton.click();

  // Ensure the critique request was made and not unauthorized.
  const resp = await page.waitForResponse(
    (r) => r.url().includes("/api/critique") && r.request().method() === "POST",
    { timeout: 15_000 }
  );
  expect(resp.status()).toBe(200);

  await expect(page.locator(".prose").first()).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByText('Sketch on the canvas, then click "Critique" for feedback.')
  ).toHaveCount(0);
  await expect(critiqueButton).toBeEnabled({ timeout: 15_000 });
});
