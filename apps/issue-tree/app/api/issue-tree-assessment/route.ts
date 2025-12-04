import { NextRequest } from "next/server";
import { generateObject } from "ai";
import { issueTreeSchema, toLlmIssueTree } from "@/schema/issueTree";
import { geminiModel } from "@/lib/aiClient";
import {
  ISSUE_TREE_RUBRIC_PROMPT,
  issueTreeAssessmentSchema,
  type IssueTreeAssessment,
} from "@/schema/issueTreeAssessment";
import { buildIssueTreeYaml } from "@/lib/issueTreeAiHelpers";
import { getJson, setJson } from "@/lib/redis";
import { hashIssueTree, CACHE_KEYS, CACHE_TTL } from "@/lib/cacheHelpers";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const parsedTree = issueTreeSchema.parse(body.tree);

  const treeHash = hashIssueTree(parsedTree);
  const cacheKey = CACHE_KEYS.assessment(treeHash);

  try {
    const cached = await getJson<IssueTreeAssessment>(cacheKey);
    if (cached) {
      return Response.json(cached);
    }
  } catch {
    // Redis unavailable, continue without cache
  }

  const llmTree = toLlmIssueTree(parsedTree);
  const treeYaml = buildIssueTreeYaml(parsedTree);

  const { object } = await generateObject({
    model: geminiModel,
    schema: issueTreeAssessmentSchema,
    prompt: [
      ISSUE_TREE_RUBRIC_PROMPT,
      "",
      "Issue tree (YAML representation):",
      treeYaml,
      "",
      "For reference, here is the same tree in JSON:",
      JSON.stringify(llmTree, null, 2),
    ].join("\n"),
  });

  try {
    await setJson(cacheKey, object, { ex: CACHE_TTL.assessment });
  } catch {
    // Redis unavailable, continue without caching
  }

  return Response.json(object);
}
