# Issue Tree AI — Product Specification

---

## 1. Product Overview

### Vision

Issue Tree AI is "ChatGPT for issue trees": enabling users to create, refine, and improve issue trees with AI.

### Modes

- **Personal Mode:** Private tree creation, persistence, and iterative refinement—mirroring the conversational/chat paradigm of [ChatGPT.com](http://ChatGPT.com).
- **Social/Competitive Mode:** Compete on tree-building for given problems; includes sharing, discovery, and leaderboards (_targeted for V2_).

---

## 2. Roadmap (Phased)

### V1 – Core Experience

Focus: Validate core tree creation & refinement UX.

#### V1.0 – Foundation

- Next.js, Prisma, Neon setup
- Devin-ready dev environment
- Basic UI with home screen
- Input: Problem → user-defined root node (optionally with AI-suggested first-level drivers; no full auto-generated tree)

#### V1.1 – Core Interactions

- Manual node editing (add child/sibling, delete, rename)
- Inline AI assistance per node (suggest children/siblings, improve labels, restructure a level)
- Preview + accept flow for AI suggestions (no direct, silent mutations)
- Basic tree persistence (local/session)

#### V1.2 – Persistence & History

- Database models (issue trees)
- Sidebar: Saved tree history
- Anonymous local storage

#### V1.3 – Authentication

- Clerk (shared across [Socratify.com](http://Socratify.com))
- Signup required for full tree details
- Link trees to users

> **Out of scope for V1:** Sharing, gallery, leaderboards, "social" features

### V2 – Sharing & Social

Focus: Tree sharing, collaboration, and competition

**Key Features:**

- Private share links (read-only)
- "Shared with me" + fork to personal history
- Public gallery for tree discovery
- Leaderboards & trending
- XP/scoring system
- OG image generation (for social cards)

---

## 3. User Experience

### Home

- Similar to ChatGPT: single prompt field ("What would you like to solve?") + suggestions.
- Entering a problem creates a new tree with a root node using the user’s text.
- Optionally offer an inline AI action to suggest first-level drivers under the root (still preview + accept).

### Tree Creation Flow

1. User enters problem
2. App creates a root node with that problem statement
3. User builds out the tree by:
   - Manually adding/editing nodes, and/or
   - Using **inline AI actions** (per-node) to suggest children/siblings or restructure a level (always one local operation at a time, with preview + accept)
4. A right-hand chat pane lets the user discuss the tree with AI; any structural changes proposed via chat still go through the same preview + accept mechanism
5. Full details and deeper interactions are gated behind signup as needed

---

## 4. Information Architecture

### Sidebar (Navigation)

- **V1:** New, History (left sidebar) + Tree canvas (center) + Chat pane (right)
- **V2:** + Shared with Me (with forking), Gallery, Leaderboard

---

## 5. Design & Branding

### Visual Identity

- **Colors/Style:** Inherit from [Socratify.com](http://Socratify.com) for brand consistency
- **Logo:** Simple one-level issue tree motif
- **Brand Banner:** "Sponsored by Socratify" (e.g. bottom of home, top of issue tree build page)

---

### Social Sharing (V2)

#### Open Graph (OG) Image Strategy

- **Layout:**

  - **Main:** Problem (big bold text, centered/left)
  - **BG:** Issue tree viz at low opacity (right or behind text)
  - **Brand:** [issuetree.ai](http://issuetree.ai) bottom-left

- **Implementation Options:**

  - **A. Dynamic images:** via Vercel OG (@vercel/og) or Satori
    - Pros: Up to date, no storage
    - Cons: First-load render cost, tree layout logic
  - **B. Pre-render on save:** store on S3/etc.
    - Pros: Instant load, richer styles
    - Cons: Storage, regeneration on edits

- **Visual Style Ideas:**

  - ASCII tree for techy look
  - Minimalist line-art
  - Gradient with tree overlay

- **Example (ASCII concept):**

  ```
  ┌─────────────────────────────────────────────────────┐
  │                                                     │
  │   "How can we reduce                    ┌───┐      │
  │    customer churn by 20%?"         ┌────┤   │      │
  │                                    │    └───┘      │
  │                               ┌────┤               │
  │                               │    │    ┌───┐      │
  │                          ┌────┤    └────┤   │      │
  │                          │    │         └───┘      │
  │                          └────┤                    │
  │                               │    ┌───┐           │
  │                               └────┤   │           │
  │   [issuetree.ai](http://issuetree.ai)                     └───┘           │
  └─────────────────────────────────────────────────────┘
  ```

- **Recommendation:** Start with Option A (dynamic Vercel OG images); use a stylized/simplified tree graphic.

---

## 6. Technical Stack

| Area          | Choice                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework** | Next.js                                                                                                                                                    |
| **Database**  | Neon (Postgres) — see `plans/data-model.md` for schema overview                                                                                            |
| **ORM**       | Prisma (schema aligned with `plans/data-model.md`)                                                                                                         |
| **Auth**      | Clerk (shared with [Socratify.com](http://Socratify.com))                                                                                                  |
| **AI & UI**   | AI SDK v5 (including `generateObject`), AI Elements for chat/inline UX, shadcn/ui, existing custom tree renderer (React-based)                             |
| **Dev**       | - One-command local start (`pnpm dev`)<br>- `.env.example` with docs<br>- Seed scripts<br>- README setup<br>- Docker Compose for Neon/Postgres (if needed) |

---

## 7. AI Interaction Principles (V1)

- **User-driven structure:** The user is the primary editor; AI only suggests localized changes (no full-tree regeneration).
- **Scoped operations:** Each AI action operates on a specific node or level (e.g. "suggest children here", "add a sibling", "rewrite this label", "restructure this level").
- **Preview + accept:** AI suggestions are shown in the UI and must be explicitly accepted before they mutate the tree.
- **Single operation at a time:** At most one pending AI suggestion exists per tree; users must accept or discard it before requesting another structural change.
- **Unified behavior:** Whether invoked inline on a node or via the chat pane, AI-driven changes use the same underlying operation schema and preview + accept flow.

---

## 8. Authentication Strategy

### Goal

Single identity across Socratify & Issue Tree AI

### Approaches

- **A. Multi-domain, single Clerk app** (recommended for V1.3)

  - Add issuetree.ai to Socratify's Clerk app
  - _Pros:_ SSO, seamless UX
  - _Cons:_ Shared user base/coupling

- **B. Separate Clerk app, link via email/OAuth**
  - _Pros:_ Isolation, can diverge later
  - _Cons:_ No true SSO, complex UX

### Implementation Notes

- Configure Clerk multi-domain
- Redirect URLs support both domains
- Cross-subdomain/session as needed

---

## 9. Future Considerations

- Multiplayer/collaborative editing

---

## Appendix: Issue Tree Quality Rubric

```yaml
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

  scoring_guidance:
    notes: |
      Dimensions are related but not identical and should be scored independently.
      For example:
        - A tree can be high on "mutually exclusive" and "collectively exhaustive" but low on
          "logical coherence" if categories are arbitrary.
        - A tree can be logically coherent but low on "actionability" if it stops at high-level
          themes and never gets to actionable leaves.
        - A tree can be MECE and actionable but low on "problem alignment" if it is aimed at
          the wrong product, region, or underlying problem.
```
