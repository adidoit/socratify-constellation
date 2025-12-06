import { test, expect, request } from "@playwright/test";
import { buildAuthCookies, createTestUser, deleteTestUser } from "./utils/supabase-auth";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

test.describe("issue-tree-generate-node API", () => {
  test.skip(
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.GEMINI_API_KEY,
    "Supabase + GEMINI_API_KEY env vars are required for live AI API test"
  );

  test("returns a real Gemini-backed suggestion", async () => {
    const user = await createTestUser();
    test.skip(!user, "Unable to create test user");

    try {
      const context = await request.newContext({
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          "Content-Type": "application/json",
        },
      });

      await context.addCookies(
        buildAuthCookies(BASE_URL, user.accessToken, user.refreshToken)
      );

      const payload = {
        tree: {
          id: "root-1",
          content: "Root problem",
          type: "root",
          parentId: null,
          isExpanded: true,
          children: [
            {
              id: "child-1",
              content: "Existing branch",
              type: "hypothesis",
              parentId: "root-1",
              isExpanded: true,
              children: [],
            },
          ],
        },
        targetNodeId: "child-1",
        mode: "child" as const,
      };

      const res = await context.post("/api/issue-tree-generate-node", {
        data: payload,
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body?.proposedNode?.content).toBeTruthy();
      expect(body?.proposedNode?.type).toBe("hypothesis");
    } finally {
      if (user) {
        await deleteTestUser(user.id);
      }
    }
  });
});
