# Chat Assistant → Structured Tree Edits (Repo-Aware Plan)

Goal: enable the floating chat (`components/FloatingChatWidget.tsx`) to propose **concrete, localized edits** to the current tree that the user can preview and accept, reusing the same mechanics as inline AI (`IssueTreeEditor` / `NodeItem` + `/api/issue-tree-edit`).

This doc focuses on what it would take in this codebase: backend, frontend, and key edge cases, plus open design questions at the end.

---

## 1. Current State in Repo

- **Inline AI operations**
  - Backed by:
    - `schema/issueTreeAiOperations.ts`
    - `lib/issueTreeAiHelpers.ts`
    - `app/api/issue-tree-edit/route.ts`
  - `IssueTreeEditor` (`components/IssueTreeEditor.tsx`) maintains:
    - `pendingSuggestion: { targetNodeId; suggestion } | null`
    - `aiLoadingNodeId`, `aiError`
    - Handlers: `handleAiOperation`, `handleAcceptSuggestion`, `handleDiscardSuggestion`, `handleEditAndAcceptSuggestion`, etc.
  - `TreeRenderer` passes these props into `NodeItem`.
  - `NodeItem` uses `AiDropdownMenu` + `SuggestionPreviewCard` to render/apply suggestions at a given node.
  - All of this uses the `IssueTreeAiSuggestion` and `IssueTreeAiResponse` schemas.

- **Chat**
  - `components/FloatingChatWidget.tsx`:
    - Maintains `messages` and `inputValue`.
    - Sends `{ prompt, tree: treeContext }` to `/api/chat`.
    - Streams plain text back and renders via `Streamdown`.
  - `app/api/chat/route.ts`:
    - Validates `prompt`.
    - Optionally parses `tree` using `issueTreeSchema` and `toLlmIssueTree`.
    - Builds a YAML + JSON context with `buildIssueTreeYaml`.
    - Calls `streamText` with `geminiModel` and returns a **pure Markdown** answer (no structured JSON).

Implication: we already have a robust **structured-edit pipeline** for inline AI; chat is currently advisory-only. The missing pieces are:

- A way for chat to request and receive `IssueTreeAiSuggestion` objects.
- A way for chat to hook into `IssueTreeEditor`’s `pendingSuggestion` mechanism.

---

## 2. High-Level Design

Introduce a second “mode” of chat responses:

- **Text-only mode** (current): streaming Markdown advice only.
- **Edit-suggestion mode**: chat returns both:
  - Natural language explanation (for chat bubble).
  - A **structured suggestion** conforming to `IssueTreeAiSuggestion` for the tree.

Key design decisions:

- Keep `/api/issue-tree-edit` as the **single source of truth** for generating structured suggestions.
- Let chat orchestrate:
  - Interpret the user’s request and, if necessary, infer which node/operation to target.
  - Call an internal helper that reuses the `issue-tree-edit` logic to produce an `IssueTreeAiSuggestion`.
  - Return that suggestion alongside a chat explanation.
- `IssueTreeEditor` exposes a hook/callback that `FloatingChatWidget` can call to set `pendingSuggestion`.

---

## 3. Backend Changes

### 3.1 Extend `/api/chat` Request/Response

1. **Request shape**
   - Extend the body to support edit hints and mode:
     ```ts
     type ChatRequestBody = {
       prompt: string;
       tree?: IssueTreeJson;
       // optional hints from client or LLM:
       targetNodeId?: string;
       operationType?: IssueTreeAiOperationType;
       mode?: "text-only" | "edit-suggestion";
     };
     ```

2. **Response shape for edit mode**
   - Define a non-streaming response type for edit mode:
     ```ts
     type ChatEditResponse = {
       mode: "edit-suggestion";
       explanation: string; // for chat bubble
       targetNodeId: string;
       operationType: IssueTreeAiOperationType;
       suggestion: IssueTreeAiSuggestion;
     };
     ```

3. **Behavior**
   - For `mode === "text-only"` or when hints are missing:
     - Preserve current streaming behavior (no breaking changes).
   - For `mode === "edit-suggestion"`:
     - Use `generateObject` instead of `streamText` **or** do a two-step LLM workflow:
       - Step 1: model interprets the prompt + tree context and outputs:
         - `{ targetNodeId, operationType, rationale }`.
       - Step 2: server invokes a shared helper (see below) that internally uses the same machinery as `/api/issue-tree-edit` to produce an `IssueTreeAiSuggestion`.
     - Return a JSON payload (`ChatEditResponse`) rather than a stream.

### 3.2 Factor Out `issue-tree-edit` Core Logic

1. **New service helper**
   - Move the core of `app/api/issue-tree-edit/route.ts` into a reusable library function, e.g. `lib/issueTreeAiService.ts`:
     ```ts
     import {
       issueTreeAiRequestSchema,
       issueTreeAiResponseSchema,
       type IssueTreeAiRequest,
       type IssueTreeAiResponse,
     } from "@/schema/issueTreeAiOperations";

     export async function generateIssueTreeSuggestion(
       input: IssueTreeAiRequest
     ): Promise<IssueTreeAiResponse> {
       // validate request
       const parsed = issueTreeAiRequestSchema.parse(input);
       // existing logic from route.ts:
       //  - getRootNode, findNodeById, getNodePath
       //  - buildIssueTreeYaml + local YAML context
       //  - generateObject with geminiModel, system prompt, response schema
       //  - return { suggestion, explanation }
     }
     ```

