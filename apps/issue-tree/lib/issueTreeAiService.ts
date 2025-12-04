import { generateObject } from "ai";
import { geminiModel } from "@/lib/aiClient";
import { toLlmIssueTree } from "@/schema/issueTree";
import type { IssueTreeAiRequest, IssueTreeAiResponse } from "@/schema/issueTreeAiOperations";
import {
  findNodeById,
  getNodePath,
  getRootNode,
  getSystemPrompt,
  getResponseSchema,
  buildIssueTreeYaml,
} from "@/lib/issueTreeAiHelpers";

export type { IssueTreeAiRequest, IssueTreeAiResponse };

/**
 * Generate an AI suggestion for modifying an issue tree.
 * This is the core service function used by both /api/issue-tree-edit and /api/chat (edit mode).
 */
export async function generateIssueTreeSuggestion(
  input: IssueTreeAiRequest
): Promise<IssueTreeAiResponse> {
  const { tree, targetNodeId, operation } = input;
  const rootNode = getRootNode(tree);
  const targetNode = findNodeById(rootNode, targetNodeId);

  if (!targetNode) {
    throw new Error("Target node not found");
  }

  const llmTree = toLlmIssueTree(tree);
  const nodePath = getNodePath(rootNode, targetNodeId) || [];
  const existingSiblings = targetNode.parentId
    ? findNodeById(rootNode, targetNode.parentId)?.children.map((c) => c.content) || []
    : [];

  const treeYaml = buildIssueTreeYaml(tree, {
    focusNodeId: targetNodeId,
    focusLabel: operation.type,
  });

  const operationYamlLines: string[] = [];
  operationYamlLines.push("edit_context:");
  operationYamlLines.push(`  operation_type: ${JSON.stringify(operation.type)}`);
  operationYamlLines.push(`  target_node_id: ${JSON.stringify(targetNodeId)}`);
  operationYamlLines.push(`  node_path: [${nodePath.map((p) => JSON.stringify(p)).join(", ")}]`);
  operationYamlLines.push("  existing_children:");
  if (targetNode.children.length === 0) {
    operationYamlLines.push("    []");
  } else {
    targetNode.children.forEach((child) => {
      operationYamlLines.push(`    - content: ${JSON.stringify(child.content)}`);
    });
  }
  operationYamlLines.push("  existing_siblings:");
  if (existingSiblings.length === 0) {
    operationYamlLines.push("    []");
  } else {
    existingSiblings.forEach((content) => {
      operationYamlLines.push(`    - content: ${JSON.stringify(content)}`);
    });
  }

  const operationYaml = operationYamlLines.join("\n");

  const promptParts = [
    "You are given the full issue tree in YAML, with the target node annotated:",
    "",
    treeYaml,
    "",
    "Edit request in YAML:",
    "",
    operationYaml,
    "",
    "For reference, here is the same tree structure in JSON:",
    JSON.stringify(llmTree, null, 2),
  ];

  const prompt = promptParts.join("\n");

  const responseSchema = getResponseSchema(operation.type);

  const { object } = await generateObject({
    model: geminiModel,
    schema: responseSchema,
    system: getSystemPrompt(operation.type),
    prompt,
  });

  const suggestion = {
    type: operation.type,
    targetNodeId,
    ...object,
  };

  return {
    suggestion: suggestion as IssueTreeAiResponse["suggestion"],
    explanation: (object as { explanation?: string }).explanation,
  };
}
