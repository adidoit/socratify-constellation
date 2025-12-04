import { getServerAuth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { forkIssueTree, getIssueTreeById } from "@/lib/issueTrees";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { userId } = await getServerAuth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const existing = await getIssueTreeById(params.id);

  if (!existing) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const forked = await forkIssueTree(existing.id, userId, "fork");
    return Response.json(
      {
        id: forked.id,
        title: forked.title,
        createdAt: forked.createdAt,
        forkedFromId: forked.forkedFromId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to fork issue tree:", error);
    return new Response("Failed to fork tree", { status: 500 });
  }
}