2. **Refactor `/api/issue-tree-edit` to use helper**
   - The route becomes a thin wrapper that:
     - Parses request.
     - Calls `generateIssueTreeSuggestion`.
     - Returns JSON or an error response.

3. **Use helper from `/api/chat`**
   - Once `/api/chat` has identified `targetNodeId` and `operationType`, it can call:
     ```ts
     const aiResponse = await generateIssueTreeSuggestion({
       tree,
       targetNodeId,
       operation: { type: operationType },
     });
     ```
   - Then wrap that into `ChatEditResponse`.

### 3.3 Guardrails & Limits

- **Single pending suggestion**
  - Currently enforced at the React layer (`pendingSuggestion` is a single value).
  - Optionally, `/api/chat` can:
    - Accept a `hasPendingSuggestion` boolean hint and short-circuit with a textual reply (“You already have a suggestion pending; accept or discard it first.”).
- **Rate limiting**
  - Edit-suggestion mode is typically more expensive than plain chat.
  - Consider per-IP or per-`anonClientId` rate limiting once usage patterns are clearer.

---

## 4. Frontend Changes

### 4.1 Connect Chat to Tree Editing Context

1. **Prop-based approach (simplest)**
   - Extend `FloatingChatWidget` props:
     ```ts
     type FloatingChatWidgetProps = {
       treeContext?: IssueTreeJson;
       selectedNodeId?: string;
       onApplySuggestion?: (payload: {
         suggestion: IssueTreeAiSuggestion;
         targetNodeId: string;
       }) => void;
     };
     ```
   - In `IssueTreeEditor`:
     - Pass `treeContext={rootNode}` (or `{ root: rootNode }`).
     - Pass `selectedNodeId` based on current editor state.
     - Implement `onApplySuggestion`:
       ```ts
       <FloatingChatWidget
         treeContext={rootNode}
         selectedNodeId={selectedNodeId}
         onApplySuggestion={({ suggestion }) => {
           setPendingSuggestion({
             targetNodeId: suggestion.targetNodeId,
             suggestion,
           });
           setSelectedNodeId(suggestion.targetNodeId);
         }}
       />
       ```

2. **Context-based alternative**
   - Introduce a `TreeEditContext` that exposes:
     - `rootNode`, `selectedNodeId`
     - `setPendingSuggestion`, `setSelectedNodeId`
   - `TreeRenderer`/`NodeItem` and `FloatingChatWidget` both consume this context.
   - This is more flexible but requires additional plumbing; prop-based approach is enough to start.

### 4.2 Chat UI for Edit Suggestions

1. **Initiating edit mode**
   - In `FloatingChatWidget`, expose a separate set of suggestion chips for structural changes, e.g.:
     - “Add children to selected node”
     - “Improve label of selected node”
     - “Restructure level below root”
   - When these are clicked, they:
     - Use `selectedNodeId` as `targetNodeId`.
     - Call `/api/chat` with `mode: "edit-suggestion"`, `targetNodeId`, and a pre-canned natural language instruction.

2. **Displaying responses**
   - For `mode: "edit-suggestion"` responses:
     - Append a chat message with `explanation`.
     - Immediately call `onApplySuggestion`, which:
       - Sets `pendingSuggestion` in the editor (showing `SuggestionPreviewCard` on the targeted node).
       - Optionally scrolls the tree canvas to that node (future enhancement).

3. **Fallback to text-only mode**
   - For free-form user prompts:
     - Stay in text-only mode by default.
     - Optionally, once we gain confidence, parse user input and decide to trigger edit mode automatically in some cases (but this is a product decision, see open questions).

### 4.3 Edge Cases & UX Details

- **Existing pending suggestion**
  - If `pendingSuggestion` is not null:
    - Disable structural chips or show a hint: “Finish the current suggestion first.”
- **Node not found when applying suggestion**
  - If the tree changed between suggestion generation and application (`findNode` returns null):
    - Show an inline error in the chat or a toast: “This suggestion no longer matches the current tree.”
    - Clear the suggestion.
- **Streaming vs non-streaming**
  - For edit mode, responses are small and non-streamed:
    - The UI can show a spinner on the chat bubble until the response lands.
  - Existing streaming behavior stays unchanged for text-only chat.

---

## 5. Open Design Questions (Chat Edits)

- **Discoverability and entry points**
  - Should edit-suggestion mode be triggered **only** via explicit buttons/chips (“Add children to selected node”) or also via free-form chat messages?
  - If free-form is allowed, how do we clearly indicate when chat is about to mutate the tree (even via preview)?

- **Granularity of suggestions**
  - Should chat be able to propose **multiple operations** in a single message (e.g., “clean up level 1 and level 2 under revenue”) or stay strictly one operation per request to match the inline constraints?
  - If multiple operations are allowed, do we:
    - Surface them as separate `pendingSuggestion`s applied sequentially, or
    - Bundle them into a “batch preview” UI (more complex)?

- **Targeting nodes**
  - Are we comfortable requiring the client to pass `selectedNodeId` for most edit requests, or do we want the model to infer a target node from natural language (“the branch about pricing”)?
  - If the model infers the target, how do we visualize which node it picked and allow the user to correct it if wrong?

- **Response format vs streaming**
  - Is it acceptable that edit-suggestion responses are **non-streaming** while normal chat is streamed?
  - If we later want streaming + structured data:
    - Should we encode structured suggestion payloads in a special marker within the stream and have the client parse them?

- **Permissions and scope**
  - Should there be any actions that chat is *not* allowed to suggest (e.g., mass deletion of branches), or is the preview + accept gate sufficient?  


