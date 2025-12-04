import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { issueTreeSchema, type IssueTreeJson } from "@/schema/issueTree";
import type { Database } from "@/lib/supabase/database.types";

type IssueTreeRow = Database["public"]["Tables"]["issue_trees"]["Row"];

export const alt = "Issue tree problem";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type ImageProps = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: ImageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: tree } = await supabase
    .from("issue_trees")
    .select("*")
    .eq("id", id)
    .single();

  if (!tree) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000000",
            color: "#ffffff",
            fontSize: 48,
            fontWeight: 600,
          }}
        >
          issue tree.ai
        </div>
      ),
      { ...size }
    );
  }

  const typedTree = tree as IssueTreeRow;
  const parsed = issueTreeSchema.parse(typedTree.tree_json) as IssueTreeJson;
  const root =
    "root" in (parsed as Record<string, unknown>)
      ? (parsed as Record<string, unknown>).root
      : parsed;

  const rootContent = (root as { content?: string })?.content;

  const title =
    typeof typedTree.title === "string" && typedTree.title.trim().length > 0
      ? typedTree.title
      : typeof rootContent === "string" && rootContent.trim().length > 0
        ? rootContent
        : "Untitled problem";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#000000",
          color: "#ffffff",
          boxSizing: "border-box",
          fontFamily: "'Poppins', system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.2,
            maxWidth: "85%",
            wordWrap: "break-word",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>

        <div
          style={{
            alignSelf: "flex-end",
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              marginBottom: 8,
            }}
          >
            issuetree.ai
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 400,
              opacity: 0.6,
              letterSpacing: "0.5px",
            }}
          >
            Sponsored by Socratify
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Poppins",
          data: await fetch(
            "https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JmUTPjU_7cUApQ.ttf"
          ).then((res) => res.arrayBuffer()),
          weight: 700,
          style: "normal",
        },
        {
          name: "Poppins",
          data: await fetch(
            "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JmUzT84trEuE_BuI.ttf"
          ).then((res) => res.arrayBuffer()),
          weight: 800,
          style: "normal",
        },
      ],
    }
  );
}
