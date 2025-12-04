import React, { useState } from "react";
import { Check, X, Pencil } from "lucide-react";
import type { IssueTreeAiSuggestion, LlmProposedNode } from "@/schema/issueTreeAiOperations";

interface SuggestionPreviewCardProps {
  suggestion: IssueTreeAiSuggestion;
  currentContent?: string;
  onAccept: () => void;
  onDiscard: () => void;
  onEditAndAccept?: (editedSuggestion: IssueTreeAiSuggestion) => void;
}

const SuggestionPreviewCard: React.FC<SuggestionPreviewCardProps> = ({
  suggestion,
  currentContent,
  onAccept,
  onDiscard,
  onEditAndAccept,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<string>("");
  const [editedChildren, setEditedChildren] = useState<LlmProposedNode[]>([]);

  const handleStartEdit = () => {
    setIsEditing(true);
    if (suggestion.type === "rewriteLabel") {
      setEditedContent(suggestion.proposedContent);
    } else if (suggestion.type === "suggestSibling") {
      setEditedContent(suggestion.proposedSibling.content);
    } else if (suggestion.type === "suggestChildren" || suggestion.type === "restructureChildren") {
      setEditedChildren([...suggestion.proposedChildren]);
    }
  };

  const handleSaveEdit = () => {
    if (!onEditAndAccept) return;

    let editedSuggestion: IssueTreeAiSuggestion;

    if (suggestion.type === "rewriteLabel") {
      editedSuggestion = {
        ...suggestion,
        proposedContent: editedContent,
      };
    } else if (suggestion.type === "suggestSibling") {
      editedSuggestion = {
        ...suggestion,
        proposedSibling: { ...suggestion.proposedSibling, content: editedContent },
      };
    } else if (suggestion.type === "suggestChildren") {
      editedSuggestion = {
        ...suggestion,
        proposedChildren: editedChildren,
      };
    } else {
      editedSuggestion = {
        ...suggestion,
        proposedChildren: editedChildren,
      };
    }

    onEditAndAccept(editedSuggestion);
    setIsEditing(false);
  };

  const renderContent = () => {
    switch (suggestion.type) {
      case "suggestChildren":
        return (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Suggested children
            </div>
            {isEditing ? (
              <div className="space-y-2">
                {editedChildren.map((child, index) => (
                  <input
                    key={index}
                    type="text"
                    value={child.content}
                    onChange={(e) => {
                      const newChildren = [...editedChildren];
                      newChildren[index] = { ...child, content: e.target.value };
                      setEditedChildren(newChildren);
                    }}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {suggestion.proposedChildren.map((child, index) => (
                  <li key={index} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-[#e07a2f] mt-0.5">+</span>
                    <span>{child.content}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case "suggestSibling":
        return (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Suggested sibling
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
              />
            ) : (
                <div className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-[#e07a2f] mt-0.5">+</span>
                  <span>{suggestion.proposedSibling.content}</span>
                </div>
            )}
          </div>
        );

      case "rewriteLabel":
        return (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Improved label
            </div>
            <div className="space-y-1">
              {currentContent && (
                <div className="text-sm text-muted-foreground line-through">
                  {currentContent}
                </div>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                />
              ) : (
                <div className="text-sm text-foreground font-medium">
                  {suggestion.proposedContent}
                </div>
              )}
            </div>
          </div>
        );

      case "restructureChildren":
        return (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Restructured children
            </div>
            {isEditing ? (
              <div className="space-y-2">
                {editedChildren.map((child, index) => (
                  <input
                    key={index}
                    type="text"
                    value={child.content}
                    onChange={(e) => {
                      const newChildren = [...editedChildren];
                      newChildren[index] = { ...child, content: e.target.value };
                      setEditedChildren(newChildren);
                    }}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {suggestion.proposedChildren.map((child, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-[#e07a2f] mt-0.5">~</span>
                      <span>{child.content}</span>
                    </li>
                ))}
              </ul>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-secondary border border-border rounded-lg p-3 shadow-md mt-2 w-56">
      {renderContent()}

      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#f5d4bc]">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-[#e07a2f] hover:bg-[#c96a25] rounded transition-colors"
            >
              <Check size={12} />
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground bg-secondary hover:bg-accent rounded transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              <Check size={12} />
              Accept
            </button>
            {onEditAndAccept && (
              <button
                onClick={handleStartEdit}
                className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground bg-secondary hover:bg-accent rounded transition-colors"
                title="Edit then accept"
              >
                <Pencil size={12} />
              </button>
            )}
            <button
              onClick={onDiscard}
              className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
              title="Discard"
            >
              <X size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SuggestionPreviewCard;
