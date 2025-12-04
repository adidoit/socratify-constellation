# Issue Tree — Caching & Latency Strategy (V1)

This doc outlines how we keep perceived latency low and throughput high for the Issue Tree app, and where/why to introduce caching and Redis.

The guiding principle: **optimize for user-perceived latency on LLM and tree operations**, while keeping the system simple and observable.

---

## 1. Current Architecture & Latency Drivers

**Stack overview**
- Next.js 16 App Router (`app/`, `app/api/*`).
- Postgres via Prisma (`prisma/schema.prisma`, `lib/prisma.ts`).
- Gemini via AI SDK (`lib/aiClient.ts`, `app/api/*`).

**Key backend routes**
- `POST /api/chat` (`app/api/chat/route.ts`)
  - Inputs: prompt (+ optional tree).
  - Does: single `generateText` call to Gemini.
  - Latency drivers: LLM network + compute.

- `POST /api/issue-tree-assessment` (`app/api/issue-tree-assessment/route.ts`)
  - Inputs: full tree JSON.
  - Does: validate tree, transform with `toLlmIssueTree`, `generateObject` to rubric schema.
  - Latency drivers: LLM call, size of tree JSON.

- `POST /api/issue-tree-edit` (`app/api/issue-tree-edit/route.ts`)
  - Inputs: `IssueTreeAiRequest` (tree + target node + operation).
  - Does: tree traversal helpers, `generateObject` to structured suggestion.
  - Latency drivers: LLM call, prompt size.

- `GET /api/issue-trees` (`app/api/issue-trees/route.ts`)
  - Inputs: `anonClientId` and `limit`.
  - Does: `getRecentIssueTrees` via Prisma, index-backed query.
  - Latency drivers: DB round-trip (small), network to DB.

- `POST /api/issue-trees`
  - Inputs: title, description, tree JSON, `anonClientId`.
  - Does: zod validation, single-row insert via `createIssueTree`.
  - Latency drivers: DB write (small).

**Primary latency sources (ordered)**
1. **LLM calls** (Gemini) — dominates wall time per request.
2. **DB round-trips** — minor but can matter at scale / under load.
3. **Platform overhead** — cold starts, connection warm-up, TLS, etc.
4. **App CPU work** — zod validation, tree traversal, JSON stringify (usually negligible).

---

## 2. Caching Philosophy

We adopt a simple, layered strategy:

- **Layer 1 — LLM result caching (highest ROI)**
  - Avoid recomputing the same LLM result for identical inputs.
  - Especially important for assessments and structured edit suggestions, which are deterministic enough in practice.

- **Layer 2 — Read caching for DB-backed lists**
  - Cache user- or anon-specific lists of recent trees with short TTLs.
  - Accept slight staleness; DB stays source of truth.

- **Layer 3 — Rate limiting & backpressure (via Redis)**
  - Protect LLM endpoints from abuse, which also protects latency for legitimate users.

We intentionally avoid premature complexity:
- No aggressive object-level caching of individual tree nodes.
- No write-through or write-behind complexity; simple read-through + TTL is enough for now.

---

## 3. Redis: When and Why

**Do we need Redis right now?**
- For a small/early app: **not strictly required**.
- For production-ish traffic and real LLM cost/latency concerns: **strongly recommended**.

Redis (or managed Redis like Upstash) unlocks:
- **LLM response caching** — biggest win on p95 latency and spend.
- **Read caching for `GET /api/issue-trees`**.
- **Rate limiting** across app instances.

We should assume a managed Redis instance once:
- We care about reducing repeated LLM work for common tree operations.
- We anticipate more than “personal dev” levels of traffic.

---

## 4. LLM Response Caching

### 4.1 General Design

Use **content-addressed cache keys** based on:
- Model identifier (e.g. `"gemini-2.0-flash-lite"`).
- Operation type or route.
- A normalized input payload (tree, prompt, target node).

