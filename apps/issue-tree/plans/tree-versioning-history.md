# Tree Versioning & History (Repo-Aware Plan)

Goal: allow users to see a **history of changes** for each issue tree and restore previous versions (“time travel”), in a way that fits the current data model and UI.

This doc describes required data model changes, backend APIs, frontend UX, and open design questions.

---

## 1. Current State in Repo

- **Data model**
  - `prisma/schema.prisma` defines:
    - `IssueTree`: core persisted tree.
    - `IssueTreeAssessment`: rubric outputs.
  - `plans/data-model.md` proposes a `TreeRevision` model, but it is **not implemented** in `prisma/schema.prisma`.

- **Persistence behavior**
  - `lib/issueTrees.ts`:
    - `createIssueTree` inserts a single `IssueTree`.
    - `updateIssueTreeTreeJson` overwrites `IssueTree.treeJson` directly.
  - `IssueTreeEditor`:
    - Calls `saveTree` (PATCH `/api/issue-trees/[id]`) on updates, which uses `updateIssueTreeTreeJson`.
    - There is no concept of revisions; only the latest tree is stored.

- **UI**
  - `AppShell` + `Sidebar` show a **history of trees** per user/anon client (`/api/issue-trees`).
  - There is no per-tree revision/history UI yet.

---

## 2. Data Model Changes

### 2.1 Add `TreeRevision` Model

Implement the conceptual model from `plans/data-model.md`:

```prisma
model TreeRevision {
  id          String   @id @default(cuid())

  issueTreeId String
  issueTree   IssueTree @relation(fields: [issueTreeId], references: [id])

  treeJson    Json
  label       String?   // optional: "Before AI restructure on L1"

  createdAt   DateTime @default(now())

  @@index([issueTreeId, createdAt])
}
```

Notes:

- This is a **snapshot** model — each row contains a full copy of the tree JSON at some point in time.
- Backfill:
  - Optional – existing `IssueTree` rows can remain without revisions.
  - If desired, a one-off script can create an initial revision per tree using current `treeJson`.

### 2.2 Optional Metadata on `IssueTree`

Not required for V1, but consider:

- `lastRevisionAt DateTime?`
- `revisionsCount Int?`

These can power UX hints (“Last changed 3 hours ago”) but can also be computed from `TreeRevision` when needed.

---

## 3. Backend Behavior

### 3.1 Creating Revisions on Save

1. **Update `updateIssueTreeTreeJson`**
   - Before updating the tree, fetch current state and create a revision:
     ```ts
     export async function updateIssueTreeTreeJson(
       id: string,
       treeJson: IssueTreeJson,
       options?: { revisionLabel?: string }
     ): Promise<IssueTree> {
       return prisma.$transaction(async (tx) => {
         const existing = await tx.issueTree.findUnique({ where: { id } });
         if (!existing) throw new Error("IssueTree not found");

         await tx.treeRevision.create({
           data: {
             issueTreeId: id,
             treeJson: existing.treeJson as any,
             label: options?.revisionLabel ?? null,
           },
         });

         return tx.issueTree.update({
           where: { id },
           data: { treeJson: treeJson as any },
         });
       });
     }
     ```
   - Consider throttling (see below) to avoid excessive revisions.

2. **Frequency / Throttling**
   - `IssueTreeEditor` calls `saveTree` on many small edits.
   - To avoid a revision on every keystroke:
     - Option A: add a simple time-based guard in `updateIssueTreeTreeJson`:
       - Only create a `TreeRevision` if the last one for this tree is older than N seconds (e.g., 30s).
     - Option B: introduce an explicit `saveRevision` method and only call it when:
       - AI suggestions are accepted.
       - Certain explicit actions occur (e.g., node deletion).
     - Option C: a combination — auto-snapshots plus optional labeled snapshots for major events.

### 3.2 Revision APIs

Add routes under `app/api/issue-trees/[id]/revisions`:

1. **List revisions**
   - `GET /api/issue-trees/:id/revisions?limit=50`:
     - Returns revisions ordered by `createdAt DESC`.
     - Shape:
       ```ts
       type TreeRevisionSummary = {
         id: string;
         createdAt: string;
         label: string | null;
       };
       ```

2. **Get a specific revision**
   - `GET /api/issue-trees/:id/revisions/:revisionId`:
     - Returns full data:
       ```ts
       type TreeRevisionDetail = {
         id: string;
         issueTreeId: string;
         treeJson: IssueTreeJson;
         label: string | null;
         createdAt: string;
       };
       ```

