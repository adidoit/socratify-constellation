import { NextRequest } from "next/server";
import { streamText } from "ai";
import { z } from "zod";
import { issueTreeSchema, toLlmIssueTree } from "@/schema/issueTree";
import { issueTreeAiOperationTypeSchema } from "@/schema/issueTreeAiOperations";
import { geminiModel } from "@/lib/aiClient";
import { buildIssueTreeYaml } from "@/lib/issueTreeAiHelpers";
import { generateIssueTreeSuggestion } from "@/lib/issueTreeAiService";

// Schema for chat request with optional edit-suggestion mode
// Note: tree is z.unknown() to allow graceful fallback in text-only mode;
// validated via issueTreeSchema in edit-suggestion mode
const chatRequestSchema = z.object({
  prompt: z.string().optional(),
  tree: z.unknown().optional(),
  mode: z.enum(["text-only", "edit-suggestion"]).optional().default("text-only"),
  targetNodeId: z.string().optional(),
  operationType: issueTreeAiOperationTypeSchema.optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }

  const { prompt, tree: rawTree, mode, targetNodeId, operationType } = parsed.data;

  // Edit-suggestion mode: non-streaming structured response
  if (mode === "edit-suggestion") {
    if (!rawTree) {
      return Response.json(
        { error: "Tree context is required for edit-suggestion mode" },
        { status: 400 }
      );
    }
    if (!targetNodeId) {
      return Response.json(
        { error: "targetNodeId is required for edit-suggestion mode" },
        { status: 400 }
      );
    }
    if (!operationType) {
      return Response.json(
        { error: "operationType is required for edit-suggestion mode" },
        { status: 400 }
      );
    }

    // Validate tree schema for edit-suggestion mode
    const treeParseResult = issueTreeSchema.safeParse(rawTree);
    if (!treeParseResult.success) {
      return Response.json(
        { error: "Invalid tree structure" },
        { status: 400 }
      );
    }
    const tree = treeParseResult.data;

    try {
      const result = await generateIssueTreeSuggestion({
        tree,
        targetNodeId,
        operation: { type: operationType },
      });

      return Response.json({
        mode: "edit-suggestion",
        explanation: result.explanation,
        targetNodeId,
        operationType,
        suggestion: result.suggestion,
      });
    } catch (error) {
      console.error("Error generating edit suggestion:", error);

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

  // Text-only mode: streaming conversational response
  const trimmedPrompt = prompt?.trim() ?? "";
  if (!trimmedPrompt) {
    return new Response("Missing prompt", { status: 400 });
  }

  let treeContext = "";

  if (rawTree) {
    // Try to parse tree; if invalid, just skip tree context (graceful fallback)
    const treeParseResult = issueTreeSchema.safeParse(rawTree);
    if (treeParseResult.success) {
      try {
        const tree = treeParseResult.data;
        const llmTree = toLlmIssueTree(tree);
        const treeYaml = buildIssueTreeYaml(tree, {
          focusNodeId: undefined,
        });

        treeContext = [
          "",
          "",
          "Current issue tree (YAML):",
          treeYaml,
          "",
          "For reference, the same tree in JSON:",
          JSON.stringify(llmTree, null, 2),
        ].join("\n");
      } catch {
        // Ignore serialization errors; chat will still work without tree context
      }
    }
    // If tree doesn't validate, just proceed without tree context
  }

  const result = await streamText({
    model: geminiModel,
    prompt: [
      "You are an expert in issue trees and structured problem solving.",
      "You help users build MISI / MECE (Mutually Exclusive, Collectively Exhaustive) structures.",
      "",
      "You always respond in friendly Markdown, not YAML.",
      "The YAML and JSON you receive are for internal context only.",
      "Do NOT show YAML or JSON back to the user.",
      "",
      "The chat UI is a small floating widget with very limited space.",
      "Your responses MUST be succinct, scannable, and focused.",
      "",
      "STYLE RULES:",
      "- Default length: at most 3–6 short bullet points OR a single short paragraph (roughly 120 words max).",
      "- Lead with the single most important recommendation.",
      "- Avoid long introductions, apologies, and conclusions.",
      "- Do NOT restate the user question unless it is truly needed for clarity.",
      "- Prefer bullets over headings; only use headings when absolutely necessary.",
      "- When giving lists, keep them flat (no nested bullets).",
      "",
      "MARKDOWN USAGE:",
      "- Use **bold** sparingly to highlight key terms only.",
      "- Use bullet points or numbered lists for multiple items.",
      "- Use `code` formatting only for technical terms or literal labels.",
      "- Avoid large blocks of text or deeply structured sections.",
      "- When suggesting edits (add / delete / change nodes), format them as short Markdown bullets like `- **Add**: ...`, `- **Remove**: ...`, `- **Change**: ...` instead of any YAML-like structure.",
      "",
      "BEHAVIOR FOR COMMON PROMPTS (EXAMPLES – DO NOT MENTION THEY ARE EXAMPLES):",
      "",
      "If the user asks: \"Review my current issue tree and suggest improvements to its structure.\"",
      "Respond in a Markdown format like:",
      "- **Clarify focus**: tighten the root question to one clear problem or outcome.",
      "- **Group overlaps**: merge or nest branches that cover the same idea.",
      "- **Fill gaps**: add 1–2 branches for missing dimensions (e.g., timeline, stakeholders, risks).",
      "- **Simplify**: remove or rephrase branches that are redundant or unclear.",
      "",
      "If the user asks: \"Suggest concrete fixes for weaknesses or gaps in my current issue tree.\"",
      "Respond in a Markdown format like:",
      "- **Add**: a branch for a missing dimension (e.g., operations, product, go-to-market).",
      "- **Change**: split an overly broad node into 2–3 more specific, actionable sub-issues.",
      "- **Rename**: ambiguous nodes so each describes a clear, testable sub-problem.",
      "- **Move**: any misplaced node under the parent where it logically belongs.",
      "",
      "If the user asks: \"Check whether my issue tree is MECE and point out overlaps or missing branches.\"",
      "Respond in a Markdown format like:",
      "- **Overlaps**: briefly name any branches that cover similar ground and how to separate them.",
      "- **Gaps**: list 1–2 obvious missing branches for major dimensions.",
      "- **Level mix**: highlight nodes that mix outcomes and drivers and suggest a cleaner split.",
      "- **Overall**: one short line on how close the tree is to MECE.",
      "",
      "These are example formats only. In all cases, adapt your answer to the specific tree and prompt,",
      "while keeping the response very concise and actionable.",
      "",
      "User message:",
      trimmedPrompt,
      treeContext,
    ].join("\n"),
  });

  return result.toTextStreamResponse();
}