**Key format**
- `llm:<route>:v1:<hash>`
- Where `<hash>` is a stable hash (e.g. SHA-256 hex) of a JSON-serialized, normalized payload.

**Payload normalization**
- Remove unstable fields (timestamps, IDs that don’t affect semantics, etc.).
- Sort object keys before stringifying (or rely on a stable stringifier).

**TTL guidance**
- Chat (`/api/chat`): 5–30 minutes — responses are transient.
- Edit suggestions (`/api/issue-tree-edit`): 15–60 minutes — enough to reuse within a working session.
- Assessments (`/api/issue-tree-assessment`): 6–24 hours — trees change less frequently; cached assessments are highly reusable.

### 4.2 Route-Specific Strategies

#### a) `POST /api/issue-tree-assessment`

**Cache key**
- `llm:assessment:v1:${hash(JSON.stringify({ model, llmTree }))}`
  - `model`: string (e.g. `"gemini-2.0-flash-lite"`).
  - `llmTree`: result of `toLlmIssueTree(parsedTree)`; omit raw client metadata.

**Flow**
1. Parse and validate tree as we do today.
2. Build normalized payload and key.
3. **Check Redis**:
   - If hit: return cached assessment JSON.
4. If miss:
   - Call `generateObject`.
   - Store `object` in Redis with TTL (e.g. 12h).
   - Return `object`.

**Notes**
- Trees can be large; keep payload minimal (LLM-optimized tree only).
- If we later support “versioned rubrics”, include rubric version in the key.

#### b) `POST /api/issue-tree-edit`

**Cache key**
- `llm:edit:v1:${hash(JSON.stringify({ model, operationType, llmTree, targetNodeId }))}`
  - `operationType`: `"suggestChildren" | "suggestSibling" | ...`.
  - `llmTree`: `toLlmIssueTree(tree)`.
  - `targetNodeId`: ensures we are local to the node.
  - Optional: include operation params, if we add them.

**Flow**
1. Validate `IssueTreeAiRequest` (as now).
2. Compute `llmTree`, `operationType`, and `targetNodeId`.
3. Build payload + key, check Redis.
4. On miss:
   - Call `generateObject`.
   - Cache the structured suggestion (`object`) for 30–60 minutes.

**Notes**
- We intentionally cache *structured suggestions*, not the entire HTTP response.
- If we add an `explanation` field, cache it alongside the suggestion.

#### c) `POST /api/chat`

**Cache key**
- `llm:chat:v1:${hash(JSON.stringify({ model, prompt, llmTree }))}`
  - Only include `llmTree` if tree context is present and valid.

**Flow**
1. Validate prompt (non-empty).
2. Optionally parse tree; if invalid, skip it from the key and prompt.
3. Build payload + key, check cache.
4. Cache hit: return `text` from Redis.
5. Cache miss: call `generateText`, cache `text` for ~10–30 minutes.

**Notes**
- Chat is less obviously deterministic and more conversational, but caching common prompts (e.g. “How can I improve this tree?”) can still help.
- We can adjust TTL shorter if responses feel too brittle over time.

---

## 5. DB Read Caching (Issue Trees)

### 5.1 Target: `GET /api/issue-trees`

The route currently:
- Reads `anonClientId`, `limit`, and uses `getRecentIssueTrees(userId, anonClientId, limit)`.
- For now, `userId` is `null` and anon IDs are the main key.

**Cache key**
- `trees:recent:v1:${userKey}:${limit}`
- `userKey`:
  - For real users (future): `user:${userId}`.
  - For anonymous: `anon:${anonClientId}`.

**TTL**
- ~30–60 seconds.
- Staleness is acceptable; user is mostly browsing recent history.

**Flow**
1. Resolve `userId` / `anonClientId` and `limit`.
2. Build `userKey` and cache key.
3. Check Redis:
   - Hit → parse JSON and return.
   - Miss → call `getRecentIssueTrees`, return result, store in Redis with TTL.

### 5.2 Invalidation Strategy

