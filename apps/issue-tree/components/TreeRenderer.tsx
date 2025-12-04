import React from "react";
import { IssueNode, IssueTreeAiGenerateMode, NodeTag } from "@/types";
import NodeItem from "./NodeItem";
import type { IssueTreeAiSuggestion, IssueTreeAiOperationType } from "@/schema/issueTreeAiOperations";

interface TreeRendererProps {
  node: IssueNode;
  onAddChild: (parentId: string) => void;
  onAddSibling: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate: (nodeId: string, content: string) => void;
   onUpdateTags?: (nodeId: string, tags: NodeTag[]) => void;
  depth?: number;
  selectedNodeId?: string;
  onSelectNode?: (nodeId: string) => void;
  aiLoadingNodeId?: string | null;
  pendingSuggestion?: { targetNodeId: string; suggestion: IssueTreeAiSuggestion } | null;
  aiError?: { nodeId: string; message: string } | null;
  onAiOperation?: (nodeId: string, operation: IssueTreeAiOperationType) => void;
  onAiGenerateNode?: (nodeId: string, mode: IssueTreeAiGenerateMode) => void;
  onAcceptSuggestion?: () => void;
  onDiscardSuggestion?: () => void;
  onEditAndAcceptSuggestion?: (editedSuggestion: IssueTreeAiSuggestion) => void;
}

const TreeRenderer: React.FC<TreeRendererProps> = ({
  node,
  onAddChild,
  onAddSibling,
  onDelete,
  onUpdate,
  onUpdateTags,
  depth = 0,
  selectedNodeId,
  onSelectNode,
  aiLoadingNodeId,
  pendingSuggestion,
  aiError,
  onAiOperation,
  onAiGenerateNode,
  onAcceptSuggestion,
  onDiscardSuggestion,
  onEditAndAcceptSuggestion,
}) => {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 z-10 relative">
        <NodeItem
          node={node}
          depth={depth}
          onAddChild={onAddChild}
          onAddSibling={onAddSibling}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onUpdateTags={onUpdateTags}
          isSelected={selectedNodeId === node.id}
          onSelect={onSelectNode}
          aiLoadingNodeId={aiLoadingNodeId}
          pendingSuggestion={pendingSuggestion}
          aiError={aiError}
          onAiOperation={onAiOperation}
          onAiGenerateNode={onAiGenerateNode}
          onAcceptSuggestion={onAcceptSuggestion}
          onDiscardSuggestion={onDiscardSuggestion}
          onEditAndAcceptSuggestion={onEditAndAcceptSuggestion}
        />
      </div>

      {node.children.length > 0 && (
        <div className="flex flex-col ml-24 relative">
          <div className="absolute top-1/2 -left-24 w-12 h-[3px] bg-border" />

          {node.children.map((child, index) => {
            const isFirst = index === 0;
            const isLast = index === node.children.length - 1;
            const isOnly = node.children.length === 1;

            return (
              <div key={child.id} className="relative flex items-center py-10">
                {isOnly ? (
                  <div className="absolute -left-12 w-12 h-[3px] bg-border" />
                ) : (
                  <>
                    <div
                      className={`
                        absolute -left-12 top-0 w-12 h-[calc(50%+0.5px)]
                        ${
                          isLast
                            ? "border-l-2 border-b-2 rounded-bl-2xl border-border"
                            : isFirst
                              ? ""
                              : "border-l-2 border-border"
                        }
                      `}
                    />

                    <div
                      className={`
                        absolute -left-12 bottom-0 w-12 h-1/2
                        ${
                          isFirst
                            ? "border-l-2 border-t-2 rounded-tl-2xl border-border"
                            : !isLast
                              ? "border-l-2 border-border"
                              : ""
                        }
                      `}
                    />

                    {!isFirst && !isLast && (
                      <div className="absolute -left-12 top-1/2 w-12 h-[3px] bg-border" />
                    )}
                  </>
                )}

                <TreeRenderer
                  node={child}
                  onAddChild={onAddChild}
                  onAddSibling={onAddSibling}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onUpdateTags={onUpdateTags}
                  depth={depth + 1}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  aiLoadingNodeId={aiLoadingNodeId}
                  pendingSuggestion={pendingSuggestion}
                  aiError={aiError}
                  onAiOperation={onAiOperation}
                  onAiGenerateNode={onAiGenerateNode}
                  onAcceptSuggestion={onAcceptSuggestion}
                  onDiscardSuggestion={onDiscardSuggestion}
                  onEditAndAcceptSuggestion={onEditAndAcceptSuggestion}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TreeRenderer;
