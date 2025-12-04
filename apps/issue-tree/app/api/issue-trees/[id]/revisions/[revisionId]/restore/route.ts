import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { issueTreeSchema } from "@/schema/issueTree";
import { updateIssueTreeTreeJson } from "@/lib/issueTrees";
import type { Database } from "@/lib/supabase/database.types";

type TreeRevisionRow = Database["public"]["Tables"]["tree_revisions"]["Row"];

export async function POST(
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

  try {
    const updated = await updateIssueTreeTreeJson(id, parsedTree, {
      semantic: true,
      revisionLabel: `Restored from revision at ${typedRevision.created_at}`,
    });

    return Response.json({
      id: updated.id,
      tree: parsedTree,
      updatedAt: updated.updatedAt,
    });
  } catch (restoreError) {
    console.error("Failed to restore revision:", restoreError);
    return new Response("Failed to restore revision", { status: 500 });
  }
}
