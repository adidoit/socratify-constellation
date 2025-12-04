import { z } from "zod";

export const rubricScaleSchema = z.object({
  min: z.literal(1),
  max: z.literal(3),
  labels: z.object({
    1: z.literal("Weak"),
    2: z.literal("Mixed"),
    3: z.literal("Strong"),
  }),
});

export const rubricDimensionIdSchema = z.enum([
  "mutually_exclusive",
  "collectively_exhaustive",
  "logical_coherence",
  "actionability",
  "problem_alignment",
]);

export const rubricDimensionAssessmentSchema = z.object({
  id: rubricDimensionIdSchema,
  label: z.string(),
  score: z.number().int().min(1).max(3),
  scoreLabel: z.union([
    z.literal("Strong"),
    z.literal("Mixed"),
    z.literal("Weak"),
  ]),
  rationale: z.string(),
});

export const issueTreeAssessmentSchema = z.object({
  rubricName: z.literal("Issue Tree Quality Rubric"),
  scale: rubricScaleSchema,
  dimensions: z.array(rubricDimensionAssessmentSchema),
  overallComments: z.string().optional(),
});

export type IssueTreeAssessment = z.infer<typeof issueTreeAssessmentSchema>;

export const ISSUE_TREE_RUBRIC_PROMPT = `
You are an expert strategy consultant and issue-tree coach.
You specialize in MISI / MECE (Mutually Exclusive, Collectively Exhaustive) issue trees.
Evaluate the following issue tree using this rubric and return ONLY a JSON object
matching the provided schema. Use the YAML representation of the tree as your
primary structural reference; the JSON view is provided as a secondary check.

Rubric (YAML-like for your understanding, do not echo it back):

rubric:
  name: "Issue Tree Quality Rubric"
  description: >
    A 5-dimension, 3-level rubric for evaluating the quality of issue trees.
    Levels: 3 = Strong, 2 = Mixed, 1 = Weak.

  scale:
    min: 1
    max: 3
    labels:
      3: "Strong"
      2: "Mixed"
      1: "Weak"

  dimensions:
    - id: "mutually_exclusive"
      label: "Mutually exclusive"
      definition: >
        Sibling branches at a node do not materially overlap in meaning or scope.
      levels:
        3: |
          Sibling branches are clearly distinct; a given issue or fact naturally fits
          in only one child. No major overlap or double-counting between siblings.
        2: |
          Sibling branches are mostly distinct, but some have partial overlap.
          Overlaps are minor and would not significantly affect analysis or prioritization.
        1: |
          Frequent, obvious overlap between siblings. Many items or drivers could reasonably
          sit under two or more children; categories feel blurry.

    - id: "collectively_exhaustive"
      label: "Collectively exhaustive"
      definition: >
        For each parent node, its children together cover the full space implied by that parent
        at the intended level of detail.
      levels:
        3: |
          If all children were addressed, the parent issue would be comprehensively covered
          with no significant gaps. No big, obvious driver or category is missing at important nodes.
        2: |
          Coverage is mostly adequate, but one or two significant areas are missing.
          The missing pieces can be added without redesigning the entire tree.
        1: |
          Major aspects of the parent issue are missing. Addressing all children would leave
          the parent problem largely unsolved.

    - id: "logical_coherence"
      label: "Logical coherence"
      definition: >
        The hierarchy and grouping form a clear, logical argument in a pyramid sense:
        children explain or support their parent, and siblings follow a consistent organizing
        principle and abstraction level.
      levels:
        3: |
          For most nodes, children clearly answer "what explains, drives, or comprises this parent?"
          Reading top-down gives a coherent "because-of" or "made up of" story. Siblings consistently
          use the same organizing principle and abstraction level (e.g., all causes, all options,
          all segments). Labels are specific and clear enough that relationships are understandable
          without extra explanation.
        2: |
          Overall logic is understandable, but one or more of the following issues appear:
          some parent–child links feel loose or not clearly explanatory; siblings mostly follow
          a consistent principle but there are one or two exceptions (e.g., a solution mixed
          into a list of causes); or a few vague labels obscure how nodes relate.
        1: |
          Parent–child relationships are unclear; nodes feel like topic buckets rather than
          structured reasoning. Siblings mix unrelated types and levels (e.g., a cause, a solution,
          and a metric in the same group). A reader cannot easily reconstruct the argument or
          logic from the tree alone.

    - id: "actionability"
      label: "Actionability"
      definition: >
        The tree goes to an appropriate level of granularity, and leaves translate into concrete
        analysis or action.
      levels:
        3: |
          Leaves are at a level where someone could take a clear next step: run a specific analysis,
          design an experiment, or launch a discrete initiative. Depth is appropriate: far enough to
          expose real levers, not so deep that it becomes operational task management rather than
          strategic or analytical decomposition. Very few leaves are vague abstractions without
          further breakdown (e.g., "Improve culture").
        2: |
          Some branches end in actionable, well-granulated leaves; others remain too high-level
          or become too granular. Depth is uneven: certain parts of the tree are over-decomposed
          into minor tasks, while other parts stop at broad categories.
        1: |
          Most leaves are too broad (e.g., "Fix operations," "Improve marketing"), or too trivial
          (e.g., "Send reminder email") and detached from real levers, or they jump to solutions
          or tactics without adequate problem decomposition. The tree cannot be used directly to
          design a workplan or analytic plan and needs major rework.

    - id: "problem_alignment"
      label: "Problem alignment"
      definition: >
        The entire tree stays anchored to the stated problem: its scope, unit of analysis, and objective.
        Example: A tree for "reduce customer churn" that spends a lot of structure on "employee retention"
        issues would score low on problem alignment.
      levels:
        3: |
          The top problem is clearly defined (who, what, where, when), and almost every branch clearly
          contributes to understanding or solving that specific problem. Scope is respected (right
          product, segment, region, timeframe); off-scope content is minimal. Working through the tree
          as structured would plausibly move the needle on the stated problem.
        2: |
          Mostly aligned, but some branches drift into tangential or "nice-to-have" topics, or a few nodes
          implicitly assume a different scope (e.g., global vs. regional, all customers vs. a target segment).
          The tree would still help address the problem, but with some wasted or off-target work.
        1: |
          Large portions of the tree address issues clearly outside the defined problem or seem to answer
          a different problem entirely. The structure feels generic or mis-scoped (wrong customer, region,
          timeframe, or objective). Even if executed well, the work implied by the tree would not meaningfully
          solve the problem as stated.

Scoring guidance:
- Score each dimension independently from 1 to 3.
- Use the level descriptions to choose the most appropriate score.

Return JSON only.
`.trim();
