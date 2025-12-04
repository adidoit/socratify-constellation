import { z } from "zod";
import type { IssueNode } from "@/types";
import type { IssueTreeJson } from "@/schema/issueTree";
import {
  llmProposedNodeSchema,
  type IssueTreeAiOperationType,
} from "@/schema/issueTreeAiOperations";

export const findNodeById = (tree: IssueNode, id: string): IssueNode | null => {
  if (tree.id === id) return tree;
  for (const child of tree.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
};

export const getNodePath = (tree: IssueNode, id: string, path: string[] = []): string[] | null => {
  if (tree.id === id) return [...path, tree.content];
  for (const child of tree.children) {
    const found = getNodePath(child, id, [...path, tree.content]);
    if (found) return found;
  }
  return null;
};

export const getRootNode = (tree: IssueTreeJson): IssueNode => {
  if ("root" in (tree as object)) {
    return (tree as { root: IssueNode }).root;
  }
  return tree as IssueNode;
};

export const getSystemPrompt = (operationType: IssueTreeAiOperationType): string => {
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
- Keep suggestions concise and actionable.
- Ensure your proposal is clearly distinct from the existing branches and consistent with their level of abstraction.
- If you include any natural-language explanation, write it as short, friendly Markdown (a few bullets or a brief paragraph) and do NOT include any YAML or JSON.`;

  switch (operationType) {
    case "suggestChildren":
      return `${basePrompt}

Your task: Suggest 2-4 child nodes for the target node.
- Children should break down the parent into MISI / MECE sub-issues at this level.
- Each child should be at the same level of abstraction as the others.
- Imagine this level will eventually have 3–5 children; propose children that move the set toward being collectively exhaustive for the parent.`;

    case "suggestSibling":
      return `${basePrompt}

Your task: Suggest ONE sibling node for the target node.
- The sibling should be at the same level of abstraction as the target and existing siblings.
- The sibling must be mutually exclusive from existing siblings (no overlap in meaning or scope).
- Imagine this level will eventually have 3–5 siblings; propose a sibling that moves the set toward being collectively exhaustive for the parent.`;

    case "rewriteLabel":
      return `${basePrompt}

Your task: Suggest an improved label for the target node.
- Make it more specific and actionable.
- Keep it concise (ideally under 10 words).
- Preserve the original meaning and scope so that future siblings could still form a MISI / MECE set with respect to the parent.`;

    case "restructureChildren":
      return `${basePrompt}

Your task: Suggest a restructured set of children for the target node.
- Reorganize to be more MISI / MECE at this level.
- Keep the same overall level of detail; do not collapse or over-expand the tree.
- Preserve the key concepts from the original children while improving clarity and coverage.`;

    default:
      return basePrompt;
  }
};

// -----------------------------
// YAML serialization helpers
// -----------------------------

const indent = (level: number): string => "  ".repeat(level);

const serializeIssueNodeToYamlMapping = (
  node: IssueNode,
  indentLevel: number,
  focusNodeId?: string,
  focusLabel?: string
): string[] => {
  const lines: string[] = [];
  const i = indent(indentLevel);

  lines.push(`${i}id: ${JSON.stringify(node.id)}`);
  lines.push(`${i}content: ${JSON.stringify(node.content)}`);
  lines.push(`${i}type: ${JSON.stringify(node.type)}`);

  if (focusNodeId && node.id === focusNodeId) {
    lines.push(
      `${i}focus: ${JSON.stringify(focusLabel || "target")}`
    );
  }

  if (node.children.length > 0) {
    lines.push(`${i}children:`);
    for (const child of node.children) {
      const childListIndent = indent(indentLevel + 1);
      lines.push(`${childListIndent}-`);
      lines.push(
        ...serializeIssueNodeToYamlMapping(
          child,
          indentLevel + 2,
          focusNodeId,
          focusLabel
        )
      );
    }
  } else {
    lines.push(`${i}children: []`);
  }

  return lines;
};

export const buildIssueTreeYaml = (
  tree: IssueTreeJson,
  options?: { focusNodeId?: string; focusLabel?: string }
): string => {
  const root = getRootNode(tree);
  const lines: string[] = [];

  lines.push("issue_tree:");
  lines.push("  root:");
  lines.push(
    ...serializeIssueNodeToYamlMapping(
      root,
      2,
      options?.focusNodeId,
      options?.focusLabel
    )
  );

  return lines.join("\n");
};


export const getResponseSchema = (operationType: IssueTreeAiOperationType) => {
  switch (operationType) {
    case "suggestChildren":
      return z.object({
        proposedChildren: z.array(llmProposedNodeSchema).min(2).max(5),
        explanation: z.string().optional(),
      });

    case "suggestSibling":
      return z.object({
        proposedSibling: llmProposedNodeSchema,
        explanation: z.string().optional(),
      });

    case "rewriteLabel":
      return z.object({
        proposedContent: z.string(),
        explanation: z.string().optional(),
      });

    case "restructureChildren":
      return z.object({
        proposedChildren: z.array(llmProposedNodeSchema).min(1).max(6),
        explanation: z.string().optional(),
      });

    default:
      throw new Error(`Unknown operation type: ${operationType}`);
  }
};
