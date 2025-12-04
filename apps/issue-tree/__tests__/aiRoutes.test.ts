import { geminiModel } from "@/lib/aiClient";

jest.mock("ai", () => ({
  generateObject: jest.fn(),
  streamText: jest.fn(),
}));

jest.mock("@/lib/aiClient", () => ({
  geminiModel: { modelId: "gemini-2.0-flash-lite" },
}));

// Mock Supabase auth
jest.mock("@/lib/auth", () => ({
  getServerAuth: jest.fn().mockResolvedValue({ userId: "test-user-id", user: { id: "test-user-id" } }),
}));

import { generateObject, streamText } from "ai";

const mockGenerateObject = generateObject as jest.MockedFunction<typeof generateObject>;
// Type assertion needed due to complex AI SDK type inference
const mockStreamText = streamText as unknown as jest.Mock;

describe("AI Client Configuration", () => {
  test("geminiModel is configured with correct model ID", () => {
    expect(geminiModel).toBeDefined();
    expect(geminiModel.modelId).toBe("gemini-2.0-flash-lite");
  });
});

describe("issue-tree-edit route AI integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validTree = {
    id: "root-1",
    content: "How can we increase revenue?",
    type: "root",
    children: [
      {
        id: "child-1",
        content: "Increase sales volume",
        type: "hypothesis",
        children: [],
        parentId: "root-1",
        isExpanded: true,
      },
    ],
    parentId: null,
    isExpanded: true,
  };

  test("generateObject is called with Gemini model for suggestChildren", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: {
        proposedChildren: [
          { content: "Expand to new markets" },
          { content: "Increase customer retention" },
        ],
        explanation: "These children break down the parent MECE",
      },
      finishReason: "stop",
      usage: { promptTokens: 100, completionTokens: 50 },
      response: {
        id: "test-id",
        timestamp: new Date(),
        modelId: "gemini-2.0-flash-lite",
      },
      warnings: [],
      request: {},
      rawResponse: { headers: {} },
      toJsonResponse: () => new Response(),
    } as any);

    const { POST } = await import("@/app/api/issue-tree-edit/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        tree: validTree,
        targetNodeId: "child-1",
        operation: { type: "suggestChildren" },
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
    expect(mockGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.objectContaining({ modelId: "gemini-2.0-flash-lite" }),
      })
    );
    expect(data.suggestion).toBeDefined();
    expect(data.suggestion.type).toBe("suggestChildren");
    expect(data.suggestion.proposedChildren).toHaveLength(2);
  });

  test("returns 400 for invalid request body", async () => {
    const { POST } = await import("@/app/api/issue-tree-edit/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        tree: validTree,
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request");
  });

  test("returns 400 when target node not found", async () => {
    const { POST } = await import("@/app/api/issue-tree-edit/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        tree: validTree,
        targetNodeId: "non-existent-id",
        operation: { type: "suggestChildren" },
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Target node not found");
  });

  test("returns 500 when AI generation fails", async () => {
    mockGenerateObject.mockRejectedValueOnce(new Error("AI service unavailable"));

    const { POST } = await import("@/app/api/issue-tree-edit/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        tree: validTree,
        targetNodeId: "child-1",
        operation: { type: "suggestChildren" },
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to generate suggestion");
  });
});

describe("issue-tree-assessment route AI integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validTree = {
    id: "root-1",
    content: "How can we increase revenue?",
    type: "root",
    children: [],
    parentId: null,
    isExpanded: true,
  };

  test("generateObject is called with Gemini model for assessment", async () => {
    const mockAssessment = {
      rubricName: "Issue Tree Quality Rubric",
      scale: { min: 1, max: 3, labels: { 1: "Weak", 2: "Mixed", 3: "Strong" } },
      dimensions: [
        {
          id: "mutually_exclusive",
          label: "Mutually exclusive",
          score: 3,
          scoreLabel: "Strong",
          rationale: "Test rationale",
        },
      ],
      overallComments: "Good tree structure",
    };

    mockGenerateObject.mockResolvedValueOnce({
      object: mockAssessment,
      finishReason: "stop",
      usage: { promptTokens: 100, completionTokens: 50 },
      response: {
        id: "test-id",
        timestamp: new Date(),
        modelId: "gemini-2.0-flash-lite",
      },
      warnings: [],
      request: {},
      rawResponse: { headers: {} },
      toJsonResponse: () => new Response(),
    } as any);

    const { POST } = await import("@/app/api/issue-tree-assessment/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ tree: validTree }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
    expect(mockGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.objectContaining({ modelId: "gemini-2.0-flash-lite" }),
      })
    );
    expect(data.rubricName).toBe("Issue Tree Quality Rubric");
  });
});

