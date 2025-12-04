import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { IssueTreeAiOperationType } from "@/schema/issueTreeAiOperations";

interface AiDropdownMenuProps {
  nodeId: string;
  isRoot: boolean;
  isLoading: boolean;
  onSelectOperation: (operation: IssueTreeAiOperationType) => void;
  onOpenChange?: (open: boolean) => void;
}

const AI_OPERATIONS: { type: IssueTreeAiOperationType; label: string; description: string }[] = [
  { type: "suggestChildren", label: "Suggest children", description: "Add child nodes" },
  { type: "suggestSibling", label: "Suggest sibling", description: "Add a sibling node" },
  { type: "rewriteLabel", label: "Improve label", description: "Rewrite this node's text" },
  { type: "restructureChildren", label: "Restructure level", description: "Reorganize children" },
];

const AiDropdownMenu: React.FC<AiDropdownMenuProps> = ({
  nodeId,
  isRoot,
  isLoading,
  onSelectOperation,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const setMenuOpen = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };
  const [openUpwards, setOpenUpwards] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const availableOperations = AI_OPERATIONS.filter((op) => {
    if (isRoot && op.type === "suggestSibling") {
      return false;
    }
    return true;
  });

  const updateMenuDirection = useCallback(() => {
    if (!menuRef.current || typeof window === "undefined") return;

    const rect = menuRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Estimate menu height: ~44px per item + padding
    const estimatedMenuHeight = availableOperations.length * 44 + 24;

    // Account for header bar (~140px) when calculating space above
    const headerOffset = 140;
    const spaceAbove = Math.max(0, rect.top - headerOffset);
    const spaceBelow = viewportHeight - rect.bottom;

    // Determine menu direction based on available space
    let shouldOpenUp: boolean;

    if (spaceAbove >= estimatedMenuHeight && spaceBelow >= estimatedMenuHeight) {
      // Both sides fit: prefer opening upwards
      shouldOpenUp = true;
    } else if (spaceAbove >= estimatedMenuHeight) {
      // Only above fits
      shouldOpenUp = true;
    } else if (spaceBelow >= estimatedMenuHeight) {
      // Only below fits
      shouldOpenUp = false;
    } else {
      // Neither side fully fits: open downwards as fallback
      shouldOpenUp = false;
    }

    setOpenUpwards(shouldOpenUp);
  }, [availableOperations.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Recompute direction on resize/scroll while menu is open
  useEffect(() => {
    if (!isOpen) return;

    const handle = () => updateMenuDirection();
    handle(); // Initial check

    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);

    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [isOpen, updateMenuDirection]);

  const handleOperationClick = (operation: IssueTreeAiOperationType) => {
    setMenuOpen(false);
    onSelectOperation(operation);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isLoading) return;

          if (!isOpen) {
            // Calculate direction before opening
            updateMenuDirection();
          }
          setMenuOpen(!isOpen);
        }}
        disabled={isLoading}
        className="flex items-center justify-center p-1.5 text-[#e07a2f] bg-[#fdf4ed] hover:bg-[#fbe8d8] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="AI suggestions"
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Sparkles size={14} />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 w-48 bg-white rounded-lg shadow-lg border border-border z-50 py-1 overflow-hidden ${
            openUpwards ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {availableOperations.map((op) => (
            <button
              key={op.type}
              onClick={(e) => {
                e.stopPropagation();
                handleOperationClick(op.type);
              }}
              className="w-full px-3 py-2 text-left hover:bg-neutral-100 transition-colors"
            >
              <div className="text-sm font-medium text-neutral-900">{op.label}</div>
              <div className="text-xs text-neutral-600">{op.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiDropdownMenu;
