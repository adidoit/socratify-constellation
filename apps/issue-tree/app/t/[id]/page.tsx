import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { issueTreeSchema, type IssueTreeJson } from "@/schema/issueTree";
import IssueTreeEditor from "@/components/IssueTreeEditor";
import type { Database } from "@/lib/supabase/database.types";

type IssueTreeRow = Database["public"]["Tables"]["issue_trees"]["Row"];

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
    .select("*")
    .eq("id", id)
    .single();

  if (!tree) {
    return {};
  }

  const typedTree = tree as IssueTreeRow;
  const title =
    typeof typedTree.title === "string" && typedTree.title.trim().length > 0
      ? typedTree.title
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
  const { data: tree2, error } = await supabase
    .from("issue_trees")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tree2) {
    notFound();
  }

  const typedTree2 = tree2 as IssueTreeRow;

  // Fetch forked_from title if exists
  let forkedFromTitle: string | null = null;
  if (typedTree2.forked_from_id) {
    const { data: forkedFrom } = await supabase
      .from("issue_trees")
      .select("*")
      .eq("id", typedTree2.forked_from_id)
      .single();
    const typedForkedFrom = forkedFrom as IssueTreeRow | null;
    forkedFromTitle = typedForkedFrom?.title ?? null;
  }

  const parsed = issueTreeSchema.parse(typedTree2.tree_json) as IssueTreeJson;

  return (
    <IssueTreeEditor
      initialTree={parsed}
      treeId={typedTree2.id}
      forkedFromId={typedTree2.forked_from_id ?? undefined}
      forkedFromTitle={forkedFromTitle}
    />
  );
}