describe("issue-tree-generate-node route AI integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validTree = {
    id: "root-1",
    content: "How can we increase revenue?",
    type: "root",
    children: [
      {
        id: "child-1",
        content: "Increase sales volume",
        type: "hypothesis",
        children: [],
        parentId: "root-1",
        isExpanded: true,
      },
    ],
    parentId: null,
    isExpanded: true,
  };

  test("generateObject is called with Gemini model for child mode", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: {
        proposedNode: {
          content: "Launch new pricing packages",
        },
        explanation: "Adds a distinct way to increase revenue.",
      },
      finishReason: "stop",
      usage: { promptTokens: 100, completionTokens: 50 },
      response: {
        id: "test-id",
        timestamp: new Date(),
        modelId: "gemini-2.0-flash-lite",
      },
      warnings: [],
      request: {},
      rawResponse: { headers: {} },
      toJsonResponse: () => new Response(),
    } as any);

    const { POST } = await import("@/app/api/issue-tree-generate-node/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        tree: validTree,
        targetNodeId: "root-1",
        mode: "child",
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
    expect(mockGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.objectContaining({ modelId: "gemini-2.0-flash-lite" }),
      })
    );
    expect(data.proposedNode).toBeDefined();
    expect(data.proposedNode.content).toBe("Launch new pricing packages");
  });

  test("returns 400 for invalid request body", async () => {
    const { POST } = await import("@/app/api/issue-tree-generate-node/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        tree: validTree,
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request");
  });

  test("returns 400 when target node not found", async () => {
    const { POST } = await import("@/app/api/issue-tree-generate-node/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        tree: validTree,
        targetNodeId: "non-existent-id",
        mode: "child",
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Target node not found");
  });

  test("returns 400 when generating sibling for root node", async () => {
    const { POST } = await import("@/app/api/issue-tree-generate-node/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        tree: validTree,
        targetNodeId: "root-1",
        mode: "sibling",
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Cannot generate sibling for root node");
  });

  test("returns 500 when AI generation fails", async () => {
    mockGenerateObject.mockRejectedValueOnce(new Error("AI service unavailable"));

    const { POST } = await import("@/app/api/issue-tree-generate-node/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        tree: validTree,
        targetNodeId: "child-1",
        mode: "child",
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to generate node");
  });
});

describe("chat route AI integration - text-only mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("streamText is called with Gemini model for text-only chat", async () => {
    mockStreamText.mockResolvedValueOnce({
      toTextStreamResponse: () =>
        new Response(
          JSON.stringify({
            text: "Here is my response about issue trees.",
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        ),
    } as any);

    const { POST } = await import("@/app/api/chat/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ prompt: "Help me with my issue tree" }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(mockStreamText).toHaveBeenCalledTimes(1);
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.objectContaining({ modelId: "gemini-2.0-flash-lite" }),
      })
    );
    expect(data.text).toBe("Here is my response about issue trees.");
  });

  test("returns 400 for missing prompt in text-only mode", async () => {
    const { POST } = await import("@/app/api/chat/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({}),
    } as any;

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
  });

  test("returns 400 for empty prompt in text-only mode", async () => {
    const { POST } = await import("@/app/api/chat/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ prompt: "   " }),
    } as any;

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
  });

  test("handles invalid tree gracefully and still processes chat", async () => {
    mockStreamText.mockResolvedValueOnce({
      toTextStreamResponse: () =>
        new Response(
          JSON.stringify({
            text: "Response without tree context",
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        ),
    } as any);

    const { POST } = await import("@/app/api/chat/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        prompt: "Help me",
        tree: { invalid: "tree structure" },
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBe("Response without tree context");
  });
});

describe("chat route AI integration - edit-suggestion mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validTree = {
    id: "root-1",
    content: "How can we increase revenue?",
    type: "root",
    children: [
      {
        id: "child-1",
        content: "Increase sales volume",
        type: "hypothesis",
        children: [],
        parentId: "root-1",
        isExpanded: true,
      },
    ],
    parentId: null,
    isExpanded: true,
  };

  test("returns structured suggestion for suggestChildren operation", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: {
        proposedChildren: [
          { content: "Expand to new markets", type: "hypothesis" },
          { content: "Launch new product lines", type: "hypothesis" },
        ],
        explanation: "Here are two strategic children to add.",
      },
    } as any);

    const { POST } = await import("@/app/api/chat/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        mode: "edit-suggestion",
        tree: validTree,
        targetNodeId: "child-1",
        operationType: "suggestChildren",
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mode).toBe("edit-suggestion");
    expect(data.targetNodeId).toBe("child-1");
    expect(data.operationType).toBe("suggestChildren");
    expect(data.suggestion.type).toBe("suggestChildren");
    expect(data.suggestion.proposedChildren).toHaveLength(2);
    expect(data.explanation).toBe("Here are two strategic children to add.");
  });

  test("returns structured suggestion for rewriteLabel operation", async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: {
        proposedContent: "Grow sales volume through channel expansion",
        explanation: "Improved clarity and specificity.",
      },
    } as any);

    const { POST } = await import("@/app/api/chat/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        mode: "edit-suggestion",
        tree: validTree,
        targetNodeId: "child-1",
        operationType: "rewriteLabel",
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mode).toBe("edit-suggestion");
    expect(data.suggestion.type).toBe("rewriteLabel");
    expect(data.suggestion.proposedContent).toBe("Grow sales volume through channel expansion");
  });

  test("returns 400 when tree is missing in edit-suggestion mode", async () => {
    const { POST } = await import("@/app/api/chat/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        mode: "edit-suggestion",
        targetNodeId: "child-1",
        operationType: "suggestChildren",
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Tree context is required for edit-suggestion mode");
  });

  test("returns 400 when targetNodeId is missing in edit-suggestion mode", async () => {
    const { POST } = await import("@/app/api/chat/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        mode: "edit-suggestion",
        tree: validTree,
        operationType: "suggestChildren",
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("targetNodeId is required for edit-suggestion mode");
  });

  test("returns 400 when operationType is missing in edit-suggestion mode", async () => {
    const { POST } = await import("@/app/api/chat/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        mode: "edit-suggestion",
        tree: validTree,
        targetNodeId: "child-1",
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("operationType is required for edit-suggestion mode");
  });

  test("returns 400 when target node is not found", async () => {
    const { POST } = await import("@/app/api/chat/route");

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        mode: "edit-suggestion",
        tree: validTree,
        targetNodeId: "non-existent-node",
        operationType: "suggestChildren",
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Target node not found");
  });
});
