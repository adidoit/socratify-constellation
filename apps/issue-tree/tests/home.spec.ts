import { test, expect } from "@playwright/test";

// Basic smoke tests for landing page and editor navigation.

test("landing page shows hero prompt only", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("What would you like to solve?")).toBeVisible();

  // Sidebar should not be visible when history is empty
  await expect(page.getByText("History")).toHaveCount(0);

  // No tree header should be visible on landing
  await expect(page.getByText("Issue tree").first()).toBeHidden();
});

test("submitting problem navigates to editor", async ({ page }) => {
  await page.goto("/");

  const problem = "Reduce churn for our SaaS";

  // Type into the PromptInput textarea
  await page.getByPlaceholder("Describe the problem you want to solve...").fill(problem);

  // Click the submit button (PromptInputSubmit)
  await page.locator('button[type="submit"]').click();

  // Wait for navigation to /t/[id] and editor header
  await page.waitForURL(/\/t\/.+/);
  await expect(page.getByText("Issue tree")).toBeVisible();
  await expect(page.getByText(problem)).toBeVisible();
});
