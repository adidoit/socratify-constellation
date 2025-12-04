import type { IssueTreeJson } from "@/schema/issueTree";
import { getJson, setJson, deleteKey, deleteByPattern } from "./redis";
import { CACHE_KEYS, CACHE_TTL } from "./cacheHelpers";
import { toIssueTree, type IssueTree, type Database } from "./supabase/database.types";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

type IssueTreeRow = Database["public"]["Tables"]["issue_trees"]["Row"];
type TreeRevisionRow = Database["public"]["Tables"]["tree_revisions"]["Row"];

// Create a properly-typed Supabase client for this module
async function getTypedSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables not set');
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: Record<string, unknown>) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Server Component - cookies are read-only
        }
      },
      remove(name: string, options?: Record<string, unknown>) {
        try {
          cookieStore.delete(name);
        } catch {
          // Server Component - cookies are read-only
        }
      }
    }
  });
}

export type CreateIssueTreeInput = {
  title: string;
  description?: string | null;
  treeJson: IssueTreeJson;
  userId?: string | null;
  source?: string | null;
};

async function invalidateRecentTreesCache(userId: string | null): Promise<void> {
  if (!userId) return;

  const isAnon = userId.startsWith("anon:");
  const anonClientId = isAnon ? userId.slice(5) : null;
  const realUserId = isAnon ? null : userId;

  const prefix = realUserId
    ? `issueTrees:recent:user:${realUserId}:`
    : anonClientId
      ? `issueTrees:recent:anon:${anonClientId}:`
      : null;

  if (!prefix) return;

  try {
    await deleteByPattern(`${prefix}*`);
  } catch {
    // Redis unavailable, continue
  }
}

export async function createIssueTree(
  input: CreateIssueTreeInput
): Promise<IssueTree> {
  const { title, description, treeJson, userId, source } = input;
  const supabase = await getTypedSupabaseClient();

  const { data, error } = await supabase
    .from("issue_trees")
    .insert({
      title,
      description: description ?? null,
      tree_json: treeJson as unknown as Database["public"]["Tables"]["issue_trees"]["Insert"]["tree_json"],
      user_id: userId ?? null,
      source: source ?? "user",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create issue tree: ${error.message}`);
  }

  await invalidateRecentTreesCache(userId ?? null);

  return toIssueTree(data);
}

export async function updateIssueTreeTreeJson(
  id: string,
  treeJson: IssueTreeJson,
  options?: { revisionLabel?: string; semantic?: boolean }
): Promise<IssueTree> {
  const REVISION_THROTTLE_MS = 60_000;
  const supabase = await getTypedSupabaseClient();

  // Get existing tree
  const { data: existing, error: fetchError } = await supabase
    .from("issue_trees")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    throw new Error("IssueTree not found");
  }

  let shouldCreateRevision = false;

  if (options?.semantic) {
    shouldCreateRevision = true;
  } else {
    // Check last revision
    const { data: lastRevision } = await supabase
      .from("tree_revisions")
      .select("*")
      .eq("issue_tree_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!lastRevision) {
      shouldCreateRevision = true;
    } else {
      const now = Date.now();
      const last = new Date(lastRevision.created_at).getTime();
      if (now - last >= REVISION_THROTTLE_MS) {
        shouldCreateRevision = true;
      }
    }
  }

  if (shouldCreateRevision) {
    await supabase.from("tree_revisions").insert({
      issue_tree_id: id,
      tree_json: existing.tree_json as unknown as Database["public"]["Tables"]["tree_revisions"]["Insert"]["tree_json"],
      label: options?.revisionLabel ?? null,
    });
  }

  const { data: updated, error: updateError } = await supabase
    .from("issue_trees")
    .update({ tree_json: treeJson as unknown as Database["public"]["Tables"]["issue_trees"]["Update"]["tree_json"] })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to update issue tree: ${updateError?.message}`);
  }

  try {
    await deleteKey(CACHE_KEYS.issueTree(id));
    await invalidateRecentTreesCache(updated.user_id);
  } catch {
    // Redis unavailable, continue
  }

  return toIssueTree(updated);
}

export async function getIssueTreeById(id: string): Promise<IssueTree | null> {
  const cacheKey = CACHE_KEYS.issueTree(id);

  try {
    const cached = await getJson<IssueTree>(cacheKey);
    if (cached) {
      return cached;
    }
  } catch {
    // Redis unavailable, continue without cache
  }

  const supabase = await getTypedSupabaseClient();
  const { data: tree, error } = await supabase
    .from("issue_trees")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tree) {
    return null;
  }

  const result = toIssueTree(tree);

  try {
    await setJson(cacheKey, result, { ex: CACHE_TTL.issueTree });
  } catch {
    // Redis unavailable, continue without caching
  }

  return result;
}

export async function getIssueTreesForUser(
  userId: string
): Promise<IssueTree[]> {
  const supabase = await getTypedSupabaseClient();
  const { data, error } = await supabase
    .from("issue_trees")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch issue trees: ${error.message}`);
  }

  return (data ?? []).map(toIssueTree);
}

export async function deleteIssueTree(id: string): Promise<IssueTree> {
  const supabase = await getTypedSupabaseClient();

  // First get the tree to return it
  const { data: existing, error: fetchError } = await supabase
    .from("issue_trees")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    throw new Error("IssueTree not found");
  }

  const { error: deleteError } = await supabase
    .from("issue_trees")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(`Failed to delete issue tree: ${deleteError.message}`);
  }

  try {
    await deleteKey(CACHE_KEYS.issueTree(id));
    await invalidateRecentTreesCache(existing.user_id);
  } catch {
    // Redis unavailable, continue
  }

  return toIssueTree(existing);
}

export async function forkIssueTree(
  id: string,
  userId?: string | null,
  sourceOverride?: string | null
): Promise<IssueTree> {
  const supabase = await getTypedSupabaseClient();

  const { data: source, error: fetchError } = await supabase
    .from("issue_trees")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !source) {
    throw new Error("Source issue tree not found");
  }

  const { data: forked, error: insertError } = await supabase
    .from("issue_trees")
    .insert({
      title: source.title,
      description: source.description,
      tree_json: source.tree_json,
      user_id: userId ?? source.user_id ?? null,
      source: sourceOverride ?? "fork",
      forked_from_id: source.id,
    })
    .select("*")
    .single();

  if (insertError || !forked) {
    throw new Error(`Failed to fork issue tree: ${insertError?.message}`);
  }

  return toIssueTree(forked);
}

export async function getRecentIssueTrees(
  userId?: string | null,
  anonClientId?: string | null,
  limit: number = 20
): Promise<IssueTree[]> {
  const cacheKey = CACHE_KEYS.recentTrees(userId ?? null, anonClientId ?? null, limit);

  if (cacheKey) {
    try {
      const cached = await getJson<IssueTree[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch {
      // Redis unavailable, continue without cache
    }
  }

  const supabase = await getTypedSupabaseClient();
  let trees: IssueTree[] = [];

  if (userId) {
    const { data, error } = await supabase
      .from("issue_trees")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && data) {
      trees = data.map(toIssueTree);
    }
  } else if (anonClientId) {
    const { data, error } = await supabase
      .from("issue_trees")
      .select("*")
      .eq("user_id", `anon:${anonClientId}`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && data) {
      trees = data.map(toIssueTree);
    }
  }

  if (cacheKey && trees.length > 0) {
    try {
      await setJson(cacheKey, trees, { ex: CACHE_TTL.recentTrees });
    } catch {
      // Redis unavailable, continue without caching
    }
  }

  return trees;
}
