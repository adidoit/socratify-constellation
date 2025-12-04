# Issue Tree AI — Data Model (V1–V2)

This document describes the application data model across V1 (core personal experience) and V2 (challenges, rubric-based scoring, and social features). Examples use Prisma-style `model` definitions but are conceptual; the actual `schema.prisma` can evolve as needed.

---

## 1. Conventions

- `id`: `String @id @default(cuid())` unless otherwise noted.
- `userId`: String identifying a Clerk user (no separate `User` model; we rely on Clerk).
- Soft vs. hard delete: assume **hard delete** for now.
- JSON: use Prisma `Json` for flexible payloads (trees, rubric assessments, metadata).

---

## 2. V1 Core Models

V1 focuses on **personal mode**: creating, refining, and persisting issue trees, plus basic history and later authentication.

### 2.1 IssueTree (primary unit of work)

Represents a single saved issue tree (one coherent structure for a given problem).

```prisma
model IssueTree {
  id          String   @id @default(cuid())

  // Identity / ownership
  userId      String?  // null = anonymous tree (before auth), Clerk user ID once linked

  // Problem definition & labels
  title       String   // short problem statement, e.g. "Reduce churn by 20%"
  description String?  // optional longer description or context

  // Tree structure
  treeJson    Json     // matches `IssueTreeJson` (schema/issueTree.ts)

  // Metadata
  isExample   Boolean  @default(false) // seeded example trees
  source      String?  // e.g. "user", "seed", "challenge"

  // V2 linkage (optional; safe to add early as nullable)
  challengeId String?  // if derived from a challenge prompt

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  challenge   Challenge?        @relation(fields: [challengeId], references: [id])
  submissions ChallengeSubmission[]
  assessments IssueTreeAssessment[]

  @@index([userId, createdAt])
  @@index([challengeId])
}
```

Notes:
- For V1, you primarily query `IssueTree` by `userId` (authed) or via client-side local storage key (anon).
- `treeJson` is the canonical source of truth for the tree.

### 2.2 TreeRevision (optional, for history)

V1 history can be implemented either as **one row per tree** (simpler) or with **explicit revisions**. If you want full revision history (e.g. “Time travel” across edits), use this model; otherwise you can skip it initially.

```prisma
model TreeRevision {
  id          String   @id @default(cuid())

  issueTreeId String
  issueTree   IssueTree @relation(fields: [issueTreeId], references: [id])

  // Snapshot of the tree at this point in time
  treeJson    Json

  // Optional description like "Initial generation", "Expanded branch X"
  label       String?

  createdAt   DateTime @default(now())

  @@index([issueTreeId, createdAt])
}
```

V1 usage options:
- **Minimal:** Only `IssueTree` (no `TreeRevision`), and you serialize the latest tree state there.
- **Richer history:** Each significant change creates a `TreeRevision` while `IssueTree.treeJson` stores the latest.

### 2.3 Local vs. Authed Trees

Anonymous users will have trees in **local storage**; after signup/login, some may be persisted.

Possible flows:
- On login, selected local trees are **migrated** to DB as `IssueTree` rows with `userId` set.
- Optionally track origin in `source` (e.g. `"local_import"`).

No dedicated model is required; this is mostly application logic plus the `userId` field.

---

## 3. V2: Challenges, Rubric Scoring & Social

V2 adds:
- Challenges (curated prompts)
- Rubric-based scoring (using `IssueTreeAssessment`)
- Leaderboards / XP
- Sharing and discovery

The models below extend the V1 core entities.

### 3.1 Challenge

Represents a specific problem prompt users can attempt multiple times.

```prisma
model Challenge {
  id          String   @id @default(cuid())

  slug        String   @unique
  title       String   // short challenge name
  prompt      String   // canonical problem statement shown to users
  description String?  // extra context, instructions, examples

  // Configuration
  isActive    Boolean  @default(true)
  maxAttempts Int?     // optional cap per user

  // Optional metadata (tags, difficulty, etc.)
  metadata    Json?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  trees       IssueTree[]
  submissions ChallengeSubmission[]

  @@index([isActive])
}
```

