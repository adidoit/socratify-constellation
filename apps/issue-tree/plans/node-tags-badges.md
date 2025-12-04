# Node Tags / Badges (Repo-Aware Plan)

Goal: allow users to attach lightweight **tags/badges** to individual nodes in an issue tree, similar to Trello labels, and persist them in the existing tree JSON so they’re available to AI and UI.

This doc details the necessary type/schema changes, UI work in `NodeItem`, and open design questions.

---

## 1. Current State in Repo

- **Node model**
  - `IssueNode` (`types.ts`) fields:
    - `id`, `content`, `type`, `children`, `parentId`, `isExpanded`.
  - No tags or badge fields.

- **Validation schema**
  - `issueNodeSchema` (`schema/issueTree.ts`):
    - Includes the above fields and calls `.passthrough()`, so extra fields in JSON are accepted at runtime.

- **UI**
  - `NodeItem` (`components/NodeItem.tsx`):
    - Renders the card for each node with:
      - Depth label (`getDepthLabel`).
      - Styling (`getNodeStyle`, depth-based typography).
      - Inline AI controls and delete button.
      - Content editable textarea/view.
  - No tags section on the card.

- **Storage**
  - `IssueTree.treeJson` is a JSON blob in the DB; it will happily store additional per-node fields.

---

## 2. Data & Type Model

### 2.1 Tag Shape

First iteration can be simple. Two options:

1. **Structured tags**
   ```ts
   export type NodeTag = {
     id: string;
     label: string;
     color?: string; // e.g. tailwind token or hex
     kind?: string;  // e.g. "status", "priority", "owner"
   };
   ```

2. **String-only tags**
   - `tags: string[]`.
   - Pros: simpler UI & schema.
   - Cons: no per-tag metadata (color, type).

Recommendation: start with **simple structured tags** so we can easily add color/kind later.

### 2.2 Update `IssueNode` Types

In `types.ts`:

- Define `NodeTag` and extend `IssueNode`:
  ```ts
  export type NodeTag = {
    id: string;
    label: string;
    color?: string;
    kind?: string;
  };

  export interface IssueNode {
    id: string;
    content: string;
    type: NodeType;
    children: IssueNode[];
    parentId: string | null;
    isExpanded: boolean;
    tags?: NodeTag[];
  }
  ```

### 2.3 Update Zod Schema (Optional but Recommended)

In `schema/issueTree.ts`:

- Either:
  - Explicitly add `tags` field to `issueNodeSchema`, or
  - Rely on `.passthrough()` and leave tags untyped at the schema level.

Explicit version (recommended):

```ts
const nodeTagSchema = z.object({
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
    .passthrough()
);
```

Notes:

- Existing stored trees without tags continue to parse correctly because `tags` is optional.
- No Prisma changes are required; tags live inside `treeJson`.

### 2.4 AI Context (Optional)

Decide whether tags should be visible to AI:

- `toLlmIssueTree` (`schema/issueTree.ts`) currently maps `IssueNode` → `LlmIssueNode` and drops internal fields.
- Options:
  - Keep tags **out of LLM view** initially (simpler).
  - Or include a simplified `tags` representation (e.g., list of labels or key-value pairs) if you want the model to respect tag semantics (“status: in-progress”, “priority: high”).

For V1 of tags, omitting them from the LLM context is acceptable.

---

## 3. Frontend / UX

### 3.1 Rendering Tags on Nodes

In `NodeItem`:

1. **Visual placement**
   - Options:
     - Beneath the node label as small pill badges.
     - Top-right of the card (similar to Trello labels).
   - Example simple styling:
     ```tsx
     {node.tags && node.tags.length > 0 && (
       <div className="mt-2 flex flex-wrap gap-1">
         {node.tags.map((tag) => (
           <span
             key={tag.id}
             className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground"
           >
             {tag.label}
           </span>
         ))}
       </div>
     )}
     ```

2. **Color handling**
   - If `tag.color` is present:
     - Map it to a Tailwind class or inline style.
     - e.g., `bg-[color]` or `style={{ backgroundColor: tag.color }}`.

### 3.2 Editing Tags

1. **Add tags**
   - Add a small “Tag” button/icon in the node header (near AI and delete controls):
     - e.g., a tag icon or “+ Tag”.
   - On click:
     - Show a small popover or inline control:
       - An input for tag label (and optionally dropdowns for color/ kind).
     - On submit:
       - Create a new `NodeTag` with `crypto.randomUUID()` as `id`.
       - Append to `node.tags`.
       - Call existing `onUpdate`/`saveTree` logic via `IssueTreeEditor`:
         - Because `IssueTreeEditor` deep-clones and saves `rootNode`, the updated tags will be persisted as part of `treeJson`.

2. **Remove tags**
   - Make each badge clickable or include a small “x” icon on hover:
     - On click:
       - Remove the tag by `id` from `node.tags`.
       - Save the updated tree.

3. **Edit tags**
   - For V1, editing might be optional:
     - Delete + re-add is acceptable.
   - If editing is desired:
     - Clicking a badge could open an inline input to edit label/color.

### 3.3 Tag Creation Model

1. **Free-form tags**
   - Initial approach:
     - Let users type any label they like.
   - Pros:
     - No extra configuration.
     - Works well for quick annotations (“Needs data”, “Follow-up”, “Owner: PM”).

2. **Predefined/tag palette (future)**
   - Later, add:
     - Pre-configured “Status” tags (“Idea”, “In progress”, “Done”).
     - Pre-configured “Priority” tags (“P1”, “P2”, “P3”).
   - These could be suggested as chips in the tag editor.

### 3.4 Keyboard & Filtering (Future)

Potential future enhancements:

- Keyboard shortcuts to open tag editor for the selected node.
- Filtering/highlighting:
  - E.g., “Highlight nodes with tag ‘P1’” or dim nodes without a specific tag.
  - Would require additional state in `IssueTreeEditor` to filter the rendered tree.

---

## 4. Backend Impact

- No changes to Prisma models are required:
  - Tags are stored completely within `IssueTree.treeJson`.
- `issueNodeSchema` already uses `.passthrough()`, so adding `tags` is low-friction.
- Revisions (`TreeRevision`), if implemented, will automatically capture tags as part of tree snapshots.

---

## 5. Open Design Questions (Tags / Badges)

- **Semantics vs cosmetics**
  - Are tags purely visual annotations, or do they carry semantics that AI and future features should respect?
  - Example semantics:
    - `status: in-progress`, `status: done`.
    - `priority: high`.
    - `owner: marketing`.

- **Global vs per-tree vocabulary**
  - Should there be a global set of tag types/colors (for consistency), or should tags be entirely free-form per tree/user?
  - If global:
    - Where do we configure them (settings, code constants, DB table)?

- **AI awareness**
  - Should tags be included in the LLM view (`toLlmIssueTree`) so that:
    - Chat can say “Focus on P1 nodes”.
    - Inline AI avoids changing nodes tagged as “locked” or similar.
  - If yes:
    - What is the minimal representation to avoid overloading the prompt?

- **Visibility / privacy**
  - In future collaborative or shared trees:
    - Are tags visible to everyone?
    - Do we need per-user tags (“my private notes”) vs shared tags?

- **Interaction with filters & layout**
  - How might tags influence tree layout or visibility (e.g., hiding nodes with certain tags, grouping by tags)?
  - This affects both UX and potential performance if filtering is frequent.

