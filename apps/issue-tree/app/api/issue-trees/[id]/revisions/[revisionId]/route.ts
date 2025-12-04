import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { issueTreeSchema } from "@/schema/issueTree";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string; revisionId: string }> }
) {
  const { id, revisionId } = await context.params;
  const supabase = await createClient();

  const { data: revision, error } = await supabase
    .from("tree_revisions")
    .select()
    .eq("id", revisionId)
    .eq("issue_tree_id", id)
    .single();

  if (error || !revision) {
    return new Response("Not found", { status: 404 });
  }

  const parsedTree = issueTreeSchema.parse(revision.tree_json);

  return Response.json({
    id: revision.id,
    issueTreeId: revision.issue_tree_id,
    label: revision.label,
    createdAt: revision.created_at,
    tree: parsedTree,
  });
}
