import { z } from "zod";
import type { IssueNode, NodeType, NodeTag } from "@/types";

export const nodeTypeSchema = z.enum([
  "root",
  "hypothesis",
  "question",
  "action",
  "data",
]) as z.ZodType<NodeType>;

const nodeTagSchema: z.ZodType<NodeTag> = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string().optional(),
  kind: z.string().optional(),
});

export const issueNodeSchema: z.ZodType<IssueNode> = z.lazy(() =>
  z
    .object({
      id: z.string(),
      content: z.string(),
      type: nodeTypeSchema,
      children: z.array(issueNodeSchema),
      parentId: z.string().nullable(),
      isExpanded: z.boolean(),
      tags: z.array(nodeTagSchema).optional(),
    })
    // Allow future per-node metadata without failing validation
    .passthrough()
);

// Flexible issue-tree shape:
// - either a bare root IssueNode (what the app currently uses)
// - or an object with { root: IssueNode } (matches TreeState)
export const issueTreeSchema = z.union([
  issueNodeSchema,
  z.object({ root: issueNodeSchema }),
]);

export type IssueTreeJson = z.infer<typeof issueTreeSchema>;

export const parseIssueTree = (data: unknown): IssueTreeJson =>
  issueTreeSchema.parse(data);

// -----------------------------
// LLM-optimized tree schema
// -----------------------------

// Minimal node shape used when talking to LLMs:
// - drops internal fields like id/parentId/isExpanded
// - keeps content, optional type, and children
export type LlmIssueNode = {
  content: string;
  type?: NodeType;
  children?: LlmIssueNode[];
  // allow extra model-specific metadata
  [key: string]: unknown;
};

export const llmIssueNodeSchema: z.ZodType<LlmIssueNode> = z.lazy(() =>
  z
    .object({
      content: z.string(),
      type: nodeTypeSchema.optional(),
      children: z.array(llmIssueNodeSchema).optional(),
    })
    .passthrough()
);

// Tree can be either bare node or { root: node }, mirroring IssueTreeJson
export const llmIssueTreeSchema = z.union([
  llmIssueNodeSchema,
  z.object({ root: llmIssueNodeSchema }),
]);

export type LlmIssueTreeJson = z.infer<typeof llmIssueTreeSchema>;

// Helpers to convert between internal and LLM shapes

const toLlmNode = (node: IssueNode): LlmIssueNode => ({
  content: node.content,
  type: node.type,
  children: node.children.map((child) => toLlmNode(child)),
});

export const toLlmIssueTree = (tree: IssueTreeJson): LlmIssueTreeJson => {
  if ("root" in (tree as any)) {
    return { root: toLlmNode((tree as any).root as IssueNode) };
  }
  return toLlmNode(tree as IssueNode);
};

// aliases matching the naming you suggested
export const to_LLM_ISSUE_TREE = toLlmIssueTree;

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const fromLlmNode = (
  node: LlmIssueNode,
  parentId: string | null
): IssueNode => {
  const id = generateId();
  const parsedType = node.type
    ? nodeTypeSchema.safeParse(node.type)
    : null;

  const type: NodeType = parsedType && parsedType.success
    ? parsedType.data
    : parentId === null
      ? "root"
      : "hypothesis";

  const children = (node.children ?? []).map((child) =>
    fromLlmNode(child, id)
  );

  return {
    id,
    content: node.content,
    type,
    children,
    parentId,
    isExpanded: true,
  };
};

export const fromLlmIssueTree = (data: unknown): IssueTreeJson => {
  const parsed = llmIssueTreeSchema.parse(data);

  if ("root" in parsed) {
    const root = fromLlmNode(parsed.root as LlmIssueNode, null);
    return root;
  }

  const root = fromLlmNode(parsed as LlmIssueNode, null);
  return root;
};

export const from_LLM_ISSUE_TREE = fromLlmIssueTree;
