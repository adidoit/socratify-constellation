# Forking Issue Trees (Repo-Aware Plan)

Goal: allow users to create a **new issue tree based on an existing one** (“fork”), preserving lineage so that both the backend and UI can show where a tree came from.

This doc covers schema updates, backend routes, UI integration, and open questions.

---

## 1. Current State in Repo

- **Data model**
  - `IssueTree` in `prisma/schema.prisma`:
    - `id`, `userId`, `title`, `description`, `treeJson`, `isExample`, `source`, `challengeId`, timestamps.
    - No field for “forked from” yet.
  - Trees are grouped per user/anon client via `userId` (`anon:${anonClientId}`).

- **API**
  - `POST /api/issue-trees` (`app/api/issue-trees/route.ts`):
    - Creates a new tree (from landing page problem input or default).
  - `GET /api/issue-trees`:
    - Lists recent trees for the current user/anon client.
  - `PATCH /api/issue-trees/[id]`:
    - Updates the `treeJson` for a specific tree.

- **UI**
  - `IssueTreeEditor` header has:
    - “Share” (copy URL).
    - “Export” (export PNG).
  - `Sidebar` lists trees with history; clicking opens them.
  - No “fork/duplicate” controls yet.

---

## 2. Data Model Changes

### 2.1 Add `forkedFromId` Self-Relation

Extend the `IssueTree` model:

```prisma
model IssueTree {
  id          String   @id @default(cuid())
  // existing fields ...

  forkedFromId String?
  forkedFrom   IssueTree? @relation("Forks", fields: [forkedFromId], references: [id])
  forks        IssueTree[] @relation("Forks")
}
```

Notes:

- `forkedFromId` is nullable:
  - `null` = original tree.
  - non-null = tree was forked from another `IssueTree`.
- `source` can still be used alongside this (`"user"`, `"seed"`, `"fork"`, etc.) but the self-relation is the canonical link.

### 2.2 Optional Metadata

- If needed later, add:
  - `metadata Json?` for additional origin details, e.g.:
    - `{ originType: "fork", originRevisionId: "..." }`.
  - For the first iteration, `forkedFromId` is adequate.

---

## 3. Backend Behavior

### 3.1 Fork Endpoint

Add a new API route:

- `POST /api/issue-trees/:id/fork`

Behavior:

1. Fetch source tree by `id`:
   - Error 404 if not found.
2. Determine `userId` for the new tree:
   - For now, mirror existing logic:
     - If we have real auth later, use the authed user’s ID.
     - For anonymous users, use `anon:${anonClientId}` (passed in body or from headers).
3. Create new `IssueTree`:
   ```ts
   const forked = await prisma.issueTree.create({
     data: {
       title: source.title,              // or "Copy of …" if preferred
       description: source.description,
       treeJson: source.treeJson as any,
       userId: newUserId,
       source: "fork",
       forkedFromId: source.id,
     },
   });
   ```
4. Return minimal data to the client:
   - `{ id: forked.id, title: forked.title, createdAt: forked.createdAt }`
   - Or full tree if we want to avoid an extra fetch.

### 3.2 Fork from Revision (Optional Extension)

If tree history (`TreeRevision`) is implemented:

- Add `POST /api/issue-trees/:id/revisions/:revisionId/fork`:
  - Fetch revision.
  - Create new `IssueTree` with `treeJson` from the revision.
  - `forkedFromId`:
    - Could still point to the base `IssueTree` (`issueTreeId` from the revision).
    - If we add richer metadata, we can store `originRevisionId` as well.

### 3.3 History Refresh

After a successful fork:

- Either:
  - Let the client call `GET /api/issue-trees` again to refresh the sidebar, or
  - Have the client optimistically append the new tree to the local `history` array in `AppShell`.

Given that `AppShell` owns `history` state, the editor component can:

- Navigate to the new tree (`router.push`), and
- Rely on `AppShell` to refetch history on route change, or
- Use a lightweight pub/sub (React context or event) to push the new item into history immediately.

---

## 4. Frontend / UX

### 4.1 Where to Expose “Fork”

1. **Editor header**
   - In `IssueTreeEditor` header (currently showing title, subtitle “Issue tree”, “Share”, “Export”):
     - Add a new button:
       - Icon: branching/fork icon.
       - Label: “Fork tree”.

2. **Sidebar history list**
   - Optional enhancement:
     - Add a context menu (⋯) per history item with actions:
       - “Open”.
       - “Fork”.

### 4.2 Fork Flow

1. **User clicks “Fork tree”**
   - Show a short confirmation dialog or inline toast (“Create a new tree based on this one?”).
   - On confirm:
     - Call `POST /api/issue-trees/:id/fork`.
2. **On success**
   - Navigate to the new tree:
     - `router.push(/t/${newId})`.
   - Optionally:
     - Optimistically add the new tree to `history` in `AppShell`, or rely on a refetch.

### 4.3 Displaying Lineage

1. **In the editor**
   - Under the title (where “Issue tree” is shown), if `forkedFromId` is set:
     - Show: `Forked from "<sourceTitle>"` as a small link to `/t/:forkedFromId`.
   - Source title:
     - Can be fetched lazily via an extra `GET /api/issue-trees/:id` or included in the fork response.

2. **In the sidebar**
   - Optional label or subtle visual hint for forked trees:
     - e.g., a small branch icon or “Fork” badge.

---

## 5. Open Design Questions (Forking)

- **Semantics of a fork**
  - Is a fork simply a personal copy, or does it always imply some visible relationship in future social features (gallery, challenge submissions)?
  - When we introduce sharing/gallery:
    - Should viewers see a “Forked from …” chain similar to GitHub’s fork network?

- **Auth & ownership**
  - When forking someone else’s tree (after sharing exists):
    - Does the new fork always belong to the forking user, regardless of the source’s ownership?
  - Should the original author be visible somewhere (e.g., in metadata) in the forked copy?

- **Interaction with history**
  - When forking:
    - Should we treat the entire source history as part of this tree’s “backstory” or start with a clean history?
    - If we bring over history:
      - How do we differentiate “pre-fork” vs “post-fork” revisions?

- **Fork from revision vs fork from current**
  - Do we need a clear UX path for “fork from this specific historical version” or is forking from the current state enough for V1?
  - If we support forking from revisions, how do we show that in lineage? (e.g., `Forked from "<title>" @ revision <timestamp>`).


