import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { issueTreeSchema, type IssueTreeJson } from "@/schema/issueTree";
import IssueTreeEditor from "@/components/IssueTreeEditor";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { id } = await params;

  if (!id) {
    return {};
  }

  const supabase = await createClient();
  const { data: tree } = await supabase
    .from("issue_trees")
    .select("title")
    .eq("id", id)
    .single();

  if (!tree) {
    return {};
  }

  const title =
    typeof tree.title === "string" && tree.title.trim().length > 0
      ? tree.title
      : "Issue tree";

  return {
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    title: `${title} – Issue Tree`,
    openGraph: {
      title: `${title} – Issue Tree`,
      url: `https://issuetree.ai/t/${id}`,
      images: [
        {
          url: `/t/${id}/opengraph-image`,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} – Issue Tree`,
      images: [`/t/${id}/opengraph-image`],
    },
  };
}

export default async function TreePage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch the tree with its forked_from relation
  const { data: tree, error } = await supabase
    .from("issue_trees")
    .select("id, tree_json, forked_from_id")
    .eq("id", id)
    .single();

  if (error || !tree) {
    notFound();
  }

  // Fetch forked_from title if exists
  let forkedFromTitle: string | null = null;
  if (tree.forked_from_id) {
    const { data: forkedFrom } = await supabase
      .from("issue_trees")
      .select("title")
      .eq("id", tree.forked_from_id)
      .single();
    forkedFromTitle = forkedFrom?.title ?? null;
  }

  const parsed = issueTreeSchema.parse(tree.tree_json) as IssueTreeJson;

  return (
    <IssueTreeEditor
      initialTree={parsed}
      treeId={tree.id}
      forkedFromId={tree.forked_from_id ?? undefined}
      forkedFromTitle={forkedFromTitle}
    />
  );
}
