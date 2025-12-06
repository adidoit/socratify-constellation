import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TreeRenderer from "@/components/TreeRenderer";
import type { IssueNode } from "@/types";
import NodeItem from "@/components/NodeItem";

jest.mock("@/components/NodeItem", () => {
  const React = require("react");
  const mock = jest.fn((props: any) =>
    React.createElement("div", {
      "data-testid": `node-${props.node.id}`,
      "data-depth": props.depth,
      "data-selected": props.isSelected ? "true" : "false",
      onClick: () => props.onSelect?.(props.node.id),
    })
  );
  return { __esModule: true, default: mock };
});

describe("TreeRenderer", () => {
  const sampleTree: IssueNode = {
    id: "root",
    content: "Root",
    type: "root",
    parentId: null,
    isExpanded: true,
    children: [
      {
        id: "child-1",
        content: "Child 1",
        type: "hypothesis",
        parentId: "root",
        isExpanded: true,
        children: [],
      },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders NodeItem for root and children with correct depth", () => {
    render(
      <TreeRenderer
        node={sampleTree}
        onAddChild={jest.fn()}
        onAddSibling={jest.fn()}
        onDelete={jest.fn()}
        onUpdate={jest.fn()}
      />
    );

    expect(screen.getByTestId("node-root").dataset.depth).toBe("0");
    expect(screen.getByTestId("node-child-1").dataset.depth).toBe("1");
  });

  test("propagates selection state to matching node", () => {
    render(
      <TreeRenderer
        node={sampleTree}
        onAddChild={jest.fn()}
        onAddSibling={jest.fn()}
        onDelete={jest.fn()}
        onUpdate={jest.fn()}
        selectedNodeId="child-1"
      />
    );

    expect(screen.getByTestId("node-child-1").dataset.selected).toBe("true");
    expect(screen.getByTestId("node-root").dataset.selected).toBe("false");
  });

  test("bubbles onSelectNode from NodeItem click", () => {
    const onSelectNode = jest.fn();
    render(
      <TreeRenderer
        node={sampleTree}
        onAddChild={jest.fn()}
        onAddSibling={jest.fn()}
        onDelete={jest.fn()}
        onUpdate={jest.fn()}
        onSelectNode={onSelectNode}
      />
    );

    fireEvent.click(screen.getByTestId("node-child-1"));

    expect(onSelectNode).toHaveBeenCalledWith("child-1");
  });
});
