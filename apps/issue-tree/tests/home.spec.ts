import { test, expect } from "@playwright/test";

// Basic smoke tests for landing page and editor navigation.

test("landing page shows hero prompt only", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("What should we solve today?")).toBeVisible();

  // Sidebar should not be visible when history is empty
  await expect(page.getByText("History")).toHaveCount(0);

  // No tree header should be visible on landing
  await expect(page.getByText("Issue tree").first()).toBeHidden();
});

test("authenticated user can open editor for a created issue tree", async ({ page, request }) => {
  const problem = "Reduce churn for our SaaS";

  // Create via API using the authenticated storage state.
  const createResponse = await request.post("/api/issue-trees", {
    data: { title: problem },
  });
  expect(createResponse.status()).toBe(200);
  const { id } = await createResponse.json();

  await page.goto(`/t/${id}`);
  await expect(page).toHaveURL(/\/t\/.+/);
  await expect(page.getByRole("button", { name: "New issue tree" })).toBeVisible();
});
