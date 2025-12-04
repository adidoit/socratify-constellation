import React, { useEffect, useRef, useState } from "react";
import { IssueNode, IssueTreeAiGenerateMode, NodeTag } from "@/types";
import { getDepthLabel, getNodeStyle } from "@/constants";
import { HelpCircle, Layers, Loader2, Plus, Sparkles, Target, Trash2, X as XIcon } from "lucide-react";
import type { IssueTreeAiSuggestion, IssueTreeAiOperationType } from "@/schema/issueTreeAiOperations";
import SuggestionPreviewCard from "./SuggestionPreviewCard";

const TAG_COLORS: string[] = [
  "#DBEAFE", // blue-100
  "#DCFCE7", // green-100
  "#FEF3C7", // amber-100
  "#FCE7F3", // pink-100
  "#E0F2FE", // sky-100
  "#EDE9FE", // violet-100
];

const getTagColor = (label: string): string => {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
};

interface NodeItemProps {
  node: IssueNode;
  depth: number;
  onAddChild: (parentId: string) => void;
  onAddSibling: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate: (nodeId: string, content: string) => void;
  onUpdateTags?: (nodeId: string, tags: NodeTag[]) => void;
  isSelected?: boolean;
  onSelect?: (nodeId: string) => void;
  aiLoadingNodeId?: string | null;
  pendingSuggestion?: { targetNodeId: string; suggestion: IssueTreeAiSuggestion } | null;
  aiError?: { nodeId: string; message: string } | null;
  onAiOperation?: (nodeId: string, operation: IssueTreeAiOperationType) => void;
  onAiGenerateNode?: (nodeId: string, mode: IssueTreeAiGenerateMode) => void;
  onAcceptSuggestion?: () => void;
  onDiscardSuggestion?: () => void;
  onEditAndAcceptSuggestion?: (editedSuggestion: IssueTreeAiSuggestion) => void;
}

