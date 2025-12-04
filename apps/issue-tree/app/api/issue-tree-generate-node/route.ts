import { getServerAuth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { geminiModel } from "@/lib/aiClient";
import { issueTreeSchema, toLlmIssueTree } from "@/schema/issueTree";
import { llmProposedNodeSchema } from "@/schema/issueTreeAiOperations";
import {
  findNodeById,
  getNodePath,
  getRootNode,
  buildIssueTreeYaml,
} from "@/lib/issueTreeAiHelpers";

const generateNodeRequestSchema = z.object({
  tree: issueTreeSchema,
  targetNodeId: z.string(),
  mode: z.enum(["child", "sibling", "complete"]),
});

type GenerateNodeMode = z.infer<typeof generateNodeRequestSchema>["mode"];

const getSystemPrompt = (mode: GenerateNodeMode): string => {
  const basePrompt = `You are an expert in issue trees and structured problem solving.
You help users build MISI / MECE (Mutually Exclusive, Collectively Exhaustive) issue trees.

ABOUT MECE AT A SINGLE LEVEL:
- "Mutually exclusive" means each branch represents a distinct way to break down the parent — no overlaps in scope.
- "Collectively exhaustive" means that if we eventually had a complete set of 3–5 branches, together they would cover the full scope of the parent.
- When there are currently only 1–2 branches, your job is to move the set in the right direction, not to make it perfectly exhaustive yet.

IMPORTANT CONSTRAINTS:
- You can ONLY perform ONE local operation at a time.
- You MUST NOT rewrite or regenerate the entire tree.
- Focus strictly on the specific node and operation requested.
- Keep labels concise and actionable.
- Ensure your proposal is clearly distinct from the existing branches and consistent with their level of abstraction.
- If you include any natural-language explanation, write it as short, friendly Markdown (a few bullets or a brief paragraph) and do NOT include any YAML or JSON.`;

  switch (mode) {
    case "child":
      return `${basePrompt}

Your task: Propose ONE new child node for the target node.
- The child should be at the same level of abstraction as existing_children.
- It must be mutually exclusive from existing_children (no overlap in meaning).
- Imagine this level will eventually have 3–5 children; choose a child that would help that future set be collectively exhaustive for the parent.`;
    case "sibling":
      return `${basePrompt}

Your task: Propose ONE new sibling node for the target node.
- The sibling should be at the same level of abstraction as target_node and existing_siblings.
- It must be mutually exclusive from existing_siblings (no overlap in meaning).
- Imagine that this level will eventually have 3–5 siblings; choose a sibling that moves the set toward being collectively exhaustive for the parent.`;
    case "complete":
    default:
      return `${basePrompt}

Your task: Propose the best label for the target node.
- If the current label is empty or very rough, create a clear, concise label.
- If a label already exists, you may refine it while preserving its intent.
- Keep it under ~12 words and make it specific and actionable.
- Write the label so that, if we later add 3–5 siblings at this level, the set could be MISI / MECE with respect to the parent.`;
  }
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getServerAuth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const parsed = generateNodeRequestSchema.parse(body);

    const { tree, targetNodeId, mode } = parsed;
    const rootNode = getRootNode(tree);
    const targetNode = findNodeById(rootNode, targetNodeId);

    if (!targetNode) {
      return Response.json(
        { error: "Target node not found" },
        { status: 400 }
      );
    }

    if (mode === "sibling" && !targetNode.parentId) {
      return Response.json(
        { error: "Cannot generate sibling for root node" },
        { status: 400 }
      );
    }

	    const llmTree = toLlmIssueTree(tree);
	    const nodePath = getNodePath(rootNode, targetNodeId) || [];
	    const parentNode = targetNode.parentId
	      ? findNodeById(rootNode, targetNode.parentId)
	      : null;
	    const existingSiblings =
	      parentNode?.children
	        .filter((c) => c.id !== targetNodeId)
	        .map((c) => c.content) || [];
	    const existingChildren = targetNode.children.map((c) => c.content);

	    const parentPath = nodePath.slice(0, -1);

	    const treeYaml = buildIssueTreeYaml(tree, {
	      focusNodeId: targetNodeId,
	      focusLabel: mode,
	    });

	    const yamlLines: string[] = [];
	    yamlLines.push("local_generation_context:");
	    yamlLines.push(`  mode: ${mode}`);
	    yamlLines.push(
	      `  full_path: [${nodePath.map((p) => JSON.stringify(p)).join(", ")}]`
	    );
	    yamlLines.push(
	      `  parent_path: [${parentPath.map((p) => JSON.stringify(p)).join(", ")}]`
	    );
	    yamlLines.push("  target_node:");
	    yamlLines.push(`    content: ${JSON.stringify(targetNode.content)}`);
	    yamlLines.push(`    type: ${JSON.stringify(targetNode.type)}`);

	    if (parentNode) {
	      yamlLines.push("  parent_node:");
	      yamlLines.push(`    content: ${JSON.stringify(parentNode.content)}`);
	      yamlLines.push(`    type: ${JSON.stringify(parentNode.type)}`);
	    }

	    yamlLines.push("  existing_children:");
	    if (existingChildren.length === 0) {
	      yamlLines.push("    []");
	    } else {
	      existingChildren.forEach((content) => {
	        yamlLines.push(`    - content: ${JSON.stringify(content)}`);
	      });
	    }

	    yamlLines.push("  existing_siblings:");
	    if (existingSiblings.length === 0) {
	      yamlLines.push("    []");
	    } else {
	      existingSiblings.forEach((content) => {
	        yamlLines.push(`    - content: ${JSON.stringify(content)}`);
	      });
	    }

	    yamlLines.push("  new_node_slot:");
	    if (mode === "child") {
	      yamlLines.push('    kind: "child"');
	      yamlLines.push(
	        '    description: "Propose ONE new child node to add under target_node that is distinct from existing_children and fits the parent."'
	      );
	    } else if (mode === "sibling") {
	      yamlLines.push('    kind: "sibling"');
	      yamlLines.push(
	        '    description: "Propose ONE new sibling node to add alongside target_node that is distinct from existing_siblings and fits the same level of abstraction."'
	      );
	    } else {
	      yamlLines.push('    kind: "complete_label"');
	      yamlLines.push(
	        '    description: "Complete or refine the label for target_node so it works well with future siblings at this level."'
	      );
	    }

	    const yamlContext = yamlLines.join("\n");

	    const promptParts = [
	      "You are given the full issue tree in YAML, with the target node annotated:",
	      "",
	      treeYaml,
	      "",
	      "Local generation context in YAML:",
	      "",
	      yamlContext,
	      "",
	      "For reference, here is the same tree structure in JSON:",
	      JSON.stringify(llmTree, null, 2),
	    ];

	    const prompt = promptParts.join("\n");

    const responseSchema = z.object({
      proposedNode: llmProposedNodeSchema,
      explanation: z.string().optional(),
    });

    const { object } = await generateObject({
      model: geminiModel,
      schema: responseSchema,
      system: getSystemPrompt(mode),
      prompt,
    });

    return Response.json({
      proposedNode: object.proposedNode,
      explanation: object.explanation,
    });
  } catch (error) {
    console.error("Error in issue-tree-generate-node:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Failed to generate node" },
      { status: 500 }
    );
  }
}
