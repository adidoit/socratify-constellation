# Issue Tree AI — User Journeys & ASCII Wireframes

This doc maps the main user journeys for V1 (personal mode) and sketches a first pass of the UI with ASCII wireframes so we can align before implementation.

V1 scope: **Personal mode only** — create, refine, and persist trees; simple history; auth to unlock full details. V2 journeys are outlined briefly for future planning.

---

## 1. Personas & Modes

- **Visitor (anon):** Arrives via web, can create a tree and see a limited view. Trees are stored in local storage until signup.
- **Authenticated user:** Uses Clerk login; trees are persisted in the DB (`IssueTree`) and linked to their account; gets full tree visibility.

Modes:
- **Personal mode (V1):** Everything is scoped to “My trees” and local history.
- **Challenges/social (V2):** Challenges, scoring, sharing, and leaderboards — see section 4 for early sketches.

---

## 2. V1 Journeys (Core Experience)

### Journey 1 — First-time visitor creates a tree (anon)

Goal: Make it feel like “ChatGPT for issue trees” while keeping the user in control of the structure (AI suggests local edits only).

#### 1.1 Home (anon) → first prompt

Wireframe: **Home (V1, anon) — three-pane layout**

```
+----------------------------------------------------------------------------------+
| Issue Tree AI                                             [Sign in] [Sign up]   |
|----------------------------------------------------------------------------------|
| Sidebar (V1)         |  Tree + prompt                             |  Chat      |
|----------------------|--------------------------------------------|-----------|
|  [New Tree]          |  "What would you like to solve?"           |           |
|                      |  [ Enter your problem...           ] [Go]  |           |
|  History             |                                            |           |
|   - (empty)          |  Suggestions:                              |           |
|   - (show only       |   • Reduce customer churn for our SaaS     |           |
|      after first     |   • Improve onboarding conversion          |           |
|      tree)           |   • Increase average order value           |           |
|                      |                                            |           |
|----------------------|--------------------------------------------|-----------|
|  Sponsored by Socratify                                                  Chat  |
+----------------------------------------------------------------------------------+
```

Key interactions:
- User types a problem and hits **Go**.
- App creates a new tree with a root node whose content is the problem statement.
- Optionally, we offer an inline AI action on the root (e.g. “Suggest key drivers”) which the user can invoke if desired (this uses the inline AI + preview flow, see Journey 3).

#### 1.2 Initial tree view

Wireframe: **Tree view (V1, anon, first load) — with chat pane**

```
+----------------------------------------------------------------------------------+
| Issue Tree AI                                             [Sign in] [Sign up]   |
|----------------------------------------------------------------------------------|
| Sidebar               |  Tree canvas                               |  Chat      |
|-----------------------|--------------------------------------------|-----------|
|  [New Tree]           |  Problem: "Reduce customer churn by 20%"   |           |
|                       |                                            |  [AI chat |
|  History              |  [Root: Reduce customer churn by 20%]      |   panel   |
|   - Today 10:04  (*)  |        /      |       \                    |   here]   |
|                       | [Driver A] [Driver B] [Driver C]           |           |
|-----------------------|--------------------------------------------|-----------|
|  Sponsored by Socratify                                                  Chat  |
+----------------------------------------------------------------------------------+
```

Notes:
- First tree is auto-saved to **local history** (anon): sidebar shows a single item with a timestamp and short title.
- Tree canvas is powered by ReactFlow or similar; each node is clickable.
 - Each node shows inline actions (manual + AI) when hovered.

#### 1.3 Expand a branch (progressive, user-driven with optional AI help)

Interaction:
- User manually adds child/sibling nodes using the existing controls (keyboard or buttons), and/or:
  - Clicks an inline **AI** button on a node (e.g. “Suggest children here”, “Improve this label”).
- When AI is invoked:
  - The app sends the current tree + target node + requested operation to the backend.
  - The response is a **pending suggestion** (e.g. proposed children); the tree is not yet mutated.
- The UI shows a small suggestion card attached to that node with:
  - Proposed labels/structure.
  - `[Accept] [Edit then accept] [Discard]` actions.
- On **Accept**, the tree is updated and history is refreshed; on **Discard**, nothing changes.

### Journey 2 — History & revisit (anon to authed)

Goal: Let users revisit recent trees, then encourage signup to unlock full details.

#### 2.1 Return visit (anon) with local history

Wireframe: **Home with history (anon) — three-pane**

