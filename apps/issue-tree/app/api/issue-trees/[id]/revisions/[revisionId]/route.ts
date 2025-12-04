import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { issueTreeSchema } from "@/schema/issueTree";
import type { Database } from "@/lib/supabase/database.types";

type TreeRevisionRow = Database["public"]["Tables"]["tree_revisions"]["Row"];

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string; revisionId: string }> }
) {
  const { id, revisionId } = await context.params;
  const supabase = await createClient();

  const { data: revision, error } = await supabase
    .from("tree_revisions")
    .select("*")
    .eq("id", revisionId)
    .eq("issue_tree_id", id)
    .single();

  if (error || !revision) {
    return new Response("Not found", { status: 404 });
  }

  const typedRevision = revision as TreeRevisionRow;
  const parsedTree = issueTreeSchema.parse(typedRevision.tree_json);

  return Response.json({
    id: typedRevision.id,
    issueTreeId: typedRevision.issue_tree_id,
    label: typedRevision.label,
    createdAt: typedRevision.created_at,
    tree: parsedTree,
  });
}
