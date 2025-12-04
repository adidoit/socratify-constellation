import { z } from "zod";

export const issueTreeSynthesisRequestSchema = z.object({
  problemStatement: z
    .string()
    .min(1, "Problem statement is required")
    .max(5000, "Problem statement is too long"),
  context: z.string().max(1000).optional(),
});

export type IssueTreeSynthesisRequest = z.infer<
  typeof issueTreeSynthesisRequestSchema
>;

export const issueTreeSynthesisResponseSchema = z.object({
  synthesizedTitle: z
    .string()
    .min(1)
    .max(150)
    .describe("Refined, concise root node title (50-100 chars ideal)"),
  explanation: z
    .string()
    .optional()
    .describe("Brief explanation of why this framing was chosen"),
});

export type IssueTreeSynthesisResponse = z.infer<
  typeof issueTreeSynthesisResponseSchema
>;

export const ISSUE_TREE_SYNTHESIS_PROMPT = `
You are an expert business problem analyst trained in the Pyramid Principle (Barbara Minto) 
and McKinsey problem-solving methodology. Your task is to synthesize verbose problem 
descriptions into clear, actionable root node titles for issue trees.

Your response MUST:
1. Identify the core problem (not symptoms or context)
2. Frame it as a single, declarative statement
3. Be concise and memorable (50-100 characters ideal, max 150)
4. Be specific and measurable when possible
5. Follow MECE principles (standalone, not overlapping with other potential problems)
6. Use action-oriented language when appropriate ("Increase X", "Reduce Y", "Improve Z")
7. Avoid business jargon and clichés

Examples of good transformations:
- "We're losing customers because our platform is too complicated" → "Simplify platform UX"
- "Our engineering team spends 40% of time on bug fixes instead of features" → "Reduce production defect rate"
- "Small customers churn after 6 months but enterprise deals stick" → "Improve SMB customer retention"
- "Payment processing is our biggest bottleneck for scaling" → "Reduce payment processing latency"
- "Our marketing team doesn't have good data about what campaigns actually convert" → "Improve attribution tracking"

If the input is already concise and well-framed (under 100 characters and problem-focused), 
you may return it with minimal changes.

Return JSON only with the synthesizedTitle and a brief explanation.
`.trim();