const NodeItem: React.FC<NodeItemProps> = ({
  node,
  depth,
  onAddChild,
  onAddSibling,
  onDelete,
  onUpdate,
  onUpdateTags,
  isSelected = false,
  onSelect,
  aiLoadingNodeId,
  pendingSuggestion,
  aiError,
  onAiOperation,
  onAiGenerateNode,
  onAcceptSuggestion,
  onDiscardSuggestion,
  onEditAndAcceptSuggestion,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isTagEditing, setIsTagEditing] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const tagInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!node.content && node.type !== "root") {
      setIsEditing(true);
    }
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  useEffect(() => {
    if (isTagEditing && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isTagEditing]);

  const isRoot = node.type === "root";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isRoot) {
        onAddSibling(node.id);
      }
      setIsEditing(false);
    }

    if (e.key === "Tab") {
      e.preventDefault();
      onAddChild(node.id);
      setIsEditing(false);
    }

    if (e.key === "Backspace" && node.content === "" && !isRoot) {
      e.preventDefault();
      onDelete(node.id);
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "question":
        return <HelpCircle className="w-3 h-3 mr-1 opacity-50" />;
      case "action":
        return <Target className="w-3 h-3 mr-1 opacity-50" />;
      default:
        return <Layers className="w-3 h-3 mr-1 opacity-50" />;
    }
  };

  const depthLabel = getDepthLabel(depth);
  const nodeStyles = getNodeStyle(node.type, depth);

  const placeholderText =
    depth === 0
      ? "Define the problem..."
      : depth === 1
        ? "Add a key driver..."
        : depth === 2
          ? "Add a sub-issue..."
          : "Add analysis...";

  const handleClick = () => {
    if (onSelect) {
      onSelect(node.id);
    }
  };

  const tags = node.tags ?? [];

  const handleAddTag = () => {
    const label = newTagLabel.trim();
    if (!label || !onUpdateTags) return;
    const newTag: NodeTag = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      label,
    };
    onUpdateTags(node.id, [...tags, newTag]);
    setNewTagLabel("");
    setIsTagEditing(false);
  };

  const handleRemoveTag = (tagId: string) => {
    if (!onUpdateTags) return;
    onUpdateTags(
      node.id,
      tags.filter((tag) => tag.id !== tagId)
    );
  };

  return (
    <div
      className={`relative flex flex-col items-center group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={handleClick}
    >
      <div
        className={`
          relative z-20 flex flex-col w-56 rounded-lg border shadow-sm
          ${nodeStyles}
          ${isSelected ? "ring-2 ring-primary ring-offset-2 shadow-md" : ""}
          transition-all duration-150 hover:shadow-md
        `}
      >
        <div className="flex flex-col p-4 min-h-[7rem] justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-[10px] font-mono font-bold uppercase tracking-wider opacity-40 select-none whitespace-nowrap hover:opacity-60 transition-opacity">
              {getNodeIcon(node.type)}
              <span className="ml-1">{depthLabel}</span>
            </div>

            <div className="flex items-center gap-1">
              {!isRoot && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                  className={`p-1 rounded hover:bg-red-100 text-red-500 transition-all duration-200 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                  title="Delete Node (Backspace)"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="flex items-start gap-1">
              <textarea
                ref={inputRef}
                value={node.content}
                onChange={(e) => {
                  onUpdate(node.id, e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onBlur={() => setIsEditing(false)}
                onFocus={() => {
                  if (onSelect) {
                    onSelect(node.id);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholderText}
                className={`w-full bg-transparent resize-none outline-none font-sans leading-relaxed overflow-hidden transition-all duration-150 placeholder:text-muted-foreground/50 focus:placeholder:text-muted-foreground/30 ${
                  depth === 0
                    ? "text-tree-root placeholder:font-display"
                    : depth === 1
                      ? "text-tree-level-1 placeholder:font-display"
                      : depth === 2
                        ? "text-tree-level-2"
                        : "text-tree-level-3"
                }`}
                rows={1}
              />
            </div>
          ) : (
            <div
              onClick={() => {
                setIsEditing(true);
                if (onSelect) {
                  onSelect(node.id);
                }
              }}
              className={`cursor-text break-words leading-relaxed transition-all duration-150 ${
                depth === 0
                  ? "text-tree-root"
                  : depth === 1
                    ? "text-tree-level-1"
                    : depth === 2
                      ? "text-tree-level-2"
                      : "text-tree-level-3"
              } ${!node.content ? "text-muted-foreground italic" : ""} ${
                isSelected ? "font-display font-semibold text-foreground" : ""
              }`}
              title="Click to edit"
            >
              {node.content || placeholderText}
            </div>
          )}
          {onUpdateTags && (
            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center max-w-full rounded-full border border-border/60 px-2 py-0.5 text-[10px]"
                    style={{ backgroundColor: getTagColor(tag.label) }}
                  >
                    <span className="truncate text-slate-900">{tag.label}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tag.id);
                      }}
                      className="ml-1 flex-shrink-0 text-muted-foreground/70 hover:text-foreground"
                      aria-label="Remove tag"
                    >
                      <XIcon size={10} />
                    </button>
                  </span>
                ))}

                {isTagEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      ref={tagInputRef}
                      type="text"
                      value={newTagLabel}
                      onChange={(e) => setNewTagLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setIsTagEditing(false);
                          setNewTagLabel("");
                        }
                      }}
                      placeholder="Add tag..."
                      className="rounded-md border border-border bg-background px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTagEditing(true);
                    }}
                    className="inline-flex items-center rounded-full border border-dashed border-border/70 bg-transparent px-2 py-0.5 text-[10px] text-muted-foreground hover:border-border hover:bg-muted/40 export-hidden"
                    title={tags.length ? "Add another tag" : "Add tag"}
                  >
                    {tags.length ? "Add tag" : "Add tag"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`
        absolute left-full top-1/2 -translate-y-1/2 z-30
        transition-all duration-300 ease-in-out pl-2 export-hidden
        ${isHovered ? "opacity-100 translate-x-0 visible delay-0" : "opacity-0 -translate-x-2 invisible delay-500"}
      `}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddChild(node.id)}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground border border-primary/70 shadow-lg hover:bg-primary/90 hover:scale-110 transition-transform"
            title="Add Child (Tab)"
          >
            <Plus size={16} />
          </button>
          {onAiGenerateNode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAiGenerateNode(node.id, "child");
              }}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-200 text-amber-900 border border-amber-300 shadow-lg hover:bg-amber-300 hover:scale-110 transition-transform disabled:opacity-60 disabled:hover:scale-100"
              disabled={aiLoadingNodeId === node.id}
              title="Let AI create a child"
            >
              {aiLoadingNodeId === node.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
            </button>
          )}
        </div>
      </div>

      {!isRoot && (
        <div
          className={`
            absolute top-full left-1/2 -translate-x-1/2 z-30
            transition-all duration-300 ease-in-out pt-2 export-hidden
            ${isHovered && !(pendingSuggestion && pendingSuggestion.targetNodeId === node.id) ? "opacity-100 translate-y-0 visible delay-0" : "opacity-0 -translate-y-2 invisible delay-500"}
         `}
        >
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddSibling(node.id)}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground border border-primary/70 shadow-lg hover:bg-primary/90 hover:scale-110 transition-transform"
              title="Add Sibling (Enter)"
            >
              <Plus size={16} />
            </button>
            {onAiGenerateNode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAiGenerateNode(node.id, "sibling");
                }}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-200 text-amber-900 border border-amber-300 shadow-lg hover:bg-amber-300 hover:scale-110 transition-transform disabled:opacity-60 disabled:hover:scale-100"
                disabled={aiLoadingNodeId === node.id}
                title="Let AI create a sibling"
              >
                {aiLoadingNodeId === node.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {aiError && aiError.nodeId === node.id && (
        <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {aiError.message}
        </div>
      )}

      {pendingSuggestion && pendingSuggestion.targetNodeId === node.id && (
        <SuggestionPreviewCard
          suggestion={pendingSuggestion.suggestion}
          currentContent={node.content}
          onAccept={onAcceptSuggestion || (() => {})}
          onDiscard={onDiscardSuggestion || (() => {})}
          onEditAndAccept={onEditAndAcceptSuggestion}
        />
      )}
    </div>
  );
};

export default NodeItem;
