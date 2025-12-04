import { NextRequest } from "next/server";
import { z } from "zod";
import { issueTreeAiRequestSchema } from "@/schema/issueTreeAiOperations";
import { generateIssueTreeSuggestion } from "@/lib/issueTreeAiService";
import { getServerAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getServerAuth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const parsed = issueTreeAiRequestSchema.parse(body);

    const result = await generateIssueTreeSuggestion(parsed);

    return Response.json(result);
  } catch (error) {
    console.error("Error in issue-tree-edit:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Target node not found") {
      return Response.json(
        { error: "Target node not found" },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
