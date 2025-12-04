import { getServerAuth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { issueTreeSchema, type IssueTreeJson } from "@/schema/issueTree";
import { createIssueTree, getRecentIssueTrees } from "@/lib/issueTrees";
import { INITIAL_TREE_DATA } from "@/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const parsedLimit = limitParam ? parseInt(limitParam, 10) : null;
  const limit = Number.isFinite(parsedLimit) && parsedLimit ? parsedLimit : 20;

  const { userId } = await getServerAuth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const trees = await getRecentIssueTrees(userId, null, limit);

  return Response.json(trees);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { userId } = await getServerAuth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const title: string =
    typeof body.title === "string" && body.title.trim().length > 0
      ? body.title.trim()
      : INITIAL_TREE_DATA.content;

  const description: string | undefined =
    typeof body.description === "string" ? body.description : undefined;

  let tree: IssueTreeJson = INITIAL_TREE_DATA;

  if (body.tree) {
    tree = issueTreeSchema.parse(body.tree);
  }

  const created = await createIssueTree({
    title,
    description,
    treeJson: tree,
    userId,
    source: "user",
  });

  return Response.json(created);
}
