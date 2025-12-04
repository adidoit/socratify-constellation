import { NextRequest } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { geminiModel } from "@/lib/aiClient";
import { getServerAuth } from "@/lib/auth";
import {
  issueTreeSynthesisRequestSchema,
  issueTreeSynthesisResponseSchema,
  ISSUE_TREE_SYNTHESIS_PROMPT,
} from "@/schema/issueTreeSynthesis";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getServerAuth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const parseResult = issueTreeSynthesisRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { error: "Invalid request", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { problemStatement, context } = parseResult.data;

    const prompt = [
      `Problem statement from user:`,
      `"${problemStatement}"`,
      context ? `\nAdditional context: ${context}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const { object } = await generateObject({
      model: geminiModel,
      schema: issueTreeSynthesisResponseSchema,
      system: ISSUE_TREE_SYNTHESIS_PROMPT,
      prompt,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Error in issue-tree-synthesis:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Failed to synthesize problem statement" },
      { status: 500 }
    );
  }
}
