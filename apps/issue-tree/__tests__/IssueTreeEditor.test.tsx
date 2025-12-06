import React from "react";
import { act, render, waitFor } from "@testing-library/react";
import IssueTreeEditor from "@/components/IssueTreeEditor";
import type { IssueNode } from "@/types";

const mockCollapseSidebar = jest.fn();
let capturedTreeProps: any = null;

jest.mock("@/components/AppShell", () => {
  const React = require("react");
  const AppShell = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell-mock">{children}</div>
  );
  return {
    __esModule: true,
    AppShell,
    useSidebar: () => ({ collapseSidebar: mockCollapseSidebar }),
  };
});

jest.mock("@/components/FloatingChatWidget", () => {
  const React = require("react");
  return {
    __esModule: true,
    FloatingChatWidget: () => <div data-testid="chat-widget-mock" />,
  };
});

jest.mock("@/components/SocratifyBranding", () => {
  const React = require("react");
  return {
    __esModule: true,
    SocratifyBranding: () => <div data-testid="branding-mock" />,
  };
});

jest.mock("@/components/TreeRenderer", () => {
  const React = require("react");
  const MockTreeRenderer = (props: any) => {
    capturedTreeProps = props;
    return <div data-testid={`tree-renderer-${props.node.id}`} />;
  };
  return { __esModule: true, default: MockTreeRenderer };
});

jest.mock("html-to-image", () => ({
  toPng: jest.fn(async () => "data:image/png;base64,mock"),
}));

describe("IssueTreeEditor", () => {
  const originalRandomUUID = crypto.randomUUID;
  const originalFetch = global.fetch;

  const baseTree: IssueNode = {
    id: "root-1",
    content: "Profitability is declining",
    type: "root",
    parentId: null,
    isExpanded: true,
    children: [
      {
        id: "child-1",
        content: "Revenue is decreasing",
        type: "hypothesis",
        parentId: "root-1",
        isExpanded: true,
        children: [],
      },
    ],
  };

  beforeEach(() => {
    jest.useFakeTimers();
    capturedTreeProps = null;
    mockCollapseSidebar.mockReset();
    crypto.randomUUID = jest.fn().mockReturnValue("new-id");
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    crypto.randomUUID = originalRandomUUID;
    (global as unknown as { fetch: typeof originalFetch }).fetch = originalFetch;
    jest.clearAllMocks();
  });

  const renderEditor = (tree: IssueNode = baseTree) =>
    act(async () => {
      render(
        <IssueTreeEditor
          initialTree={tree}
          treeId="tree-123"
          forkedFromId={undefined}
        />
      );
    });

  test("selects the single child by default when root has one child", async () => {
    await renderEditor();

    await waitFor(() => expect(capturedTreeProps).toBeTruthy());
    expect(capturedTreeProps.selectedNodeId).toBe("child-1");
  });

  test("add child returns new id, updates tree, and triggers save", async () => {
    await renderEditor();
    await waitFor(() => capturedTreeProps !== null);

    let newId: string | null = null;
    await act(async () => {
      newId = capturedTreeProps.onAddChild("child-1");
    });
    expect(newId).toBe("new-id");

    await waitFor(() => {
      const child = capturedTreeProps.node.children.find((c: IssueNode) => c.id === "child-1");
      expect(child?.children).toHaveLength(1);
      expect(capturedTreeProps.selectedNodeId).toBe("new-id");
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/issue-trees/tree-123", expect.objectContaining({ method: "PATCH" }));
  });

  test("add sibling sets selection to new sibling and saves", async () => {
    await renderEditor();
    await waitFor(() => capturedTreeProps !== null);

    // Make sure we add a sibling to the existing child
    let siblingId: string | null = null;
    await act(async () => {
      siblingId = capturedTreeProps.onAddSibling("child-1");
    });
    expect(siblingId).toBe("new-id");

    await waitFor(() => {
      const childrenIds = capturedTreeProps.node.children.map((c: IssueNode) => c.id);
      expect(childrenIds).toContain("new-id");
      expect(capturedTreeProps.selectedNodeId).toBe("new-id");
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/issue-trees/tree-123", expect.objectContaining({ method: "PATCH" }));
  });

  test("deleting a child selects its parent", async () => {
    await renderEditor();
    await waitFor(() => capturedTreeProps !== null);

    // initial selection is child-1; deleting should select root
    await act(async () => {
      capturedTreeProps.onDelete("child-1");
    });

    await waitFor(() => {
      expect(capturedTreeProps.node.children).toHaveLength(0);
      expect(capturedTreeProps.selectedNodeId).toBe("root-1");
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/issue-trees/tree-123", expect.objectContaining({ method: "PATCH" }));
  });
});
