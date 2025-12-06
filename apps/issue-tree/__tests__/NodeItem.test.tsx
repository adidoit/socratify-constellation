import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import NodeItem from "@/components/NodeItem";
import type { IssueNode, NodeTag } from "@/types";

const baseNode: IssueNode = {
  id: "node-1",
  content: "Initial content",
  type: "hypothesis",
  children: [],
  parentId: "root-1",
  isExpanded: true,
};

const renderNode = (override?: Partial<IssueNode>) => {
  const onAddChild = jest.fn();
  const onAddSibling = jest.fn();
  const onDelete = jest.fn();
  const onUpdate = jest.fn();
  const onUpdateTags = jest.fn();
  const onSelect = jest.fn();

  const node = { ...baseNode, ...override };

  render(
    <NodeItem
      node={node}
      depth={1}
      onAddChild={onAddChild}
      onAddSibling={onAddSibling}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onUpdateTags={onUpdateTags}
      onSelect={onSelect}
    />
  );

  return {
    onAddChild,
    onAddSibling,
    onDelete,
    onUpdate,
    onUpdateTags,
    onSelect,
  };
};

describe("NodeItem", () => {
  test("invokes onSelect when viewing content", () => {
    const { onSelect } = renderNode();
    fireEvent.click(screen.getByText("Initial content"));
    expect(onSelect).toHaveBeenCalledWith("node-1");
  });

  test("Enter adds sibling when editing an empty node", () => {
    const { onAddSibling } = renderNode({ content: "" });
    const textarea = screen.getByPlaceholderText("Add a key driver...");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onAddSibling).toHaveBeenCalledWith("node-1");
  });

  test("Tab adds child when editing", () => {
    const { onAddChild } = renderNode({ content: "" });
    const textarea = screen.getByPlaceholderText("Add a key driver...");
    fireEvent.keyDown(textarea, { key: "Tab" });
    expect(onAddChild).toHaveBeenCalledWith("node-1");
  });

  test("Backspace deletes empty non-root node", () => {
    const { onDelete } = renderNode({ content: "" });
    const textarea = screen.getByPlaceholderText("Add a key driver...");
    fireEvent.keyDown(textarea, { key: "Backspace" });
    expect(onDelete).toHaveBeenCalledWith("node-1");
  });

  test("adds a tag and forwards to onUpdateTags", () => {
    const { onUpdateTags } = renderNode({ tags: [] });

    fireEvent.click(screen.getByText("Add tag"));

    const input = screen.getByPlaceholderText("Add tag...");
    fireEvent.change(input, { target: { value: "Urgent" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdateTags).toHaveBeenCalledTimes(1);
    const [_nodeId, tags] = onUpdateTags.mock.calls[0] as [string, NodeTag[]];
    expect(tags).toHaveLength(1);
    expect(tags[0].label).toBe("Urgent");
  });

  test("removes a tag via the remove control", () => {
    const existingTag: NodeTag = { id: "tag-1", label: "Impact" };
    const { onUpdateTags } = renderNode({ tags: [existingTag] });

    fireEvent.click(screen.getByLabelText("Remove tag"));

    expect(onUpdateTags).toHaveBeenCalledWith("node-1", []);
  });
});
