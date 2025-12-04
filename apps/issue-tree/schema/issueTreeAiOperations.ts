import { z } from "zod";
import { issueTreeSchema, nodeTypeSchema } from "./issueTree";

// Operation types for inline AI assistance
export const issueTreeAiOperationTypeSchema = z.enum([
  "suggestChildren",
  "suggestSibling",
  "rewriteLabel",
  "restructureChildren",
]);

export type IssueTreeAiOperationType = z.infer<typeof issueTreeAiOperationTypeSchema>;

// Request schema for AI operations
export const issueTreeAiRequestSchema = z.object({
  tree: issueTreeSchema,
  targetNodeId: z.string(),
  operation: z.object({
    type: issueTreeAiOperationTypeSchema,
    params: z.record(z.unknown()).optional(),
  }),
});

export type IssueTreeAiRequest = z.infer<typeof issueTreeAiRequestSchema>;

// Proposed node from LLM (minimal shape)
export const llmProposedNodeSchema = z.object({
  content: z.string(),
  type: nodeTypeSchema.optional(),
});

export type LlmProposedNode = z.infer<typeof llmProposedNodeSchema>;

// Response schemas for different operation types
export const suggestChildrenResponseSchema = z.object({
  type: z.literal("suggestChildren"),
  targetNodeId: z.string(),
  proposedChildren: z.array(llmProposedNodeSchema),
});

export const suggestSiblingResponseSchema = z.object({
  type: z.literal("suggestSibling"),
  targetNodeId: z.string(),
  proposedSibling: llmProposedNodeSchema,
});

export const rewriteLabelResponseSchema = z.object({
  type: z.literal("rewriteLabel"),
  targetNodeId: z.string(),
  proposedContent: z.string(),
});

export const restructureChildrenResponseSchema = z.object({
  type: z.literal("restructureChildren"),
  targetNodeId: z.string(),
  proposedChildren: z.array(llmProposedNodeSchema),
});

// Union of all response types
export const issueTreeAiSuggestionSchema = z.discriminatedUnion("type", [
  suggestChildrenResponseSchema,
  suggestSiblingResponseSchema,
  rewriteLabelResponseSchema,
  restructureChildrenResponseSchema,
]);

export type IssueTreeAiSuggestion = z.infer<typeof issueTreeAiSuggestionSchema>;

// Full API response including optional explanation
export const issueTreeAiResponseSchema = z.object({
  suggestion: issueTreeAiSuggestionSchema,
  explanation: z.string().optional(),
});

export type IssueTreeAiResponse = z.infer<typeof issueTreeAiResponseSchema>;