### 3.2 ChallengeSubmission

One user’s attempt at a challenge, linked to a specific `IssueTree`.

```prisma
model ChallengeSubmission {
  id          String   @id @default(cuid())

  challengeId String
  challenge   Challenge @relation(fields: [challengeId], references: [id])

  issueTreeId String
  issueTree   IssueTree @relation(fields: [issueTreeId], references: [id])

  userId      String    // Clerk user; required for leaderboard/XP

  // Scoring summary (denormalized for fast leaderboard queries)
  overallScore Int?     // aggregate from rubric dimensions, e.g. 5–15
  detailsId    String?  // optional FK to IssueTreeAssessment if you prefer

  createdAt   DateTime  @default(now())

  // Relations
  assessment  IssueTreeAssessment?

  @@index([challengeId, overallScore])
  @@index([userId, createdAt])
}
```

### 3.3 IssueTreeAssessment (rubric output)

Stores the rubric-based evaluation for a tree (usually in the context of a challenge submission). Shape mirrors `schema/issueTreeAssessment.ts`.

```prisma
model IssueTreeAssessment {
  id          String   @id @default(cuid())

  issueTreeId String
  issueTree   IssueTree @relation(fields: [issueTreeId], references: [id])

  submissionId String?  // optional, if tied to a specific submission
  submission   ChallengeSubmission? @relation(fields: [submissionId], references: [id])

  // Raw rubric payload: scale, dimensions, rationales, etc.
  assessmentJson Json   // matches IssueTreeAssessment type from schema/issueTreeAssessment.ts

  // Denormalized summary
  overallScore  Int?    // optional: aggregated score (e.g. sum of dimension scores)

  createdAt    DateTime @default(now())

  @@index([issueTreeId])
  @@index([submissionId])
}
```

This model lets you:
- Store full rubric detail as JSON.
- Denormalize an `overallScore` for quick ranking.

### 3.4 UserStats / XP

Aggregated stats per user for global leaderboards and progression.

```prisma
model UserStats {
  userId     String  @id // Clerk user ID

  // Aggregates from ChallengeSubmission / IssueTreeAssessment
  totalXp    Int     @default(0)
  challengesPlayed Int @default(0)
  challengesWon   Int @default(0) // e.g. top placements

  // Optional: store last recompute timestamp or cached ranks
  metadata   Json?

  updatedAt  DateTime @updatedAt
}
```

XP calculation is an application concern (e.g. `overallScore` → XP), but this model provides a stable storage target.

### 3.5 ShareLink

Supports private share links and public gallery entries.

```prisma
model ShareLink {
  id          String   @id @default(cuid())

  issueTreeId String
  issueTree   IssueTree @relation(fields: [issueTreeId], references: [id])

  createdById String   // userId of creator

  // Random token used in URLs, e.g. /share/{token}
  token       String   @unique

  // Access & visibility
  isPublic    Boolean  @default(false) // true = eligible for gallery
  expiresAt   DateTime?

  createdAt   DateTime @default(now())

  @@index([createdById, createdAt])
  @@index([issueTreeId])
}
```

Usage:
- V2.0 (Challenges & Scoring): may not need share links yet.
- V2.1 (Sharing & Discovery): use `ShareLink` for private links and public gallery entries (`isPublic = true`).

---

## 4. Implementation Notes & Evolution

- Start V1 with **IssueTree** only; add **TreeRevision** if/when you need richer history.
- Add V2 models (`Challenge`, `ChallengeSubmission`, `IssueTreeAssessment`, `UserStats`, `ShareLink`) as separate migrations; all relations are optional from the V1 perspective.
- The Zod schemas in `schema/issueTree.ts` and `schema/issueTreeAssessment.ts` define the JSON shapes for `treeJson` and `assessmentJson` and should be kept in sync with any future changes.

