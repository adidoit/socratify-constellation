import { getServerAuth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { issueTreeSchema } from "@/schema/issueTree";
import { getIssueTreeById, updateIssueTreeTreeJson, deleteIssueTree } from "@/lib/issueTrees";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const existing = await getIssueTreeById(params.id);

  if (!existing) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json(existing);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const existing = await getIssueTreeById(params.id);

  if (!existing) {
    return new Response("Not found", { status: 404 });
  }

  const { userId } = await getServerAuth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (existing.userId && existing.userId !== userId) {
    return new Response("Forbidden", { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  if (!body.tree) {
    return new Response("Missing tree", { status: 400 });
  }

  const parsedTree = issueTreeSchema.parse(body.tree);

  const updated = await updateIssueTreeTreeJson(existing.id, parsedTree);

  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const existing = await getIssueTreeById(params.id);

  if (!existing) {
    return new Response("Not found", { status: 404 });
  }

  const { userId } = await getServerAuth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (existing.userId && existing.userId !== userId) {
    return new Response("Forbidden", { status: 403 });
  }

  await deleteIssueTree(params.id);

  return new Response(null, { status: 204 });
}