3. **Restore a revision**
   - `POST /api/issue-trees/:id/revisions/:revisionId/restore`:
     - Fetch revision by `revisionId`.
     - Use `updateIssueTreeTreeJson` to set `IssueTree.treeJson` to `revision.treeJson`, with an appropriate `revisionLabel` (e.g., “Restore from revision yyyy-mm-dd hh:mm”).
     - Return the updated `IssueTree` (or just `treeJson`).
   - This automatically creates a new `TreeRevision` capturing the pre-restore state.

4. **Auth / ownership**
   - Once Clerk auth is wired:
     - All revision endpoints should ensure the current user owns the tree.
   - For anon trees (`anon:clientId`), keep behavior consistent with existing `/api/issue-trees` routes.

---

## 4. Frontend / UX

### 4.1 Revision Timeline UI

1. **Entry point**
   - In `IssueTreeEditor` header, near “Share” and “Export”, add a control:
     - e.g., a clock/history icon labeled “History”.
   - Clicking opens a side panel or bottom drawer:
     - On desktop, right-side panel is likely more natural.

2. **Panel contents**
   - Fetch revision summaries from `GET /api/issue-trees/:id/revisions`.
   - Display a list:
     - Timestamp (relative time, e.g., “3m ago”).
     - Optional label (“AI: restructure children under ‘Revenue is decreasing’”).
     - Actions:
       - “View” (preview tree at that revision).
       - “Restore” (with confirmation).

3. **Preview behavior**
   - Option A (simplest):
     - On clicking “View”:
       - Fetch the revision detail.
       - Temporarily replace `rootNode` in `IssueTreeEditor` with the revision’s `treeJson`.
       - Show a banner: “Viewing revision from [timestamp]. [Restore this version] [Back to latest]”.
       - Store current tree in memory so we can switch back without round-trips.
   - Option B:
     - Render a read-only preview of the historical tree in the panel without replacing the main canvas (higher complexity).

### 4.2 Restoring a Revision

1. **Flow**
   - User clicks “Restore this version”.
   - Show a modal: “Replace current tree with this revision? You can still go back using history.”
   - On confirm:
     - Call `POST /api/issue-trees/:id/revisions/:revisionId/restore`.
     - Update `rootNode` with the returned `treeJson`.
     - Close the preview / banner and show the updated tree.

2. **Interaction with unsaved edits**
   - Because `IssueTreeEditor` currently saves on every edit, there is no concept of “unsaved” vs “saved”.
   - Before previewing or restoring a revision, `updateIssueTreeTreeJson` will already have created a snapshot for the current state (assuming we keep the auto-revision behavior).

### 4.3 Labeling Revisions

1. **Automatic labels**
   - For major events (e.g., AI suggestion accepted), pass a `revisionLabel` into `saveTree`:
     - E.g., when `handleAcceptSuggestion` applies a `restructureChildren` suggestion:
       - Call `saveTree` with options:
         - `revisionLabel: "AI: restructure children under 'Costs are increasing'"`.
   - For manual edits (typing), labels can be left `null` or set to generic “Autosave”.

2. **User-editable labels (optional)**
   - In the history panel, allow editing labels for specific revisions.
   - Requires a simple `PATCH /api/issue-trees/:id/revisions/:revisionId` endpoint to update the `label`.

---

## 5. Open Design Questions (Versioning)

- **Revision granularity**
  - Do we want:
    - Fine-grained revisions (every 10–30 seconds or every noteworthy change), or
    - Coarser checkpoints (e.g., only when AI operations are accepted or when the user explicitly clicks “Save revision”)?

- **Storage vs usability tradeoff**
  - Full-tree snapshots are simple but can grow quickly:
    - What’s an acceptable retention window (e.g., last N revisions, last 7 days)?
    - Should we prune old revisions automatically?

- **Anon vs authed users**
  - When an anonymous user later signs up and their trees are migrated to a real `userId`:
    - Do we migrate the associated revisions as well?
    - Should older anon revisions be visible to the now-authed user, or do we treat them as ephemeral?

- **Diff visualization**
  - Is a simple “time travel by snapshot” UX enough, or do we eventually want:
    - A visual diff between two revisions (e.g., highlighting added/deleted nodes)?
    - If yes, what’s the simplest representation that feels useful without a full diff engine?

- **Interaction with future collaborative features**
  - When multiple users can edit the same tree (future V2+):
    - Do revisions need authorship metadata (`createdByUserId`)?
    - Do we need branching/merging concepts, or is linear history sufficient?


