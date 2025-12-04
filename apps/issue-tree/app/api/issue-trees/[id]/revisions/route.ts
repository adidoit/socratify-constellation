import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: tree, error: treeError } = await supabase
    .from("issue_trees")
    .select("id")
    .eq("id", id)
    .single();

  if (treeError || !tree) {
    return new Response("Not found", { status: 404 });
  }

  const { data: revisions, error: revisionsError } = await supabase
    .from("tree_revisions")
    .select("id, label, created_at")
    .eq("issue_tree_id", id)
    .order("created_at", { ascending: false });

  if (revisionsError) {
    return new Response("Failed to fetch revisions", { status: 500 });
  }

  // Transform to camelCase for API response
  const result = (revisions ?? []).map((r: { id: string; label: string | null; created_at: string }) => ({
    id: r.id,
    label: r.label,
    createdAt: r.created_at,
  }));

  return Response.json(result);
}
