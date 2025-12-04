# Issue Tree AI — Inline AI (V1) Specification

This doc defines how inline AI assistance works in V1: what operations are allowed, how responses are shaped, and how the preview + accept flow behaves in the UI.

The overarching principle: **the user is always in control of the tree**. AI can only propose localized changes that the user explicitly accepts.

---

## 1. Scope & Constraints

- No full-tree generation or regeneration.
- All AI operations are:
  - **Local** to a node or a level.
  - **Single-step** (one operation per request).
  - **Previewed** before they mutate the tree.
- There can be **at most one pending suggestion per tree** at a time.
- Inline AI and chat-driven AI use the **same operation schema**; only the entry point differs.

---

## 2. Operation Schema (Conceptual)

Requests to the AI route carry:

- The **current tree** (`IssueTreeJson`, see `schema/issueTree.ts`).
- A **target node** (`targetNodeId`).
- A **requested operation type**.
- Optional operation-specific parameters.

Conceptual request shape:

```ts
type IssueTreeAiOperationType =
  | "suggestChildren"
  | "suggestSibling"
  | "rewriteLabel"
  | "restructureChildren";

type IssueTreeAiRequest = {
  tree: IssueTreeJson;
  targetNodeId: string;
  operation: {
    type: IssueTreeAiOperationType;
    // Optional hints, e.g. maxChildren, tone, etc.
    params?: Record<string, unknown>;
  };
};
```

Responses are **pure suggestions**, not patches. The client is responsible for turning them into real `IssueNode`s after user acceptance.

Conceptual response shape:

```ts
type LlmProposedNode = {
  content: string;
  type?: NodeType; // optional; fallback logic exists
};

type IssueTreeAiSuggestion =
  | {
      type: "suggestChildren";
      targetNodeId: string;
      proposedChildren: LlmProposedNode[];
    }
  | {
      type: "suggestSibling";
      targetNodeId: string;
      proposedSibling: LlmProposedNode;
    }
  | {
      type: "rewriteLabel";
      targetNodeId: string;
      proposedContent: string;
    }
  | {
      type: "restructureChildren";
      targetNodeId: string;
      // Same depth; model proposes a revised list of children
      proposedChildren: LlmProposedNode[];
    };
```

The actual implementation will use Zod schemas both for:
- Validating `IssueTreeAiRequest`.
- Validating and parsing `IssueTreeAiSuggestion` from the model (`generateObject`).

---

## 3. Backend API Shape

### 3.1 Route

- `POST /api/issue-tree-edit`

Input:
- Accepts `IssueTreeAiRequest`.
- Validates and normalizes the tree using `issueTreeSchema` and `toLlmIssueTree`.

Output:
- Returns an `IssueTreeAiSuggestion` JSON payload.
- May also include a human-readable explanation string for the chat pane, but the **tree change** is always expressed as a structured `IssueTreeAiSuggestion`.

### 3.2 Model Prompting

- Use `generateObject` (AI SDK v5) with:
  - System prompt: explain the local, one-operation constraint and forbid full-tree rewrites.
  - Schema: Zod equivalent of `IssueTreeAiSuggestion`.
- Always provide:
  - The **current tree** in LLM-optimized form (`toLlmIssueTree`).
  - The **target node path** and content.
  - The **requested operation type** and any params.

---

## 4. UI States & Flows

### 4.1 Inline AI entry (NodeItem)

- Each node has an `AI` control (e.g. button or menu) that:
  - Opens a small menu with options:
    - `Suggest children here`
    - `Suggest a sibling`
    - `Improve this label`
    - `Restructure this level`
  - Triggers a call to `/api/issue-tree-edit` with the appropriate operation.
- While waiting:
  - Show a loading indicator near the node (spinner / pulsing dot).
  - Prevent further AI actions until the response resolves or fails.

### 4.2 Suggestion display (preview)

- When a suggestion returns, store a `pendingSuggestion` in page-level state, e.g.:

  ```ts
  type PendingSuggestion = {
    id: string; // local identifier
    suggestion: IssueTreeAiSuggestion;
  };
  ```

- `NodeItem` checks if there is a `pendingSuggestion` targeting its `node.id` and, if so, renders a **suggestion card** adjacent to that node:
  - Shows a summary based on `type`:
    - For `suggestChildren`: list of proposed children.
    - For `suggestSibling`: show the new sibling label.
    - For `rewriteLabel`: show old vs. new label.
    - For `restructureChildren`: show the new children set.
  - Actions:
    - `[Accept]`: apply change to the real tree.
    - `[Edit then accept]`: allow light editing of text fields, then apply.
    - `[Discard]`: drop the pending suggestion.

### 4.3 Applying suggestions

On **Accept**:
- Use existing mutation helpers in `app/page.tsx` to update `rootNode`, e.g.:
  - For `suggestChildren`: create new `IssueNode`s under `targetNodeId`.
  - For `suggestSibling`: insert a new sibling after `targetNodeId`.
  - For `rewriteLabel`: update `content` on `targetNodeId`.
  - For `restructureChildren`: replace children of `targetNodeId` with new nodes.
- Clear `pendingSuggestion`.
- Persist the updated tree (local storage or DB) as appropriate.

On **Discard**:
- Clear `pendingSuggestion` with no changes to the tree.

### 4.4 Error handling

- If the API call fails or the suggestion fails validation:
  - Show a small inline error near the node: “AI couldn’t suggest changes. Try again or edit manually.”
  - Clear any half-baked `pendingSuggestion` state.

---

## 5. Chat Pane Integration

- The right-hand chat pane uses the same backend route but with a richer message format:

  - Each user message includes:
    - The current tree (`IssueTreeJson`).
    - Natural language request (e.g. “Make the level 1 branches more MECE”).
  - The model returns:
    - A text explanation.
    - Optionally, an `IssueTreeAiSuggestion`.

- The chat UI:
  - Displays the explanation in the conversation.
  - If a suggestion is present, sets `pendingSuggestion` and highlights the affected node, which then shows the suggestion card as in the inline flow.

---

## 6. Future Extensions (Non-V1 Scope)

- Multi-step suggestion flows (e.g. “brainstorm candidates, then pick 3”).
- Suggestions that span multiple nodes (e.g. rebalancing siblings across different parents).
- “Undo last AI change” stack (requires tracking applied operations).

