import {
  findNodeById,
  getNodePath,
  getRootNode,
  getSystemPrompt,
  getResponseSchema,
} from "@/lib/issueTreeAiHelpers";
import type { IssueNode } from "@/types";
import type { IssueTreeJson } from "@/schema/issueTree";

const createMockNode = (
  id: string,
  content: string,
  children: IssueNode[] = [],
  parentId: string | null = null
): IssueNode => ({
  id,
  content,
  type: parentId === null ? "root" : "hypothesis",
  children,
  parentId,
  isExpanded: true,
});

describe("findNodeById", () => {
  const childNode = createMockNode("child-1", "Child Node", [], "root-1");
  const grandchildNode = createMockNode("grandchild-1", "Grandchild Node", [], "child-1");
  const childWithGrandchild = createMockNode("child-2", "Child with Grandchild", [grandchildNode], "root-1");
  const rootNode = createMockNode("root-1", "Root Node", [childNode, childWithGrandchild]);

  test("finds root node by id", () => {
    const result = findNodeById(rootNode, "root-1");
    expect(result).toBe(rootNode);
  });

  test("finds direct child node by id", () => {
    const result = findNodeById(rootNode, "child-1");
    expect(result).toBe(childNode);
  });

  test("finds deeply nested node by id", () => {
    const result = findNodeById(rootNode, "grandchild-1");
    expect(result).toBe(grandchildNode);
  });

  test("returns null for non-existent id", () => {
    const result = findNodeById(rootNode, "non-existent");
    expect(result).toBeNull();
  });
});

describe("getNodePath", () => {
  const grandchildNode = createMockNode("grandchild-1", "Grandchild Node", [], "child-1");
  const childNode = createMockNode("child-1", "Child Node", [grandchildNode], "root-1");
  const rootNode = createMockNode("root-1", "Root Node", [childNode]);

  test("returns path for root node", () => {
    const result = getNodePath(rootNode, "root-1");
    expect(result).toEqual(["Root Node"]);
  });

  test("returns path for child node", () => {
    const result = getNodePath(rootNode, "child-1");
    expect(result).toEqual(["Root Node", "Child Node"]);
  });

  test("returns path for deeply nested node", () => {
    const result = getNodePath(rootNode, "grandchild-1");
    expect(result).toEqual(["Root Node", "Child Node", "Grandchild Node"]);
  });

  test("returns null for non-existent id", () => {
    const result = getNodePath(rootNode, "non-existent");
    expect(result).toBeNull();
  });
});

describe("getRootNode", () => {
  const mockNode = createMockNode("root-1", "Root Node");

  test("returns node directly when tree is a bare node", () => {
    const tree: IssueTreeJson = mockNode;
    const result = getRootNode(tree);
    expect(result).toBe(mockNode);
  });

  test("returns root property when tree has root wrapper", () => {
    const tree: IssueTreeJson = { root: mockNode };
    const result = getRootNode(tree);
    expect(result).toBe(mockNode);
  });
});

describe("getSystemPrompt", () => {
  test("returns prompt containing base constraints for suggestChildren", () => {
    const result = getSystemPrompt("suggestChildren");
    expect(result).toContain("MECE");
    expect(result).toContain("Suggest 2-4 child nodes");
    expect(result).toContain("IMPORTANT CONSTRAINTS");
  });

  test("returns prompt for suggestSibling operation", () => {
    const result = getSystemPrompt("suggestSibling");
    expect(result).toContain("MECE");
    expect(result).toContain("Suggest ONE sibling node");
    expect(result).toContain("mutually exclusive from existing siblings");
  });

  test("returns prompt for rewriteLabel operation", () => {
    const result = getSystemPrompt("rewriteLabel");
    expect(result).toContain("improved label");
    expect(result).toContain("concise");
    expect(result).toContain("Preserve the original meaning");
  });

  test("returns prompt for restructureChildren operation", () => {
    const result = getSystemPrompt("restructureChildren");
    expect(result).toContain("restructured set of children");
    expect(result).toContain("MECE");
    expect(result).toContain("Preserve the key concepts");
  });

  test("returns base prompt for unknown operation type", () => {
    const result = getSystemPrompt("unknownOperation" as any);
    expect(result).toContain("MECE");
    expect(result).toContain("IMPORTANT CONSTRAINTS");
    expect(result).not.toContain("Your task:");
  });
});

describe("getResponseSchema", () => {
  describe("suggestChildren schema", () => {
    const schema = getResponseSchema("suggestChildren");

    test("accepts valid proposedChildren array", () => {
      const validData = {
        proposedChildren: [
          { content: "Child 1" },
          { content: "Child 2" },
        ],
        explanation: "Test explanation",
      };
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("rejects proposedChildren with less than 2 items", () => {
      const invalidData = {
        proposedChildren: [{ content: "Only one" }],
      };
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("rejects proposedChildren with more than 5 items", () => {
      const invalidData = {
        proposedChildren: Array(6).fill({ content: "Child" }),
      };
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("suggestSibling schema", () => {
    const schema = getResponseSchema("suggestSibling");

    test("accepts valid proposedSibling", () => {
      const validData = {
        proposedSibling: { content: "Sibling node" },
      };
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("accepts proposedSibling with optional type", () => {
      const validData = {
        proposedSibling: { content: "Sibling node", type: "hypothesis" },
      };
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("rejects missing proposedSibling", () => {
      const invalidData = {};
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("rewriteLabel schema", () => {
    const schema = getResponseSchema("rewriteLabel");

    test("accepts valid proposedContent", () => {
      const validData = {
        proposedContent: "Improved label text",
      };
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("rejects missing proposedContent", () => {
      const invalidData = { explanation: "Some explanation" };
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("restructureChildren schema", () => {
    const schema = getResponseSchema("restructureChildren");

    test("accepts valid proposedChildren array", () => {
      const validData = {
        proposedChildren: [{ content: "Restructured child" }],
      };
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("rejects proposedChildren with more than 6 items", () => {
      const invalidData = {
        proposedChildren: Array(7).fill({ content: "Child" }),
      };
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  test("throws error for unknown operation type", () => {
    expect(() => getResponseSchema("unknownOperation" as any)).toThrow(
      "Unknown operation type: unknownOperation"
    );
  });
});