We keep this simple:
- On `POST /api/issue-trees`:
  - Identify `userKey` for the created tree.
  - Either:
    - Explicitly delete `trees:recent:v1:${userKey}:<commonLimits>` keys, or
    - Do nothing and rely on short TTL.

Explicit deletion is nicer but not strictly required given the short TTL.

---

## 6. Rate Limiting & Backpressure

LLM routes are the expensive ones:
- `POST /api/chat`
- `POST /api/issue-tree-assessment`
- `POST /api/issue-tree-edit`

### 6.1 Basic Design

Use **token bucket** or **fixed window** counters in Redis, keyed by:
- IP address (fallback).
- Authenticated `userId` when available.
- `anonClientId` for anonymous users.

Example key:
- `rl:<route>:v1:<userKey>`

Example limits:
- Chat: 60 requests / 10 minutes per user.
- Edit suggestions: 60 requests / 10 minutes per user.
- Assessment: 20 requests / 10 minutes per user.

On each request:
1. Increment counter in Redis with expiration window.
2. If above threshold → return `429 Too Many Requests`.
3. Otherwise → proceed normally.

### 6.2 Benefits for Latency

Rate limiting:
- Prevents a single client from saturating LLM capacity.
- Keeps queueing and tail latency bounded for everyone else.

---

## 7. Implementation Sketch

### 7.1 Cache Wrapper (`lib/cache.ts`)

Introduce a small abstraction (pseudo-code shape):

```ts
type CacheValue = unknown;

export async function cacheGet<T = CacheValue>(key: string): Promise<T | null> {
  // read from Redis, JSON.parse
}

export async function cacheSet(
  key: string,
  value: CacheValue,
  ttlSeconds: number
): Promise<void> {
  // JSON.stringify + EX TTL
}
```

We can later:
- Swap Redis for another KV if needed.
- Add namespacing, metrics, logging, etc.

### 7.2 Wiring into Routes

For each LLM route (`chat`, `issue-tree-assessment`, `issue-tree-edit`):
- Wrap the existing LLM call with:
  - Build key → `cacheGet` → early return on hit.
  - On miss → call LLM → `cacheSet` → return.

For `GET /api/issue-trees`:
- Wrap `getRecentIssueTrees` call similarly, with short TTL.

---

## 8. Non-LLM Micro-Optimizations

These do not require Redis but help keep endpoints snappy:

- **Validation cost**
  - We currently zod-validate trees on incoming requests (`issueTreeSchema`, `issueTreeAiRequestSchema`).
  - If trees become very large, we can:
    - Introduce a lighter “shape-only” schema for hot paths.
    - Trust DB-persisted trees and only deeply validate on save/migration.

- **Tree traversal**
  - Helpers in `lib/issueTreeAiHelpers.ts` (`findNodeById`, `getNodePath`) are simple DFS.
  - If performance ever becomes an issue with very large trees, we can:
    - Precompute `id -> node` maps client-side or server-side.
    - Cache these maps per request.

- **Prisma connection usage**
  - `lib/prisma.ts` already uses a singleton client.
  - Ensure DB pool configuration matches deployment platform (connection limits, idle timeout).

---

## 9. Rollout Plan

**Phase 1 — Instrument & measure**
- Add simple logging for:
  - LLM call durations (per route).
  - DB query durations for `getRecentIssueTrees`.
- Confirm current p50 / p95 per route.

**Phase 2 — Add Redis-backed LLM caching**
- Implement `lib/cache.ts`.
- Apply to:
  - `issue-tree-assessment` (largest win).
  - `issue-tree-edit`.
  - Optional: `chat`.

**Phase 3 — DB read caching & rate limiting**
- Add caching to `GET /api/issue-trees` with short TTL.
- Introduce rate limiting on LLM routes.

**Phase 4 — Tune & simplify**
- Adjust TTLs and cache keys based on real usage.
- Remove or relax caching where it adds little value.

This staged approach keeps complexity under control while giving us big wins on latency and resilience as traffic grows.