```
+----------------------------------------------------------------------------------+
| Issue Tree AI                                             [Sign in] [Sign up]   |
|----------------------------------------------------------------------------------|
| Sidebar               |  Main content                                            |
|-----------------------|----------------------------------------------------------|
|  [New Tree]           |  "What would you like to solve?"                         |
|                       |  [ Enter your problem statement...                ] [Go] |
|  History              |                                                          |
|   - Churn problem     |                                                          |
|   - Onboarding funnel |                                                          |
|   - Pricing strategy  |                                                          |
|-----------------------|----------------------------------------------------------|
|  Sponsored by Socratify                                                         |
+----------------------------------------------------------------------------------+
```

Interaction:
- Clicking a history item loads that tree into the main canvas.

#### 2.2 History item → tree view

Exactly the same tree view as 1.2, but loaded from local or DB.

### Journey 3 — Auth gate for full details

Goal: Use the tree itself as the signup incentive: anon users see a **limited** version; full depth/details require signup.

#### 3.1 Anonymous user triggers a gated action

Possible gated actions (configurable):
- Expanding beyond a certain depth (e.g. level 2).
- Viewing rubric-based quality feedback (later in V1.x or V2).

Wireframe: **Auth gate modal**

```
+----------------------------------------------------------------------------------+
| Issue Tree AI                                                                   |
|----------------------------------------------------------------------------------|
| [Tree canvas in background, blurred]                                            |
|                                                                                |
|                  +----------------------------------------+                     |
|                  |  Sign up to unlock full trees         |                     |
|                  |----------------------------------------|                     |
|                  |  Create a free account to:            |                     |
|                  |   • Expand all levels of your trees   |                     |
|                  |   • Save history across devices       |                     |
|                  |   • (Future) Compete on challenges    |                     |
|                  |                                        |                     |
|                  |  [Continue with Google]               |                     |
|                  |  [Continue with email]                |                     |
|                  |  [Sign in instead]                    |                     |
|                  +----------------------------------------+                     |
+----------------------------------------------------------------------------------+
```

Interaction:
- User completes Clerk signup/sign-in.
- On success, we:
  - Link any local trees to the new `userId` (migration).
  - Reload the same tree, now with full access.

### Journey 4 — Authenticated user workflow

Goal: Smooth day-to-day experience for logged-in users.

#### 4.1 Authenticated home

Wireframe: **Home (authed)**

```
+----------------------------------------------------------------------------------+
| Issue Tree AI                                      [User avatar] [⋮ menu]       |
|----------------------------------------------------------------------------------|
| Sidebar               |  Main content                                            |
|-----------------------|----------------------------------------------------------|
|  [New Tree]           |  "What would you like to solve?"                         |
|                       |  [ Enter your problem statement...                ] [Go] |
|  History              |                                                          |
|   - Churn problem (*) |                                                          |
|   - Onboarding funnel |                                                          |
|   - Pricing strategy  |                                                          |
|   - ...               |                                                          |
|-----------------------|----------------------------------------------------------|
|  Sponsored by Socratify                                                         |
+----------------------------------------------------------------------------------+
```

Behavior:
- History is now backed by DB (`IssueTree` records); we fetch the last N trees for this `userId`.
- “New Tree” resets the main panel to a fresh prompt.

---

### Journey 3 — Inline AI suggestion with preview + accept

Goal: Let users use AI as a precise copilot for local edits, never silently rewriting the whole tree.

#### 3.1 Invoke AI from a node

Wireframe (zoomed-in around one node):

```
         [ Node: "Costs are increasing" ]
         [L1 • Key Driver]      (⋯ inline controls)
                       [AI ▾]

  On hover over [AI ▾] → menu:
    • Suggest children here
    • Suggest a sibling
    • Improve this label
    • Restructure this level
```

Interaction:
- User chooses an operation from the inline AI menu.
- Node shows a small loading indicator while waiting for the suggestion.

#### 3.2 Suggestion UI

Wireframe: **Suggestion card**

```
          [ Node: "Costs are increasing" ]

                ┌───────────────────────────────────────┐
                │ AI suggestion: Children               │
                │---------------------------------------│
                │  • "Cloud infrastructure costs"       │
                │  • "Support headcount"                │
                │  • "Sales incentives"                 │
                │                                       │
                │  [Accept] [Edit then accept] [Discard]│
                └───────────────────────────────────────┘
```

Behavior:
- Only after **Accept** do we mutate the tree (add children/sibling/update label).
- `Edit then accept` pre-populates a small inline editor so the user can tweak labels before applying.
- Only one suggestion can be pending per tree; the user must accept/discard it before requesting another structural change.

#### 3.3 Chat-originated changes

From the right-hand chat pane, the user can ask:
- “Give me three more drivers under ‘Revenue is decreasing’.”
- “Make the level 1 branches more MECE.”

