import { issueTreeSchema, toLlmIssueTree, fromLlmIssueTree } from "@/schema/issueTree";
import { INITIAL_TREE_DATA } from "@/constants";

describe("issueTree schema and helpers", () => {
  test("validates INITIAL_TREE_DATA and round-trips via LLM helpers", () => {
    const parsed = issueTreeSchema.parse(INITIAL_TREE_DATA);

    const llmTree = toLlmIssueTree(parsed);
    const roundTripped = fromLlmIssueTree(llmTree);

    // Basic structural checks
    expect(roundTripped).toBeDefined();
    const root = "root" in (roundTripped as any)
      ? (roundTripped as any).root
      : roundTripped;

    expect(root.content).toBe(INITIAL_TREE_DATA.content);
    expect(Array.isArray(root.children)).toBe(true);
  });
});