Behavior:
- The backend interprets this as a single structured operation (same schema used for inline AI).
- The chat UI surfaces the suggestion (text explanation + a summary) and triggers the same **suggestion card** on the relevant node.
- The tree still only changes after explicit **Accept**.

#### 4.2 Tree view (authed)

Same as anon, but:
- No gating for depth (within reasonable limits).
- “Rename tree” option (edit title shown in history).
- Potential “Duplicate tree” or “Save as new” actions (future).

---

## 3. V1.2–V1.3: Persistence & Auth Details (IA)

This section ties journeys to the sidebar nav defined in the spec.

Wireframe: **V1 sidebar IA**

```
Sidebar (V1)
------------
[New Tree]

History
  - {Tree title A}
  - {Tree title B}
  - {Tree title C}

// V2 will add:
// Shared with Me
// Gallery
// Leaderboard
```

Notes:
- Clicking **New Tree** always takes you back to the “ChatGPT-like” prompt view.
- History entries load existing trees in-place (no new page).
- There is no separate “My account” section in V1; account actions live in a top-right menu.

---

## 4. V2 Preview Journeys (Challenges & Social)

Not in V1 build scope, but included here to ensure V1 layouts leave space for these flows.

### Journey 5 — Challenge attempt (V2.0)

#### 5.1 Challenges list

Wireframe: **Challenges (V2.0)**

```
+----------------------------------------------------------------------------------+
| Issue Tree AI                                      [User avatar] [⋮ menu]       |
|----------------------------------------------------------------------------------|
| Sidebar               |  Main content                                            |
|-----------------------|----------------------------------------------------------|
|  [New Tree]           |  Challenges                                              |
|  History              |  -----------------------------------------------------   |
|  Shared with Me (V2)  |  [ Challenge: Reduce churn in 6 months ] [Play]         |
|  Gallery (V2)         |  [ Challenge: Fix onboarding drop-off ]   [Play]        |
|  Leaderboard (V2)     |  [ Challenge: Grow NPS to 60+ ]           [Play]        |
|-----------------------|----------------------------------------------------------|
|  Sponsored by Socratify                                                         |
+----------------------------------------------------------------------------------+
```

#### 5.2 Challenge play screen

Wireframe: **Challenge play**

```
+----------------------------------------------------------------------------------+
| Challenge: Reduce churn in 6 months                     [Back to challenges]    |
|----------------------------------------------------------------------------------|
| Problem (fixed):                                                                     |
|  "Our B2B SaaS churn has risen to 10% annual. How can we reduce it to 5%?"         |
|----------------------------------------------------------------------------------|
|  [Tree canvas — same interaction pattern as V1]                                    |
|                                                                                   |
|  [Submit attempt]   [Reset]                                                       |
+----------------------------------------------------------------------------------+
```

After submit:
- Backend runs rubric evaluation → `IssueTreeAssessment`.
- We show a score summary and optional qualitative feedback.

### Journey 6 — Leaderboard & scoring (V2.0–V2.1)

Wireframe: **Per-challenge leaderboard**

```
+----------------------------------------------------------------------------------+
| Challenge: Reduce churn in 6 months                     [Back to challenges]    |
|----------------------------------------------------------------------------------|
| Leaderboard (top 10)                                                               |
|----------------------------------------------------------------------------------|
|  Rank | User        | Score | Attempts | Last updated                             |
|  -----+-------------+-------+----------+---------------------------------------- |
|   1   | @alice      |  14   |   3      | 2h ago                                   |
|   2   | @bob        |  13   |   1      | 1d ago                                   |
|   3   | @charlie    |  13   |   4      | 3d ago                                   |
|  ...                                                                         ... |
+----------------------------------------------------------------------------------+
```

Wireframe: **Global XP view (V2.1)**

```
+----------------------------------------------------------------------------------+
| Global XP leaderboard                                                            |
|----------------------------------------------------------------------------------|
|  Rank | User        | XP   | Challenges played                                  |
|  -----+-------------+------+---------------------                                |
|   1   | @alice      |  320 |  15                                               |
|   2   | @bob        |  270 |  10                                               |
|   ...                                                                       ... |
+----------------------------------------------------------------------------------+
```

---

## 5. Open Questions to Align

- **Depth gating:** At what depth (or number of expansions) should anon users be gated to sign up?
- **History limits:** Max number of trees in sidebar (e.g. last 10 / 20)? Do we truncate or paginate?
- **Tree editing:** In V1, do we allow renaming nodes / manual edits, or is it AI-only generation + expansion?
- **Rubric timing:** For V1, do we surface any rubric-derived hints (e.g. “Try to make siblings more MECE”) or keep rubric entirely V2-only?
