"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Download, GitBranch, History, Image as ImageIcon, Loader2, Minus, Plus, RotateCcw, Share2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as htmlToImage from "html-to-image";
import TreeRenderer from "@/components/TreeRenderer";
import { AppShell, useSidebar } from "@/components/AppShell";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { SocratifyBranding } from "@/components/SocratifyBranding";

// Wrapper component that uses sidebar context (must be rendered inside AppShell)
function SidebarCollapseOnClick({ children, onMouseDown }: { 
  children: React.ReactNode; 
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const { collapseSidebar } = useSidebar();
  
  const handleMouseDown = (e: React.MouseEvent) => {
    collapseSidebar();
    onMouseDown(e);
  };
  
  return (
    <div onMouseDown={handleMouseDown} style={{ display: 'contents' }}>
      {children}
    </div>
  );
}
import type { IssueNode, IssueTreeAiGenerateMode, NodeTag } from "@/types";
import type { IssueTreeJson } from "@/schema/issueTree";
import type {
  IssueTreeAiSuggestion,
  IssueTreeAiOperationType,
  IssueTreeAiResponse,
  LlmProposedNode,
} from "@/schema/issueTreeAiOperations";

const revisionsSchema = z.array(
  z.object({
    id: z.string(),
    label: z.string().nullable(),
    createdAt: z.string(),
  })
);

const revisionDetailSchema = z.object({
  id: z.string(),
  issueTreeId: z.string(),
  label: z.string().nullable(),
  createdAt: z.string(),
  tree: z.unknown(),
});

const restoreResponseSchema = z.object({
  id: z.string(),
  tree: z.unknown(),
  updatedAt: z.string(),
});

type IssueTreeEditorProps = {
  initialTree: IssueTreeJson;
  treeId: string;
  forkedFromId?: string;
  forkedFromTitle?: string | null;
};

const getRootNode = (tree: IssueTreeJson): IssueNode => {
  if ("root" in (tree as any)) {
    return (tree as any).root as IssueNode;
  }
  return tree as IssueNode;
};

const getDefaultSelectedNodeId = (root: IssueNode): string => {
  if (root.children.length === 1) {
    return root.children[0].id;
  }
  return root.id;
};

export const IssueTreeEditor: React.FC<IssueTreeEditorProps> = ({
  initialTree,
  treeId,
  forkedFromId,
  forkedFromTitle,
}) => {
  const [rootNode, setRootNode] = useState<IssueNode>(() => getRootNode(initialTree));
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState({
    isPanning: false,
    startX: 0,
    startY: 0,
  });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [selectedNodeId, setSelectedNodeId] = useState<string>(() => 
    getDefaultSelectedNodeId(getRootNode(initialTree))
  );
  const [pendingSuggestion, setPendingSuggestion] = useState<{
    targetNodeId: string;
    suggestion: IssueTreeAiSuggestion;
  } | null>(null);
  const [aiLoadingNodeId, setAiLoadingNodeId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<{ nodeId: string; message: string } | null>(null);
  const [copyMessageVisible, setCopyMessageVisible] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [revisions, setRevisions] = useState<
    { id: string; label: string | null; createdAt: string }[]
  >([]);
  const [isRevisionsLoading, setIsRevisionsLoading] = useState(false);
  const [previewRevisionId, setPreviewRevisionId] = useState<string | null>(null);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const latestTreeRef = useRef<IssueNode | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const treeRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const helperRef = useRef<HTMLDivElement | null>(null);

  const findNode = useCallback((id: string, node: IssueNode): IssueNode | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNode(id, child);
      if (found) return found;
    }
    return null;
  }, []);

  const updateTree = useCallback((newRoot: IssueNode) => {
    setRootNode({ ...newRoot });
  }, []);

  const saveTree = useCallback(
    async (tree: IssueNode) => {
      try {
        await fetch(`/api/issue-trees/${treeId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tree }),
        });
      } catch (err) {
        console.error("Failed to save issue tree", err);
      }
    },
    [treeId]
  );

  const handleUpdateNode = (id: string, content: string) => {
    if (previewRevisionId) return;
    const clone = JSON.parse(JSON.stringify(rootNode)) as IssueNode;
    const target = findNode(id, clone);
    if (target) {
      target.content = content;
      updateTree(clone);
      void saveTree(clone);
    }
  };

  const handleAddChild = (parentId: string): string | null => {
    if (previewRevisionId) return null;
    const clone = JSON.parse(JSON.stringify(rootNode)) as IssueNode;
    const parent = findNode(parentId, clone);
    if (parent) {
      const newChildId = crypto.randomUUID();
      const newChild: IssueNode = {
        id: newChildId,
        content: "",
        type: "hypothesis",
        children: [],
        parentId,
        isExpanded: true,
      };
      parent.children.push(newChild);
      parent.isExpanded = true;
      updateTree(clone);
      void saveTree(clone);
      setSelectedNodeId(newChildId);
      return newChildId;
    }
    return null;
  };

  const handleAddSibling = (nodeId: string): string | null => {
    if (previewRevisionId) return null;
    if (nodeId === rootNode.id) return null;

    const clone = JSON.parse(JSON.stringify(rootNode)) as IssueNode;
    const targetNode = findNode(nodeId, clone);

    if (targetNode && targetNode.parentId) {
      const parent = findNode(targetNode.parentId, clone);
      if (parent) {
        const newSiblingId = crypto.randomUUID();
        const newSibling: IssueNode = {
          id: newSiblingId,
          content: "",
          type: targetNode.type,
          children: [],
          parentId: parent.id,
          isExpanded: true,
        };

        const index = parent.children.findIndex(
          (c: IssueNode) => c.id === nodeId
        );
        if (index !== -1) {
          parent.children.splice(index + 1, 0, newSibling);
        } else {
          parent.children.push(newSibling);
        }
        updateTree(clone);
        void saveTree(clone);
        setSelectedNodeId(newSiblingId);
        return newSiblingId;
      }
    }
    return null;
  };

  const handleDeleteNode = (nodeId: string) => {
    if (previewRevisionId) return;
    if (nodeId === rootNode.id) return;

    const clone = JSON.parse(JSON.stringify(rootNode)) as IssueNode;
    const targetNode = findNode(nodeId, clone);
    const parentId = targetNode?.parentId;

    const deleteFromChildren = (node: IssueNode): boolean => {
      const idx = node.children.findIndex((c) => c.id === nodeId);
      if (idx !== -1) {
        node.children.splice(idx, 1);
        return true;
      }
      return node.children.some((child) => deleteFromChildren(child));
    };

    deleteFromChildren(clone);
    updateTree(clone);
    void saveTree(clone);

    if (selectedNodeId === nodeId && parentId) {
      setSelectedNodeId(parentId);
    }
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(rootNode, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "issue-tree.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportImage = async () => {
    setIsExportingImage(true);

    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );

    if (!treeRef.current) {
      setIsExportingImage(false);
      return;
    }
    const controlsEl = controlsRef.current;
    const helperEl = helperRef.current;
    const treeEl = treeRef.current;

    const exportHiddenEls = Array.from(
      treeEl.querySelectorAll<HTMLElement>(".export-hidden")
    );
    const prevExportHiddenDisplay = exportHiddenEls.map(
      (el) => el.style.display
    );

    const prevControlsVisibility = controlsEl?.style.visibility;
    const prevHelperVisibility = helperEl?.style.visibility;
    const prevTransform = treeEl.style.transform;
    const prevTransition = treeEl.style.transition;

    if (controlsEl) controlsEl.style.visibility = "hidden";
    if (helperEl) helperEl.style.visibility = "hidden";
    exportHiddenEls.forEach((el) => {
      el.style.display = "none";
    });
    treeEl.style.transition = "none";
    treeEl.style.transform = "translate(0px, 0px) scale(1)";

    try {
      const dataUrl = await htmlToImage.toPng(treeEl, {
        backgroundColor: "#f9fafb",
      });

      const link = document.createElement("a");
      link.download = "issue-tree.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image", err);
    } finally {
      setIsExportingImage(false);
      if (controlsEl && prevControlsVisibility !== undefined) {
        controlsEl.style.visibility = prevControlsVisibility;
      }
      if (helperEl && prevHelperVisibility !== undefined) {
        helperEl.style.visibility = prevHelperVisibility;
      }
      exportHiddenEls.forEach((el, index) => {
        el.style.display = prevExportHiddenDisplay[index];
      });
      treeEl.style.transform = prevTransform;
      treeEl.style.transition = prevTransition;
    }
  };

  const handleUpdateTags = (id: string, tags: NodeTag[]) => {
    if (previewRevisionId) return;
    const clone = JSON.parse(JSON.stringify(rootNode)) as IssueNode;
    const target = findNode(id, clone);
    if (target) {
      target.tags = tags;
      updateTree(clone);
      void saveTree(clone);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      setScale((s) => Math.min(Math.max(0.2, s + delta), 2));
    } else {
      setPosition((p) => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY,
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setPanning({
        isPanning: true,
        startX: e.clientX - position.x,
        startY: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (panning.isPanning) {
      setPosition({
        x: e.clientX - panning.startX,
        y: e.clientY - panning.startY,
      });
    }
  };

  const handleMouseUp = () => {
    setPanning((prev) => ({ ...prev, isPanning: false }));
  };

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleAiOperation = useCallback(
    async (nodeId: string, operation: IssueTreeAiOperationType) => {
      if (previewRevisionId) {
        return;
      }
      if (aiLoadingNodeId || pendingSuggestion) {
        return;
      }

      setAiLoadingNodeId(nodeId);
      setAiError(null);

      try {
        const response = await fetch("/api/issue-tree-edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tree: rootNode,
            targetNodeId: nodeId,
            operation: { type: operation },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate suggestion");
        }

        const data = (await response.json()) as IssueTreeAiResponse;
        setPendingSuggestion({
          targetNodeId: nodeId,
          suggestion: data.suggestion,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI couldn't suggest changes. Try again or edit manually.";
        setAiError({ nodeId, message });
      } finally {
        setAiLoadingNodeId(null);
      }
    },
    [aiLoadingNodeId, pendingSuggestion, rootNode]
  );

  const createNodeFromProposed = useCallback(
    (proposed: LlmProposedNode, parentId: string): IssueNode => ({
      id: crypto.randomUUID(),
      content: proposed.content,
      type: proposed.type || "hypothesis",
      children: [],
      parentId,
      isExpanded: true,
    }),
    []
  );

  const handleAiGenerateNode = useCallback(
    async (nodeId: string, mode: IssueTreeAiGenerateMode) => {
      if (previewRevisionId) {
        return;
      }
      if (aiLoadingNodeId) {
        return;
      }

      setAiLoadingNodeId(nodeId);
      setAiError(null);

      try {
        const response = await fetch("/api/issue-tree-generate-node", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tree: rootNode,
            targetNodeId: nodeId,
            mode,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate node");
        }

        const data = (await response.json()) as { proposedNode: LlmProposedNode };

        const clone = JSON.parse(JSON.stringify(rootNode)) as IssueNode;
        const target = findNode(nodeId, clone);

        if (!target) {
          throw new Error("Target node not found");
        }

        if (mode === "child") {
          const newChild = createNodeFromProposed(data.proposedNode, target.id);
          target.children.push(newChild);
          target.isExpanded = true;
          updateTree(clone);
          void saveTree(clone);
          setSelectedNodeId(newChild.id);
        } else if (mode === "sibling") {
          if (!target.parentId) {
            throw new Error("Cannot create sibling for root node");
          }
          const parent = findNode(target.parentId, clone);
          if (!parent) {
            throw new Error("Parent node not found");
          }
          const newSibling = createNodeFromProposed(data.proposedNode, parent.id);
          const index = parent.children.findIndex((c) => c.id === nodeId);
          if (index !== -1) {
            parent.children.splice(index + 1, 0, newSibling);
          } else {
            parent.children.push(newSibling);
          }
          updateTree(clone);
          void saveTree(clone);
          setSelectedNodeId(newSibling.id);
        } else if (mode === "complete") {
          target.content = data.proposedNode.content;
          if (data.proposedNode.type) {
            target.type = data.proposedNode.type;
          }
          updateTree(clone);
          void saveTree(clone);
          setSelectedNodeId(target.id);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "AI couldn't generate this node. Try again or edit manually.";
        setAiError({ nodeId, message });
      } finally {
        setAiLoadingNodeId(null);
      }
    },
    [aiLoadingNodeId, rootNode, findNode, createNodeFromProposed, updateTree, saveTree]
  );

  const applySuggestChildren = useCallback(
    (suggestion: IssueTreeAiSuggestion & { type: "suggestChildren" }) => {
      const clone = JSON.parse(JSON.stringify(rootNode)) as IssueNode;
      const target = findNode(suggestion.targetNodeId, clone);
      if (target) {
        const newChildren = suggestion.proposedChildren.map((proposed) =>
          createNodeFromProposed(proposed, target.id)
        );
        target.children.push(...newChildren);
        target.isExpanded = true;
        updateTree(clone);
        void saveTree(clone);
      }
    },
    [rootNode, findNode, createNodeFromProposed, updateTree, saveTree]
  );

  const applySuggestSibling = useCallback(
    (suggestion: IssueTreeAiSuggestion & { type: "suggestSibling" }) => {
      const clone = JSON.parse(JSON.stringify(rootNode)) as IssueNode;
      const target = findNode(suggestion.targetNodeId, clone);
      if (target && target.parentId) {
        const parent = findNode(target.parentId, clone);
        if (parent) {
          const newSibling = createNodeFromProposed(suggestion.proposedSibling, parent.id);
          const index = parent.children.findIndex((c) => c.id === suggestion.targetNodeId);
          if (index !== -1) {
            parent.children.splice(index + 1, 0, newSibling);
          } else {
            parent.children.push(newSibling);
          }
          updateTree(clone);
          void saveTree(clone);
        }
      }
    },
    [rootNode, findNode, createNodeFromProposed, updateTree, saveTree]
  );

  const applyRewriteLabel = useCallback(
    (suggestion: IssueTreeAiSuggestion & { type: "rewriteLabel" }) => {
      const clone = JSON.parse(JSON.stringify(rootNode)) as IssueNode;
      const target = findNode(suggestion.targetNodeId, clone);
      if (target) {
        target.content = suggestion.proposedContent;
        updateTree(clone);
        void saveTree(clone);
      }
    },
    [rootNode, findNode, updateTree, saveTree]
  );

  const applyRestructureChildren = useCallback(
    (suggestion: IssueTreeAiSuggestion & { type: "restructureChildren" }) => {
      const clone = JSON.parse(JSON.stringify(rootNode)) as IssueNode;
      const target = findNode(suggestion.targetNodeId, clone);
      if (target) {
        const newChildren = suggestion.proposedChildren.map((proposed) =>
          createNodeFromProposed(proposed, target.id)
        );
        target.children = newChildren;
        target.isExpanded = true;
        updateTree(clone);
        void saveTree(clone);
      }
    },
    [rootNode, findNode, createNodeFromProposed, updateTree, saveTree]
  );

  const handleAcceptSuggestion = useCallback(() => {
    if (!pendingSuggestion) return;

    const { suggestion } = pendingSuggestion;

    switch (suggestion.type) {
      case "suggestChildren":
        applySuggestChildren(suggestion);
        break;
      case "suggestSibling":
        applySuggestSibling(suggestion);
        break;
      case "rewriteLabel":
        applyRewriteLabel(suggestion);
        break;
      case "restructureChildren":
        applyRestructureChildren(suggestion);
        break;
    }

    setPendingSuggestion(null);
  }, [pendingSuggestion, applySuggestChildren, applySuggestSibling, applyRewriteLabel, applyRestructureChildren]);

  const handleDiscardSuggestion = useCallback(() => {
    setPendingSuggestion(null);
  }, []);

  const handleEditAndAcceptSuggestion = useCallback(
    (editedSuggestion: IssueTreeAiSuggestion) => {
      switch (editedSuggestion.type) {
        case "suggestChildren":
          applySuggestChildren(editedSuggestion);
          break;
        case "suggestSibling":
          applySuggestSibling(editedSuggestion);
          break;
        case "rewriteLabel":
          applyRewriteLabel(editedSuggestion);
          break;
        case "restructureChildren":
          applyRestructureChildren(editedSuggestion);
          break;
      }

      setPendingSuggestion(null);
    },
    [applySuggestChildren, applySuggestSibling, applyRewriteLabel, applyRestructureChildren]
  );

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLInputElement ||
        target.isContentEditable
      ) {
        return;
      }

      const currentNodeId = selectedNodeId || getDefaultSelectedNodeId(rootNode);
      const currentNode = findNode(currentNodeId, rootNode);

      if (!currentNode) return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (currentNode.type !== "root") {
          handleAddSibling(currentNodeId);
        }
      }

      if (e.key === "Tab") {
        e.preventDefault();
        handleAddChild(currentNodeId);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [selectedNodeId, rootNode, findNode, handleAddChild, handleAddSibling]);

  const openHistory = useCallback(async () => {
    setIsHistoryOpen(true);
    try {
      setIsRevisionsLoading(true);
      const response = await fetch(`/api/issue-trees/${treeId}/revisions`);
      if (!response.ok) return;
      const data = await response.json();
      const parsedRevisions = revisionsSchema.safeParse(data);

      if (parsedRevisions.success) {
        setRevisions(parsedRevisions.data);
      } else {
        console.error("Failed to parse revisions:", parsedRevisions.error);
        setRevisions([]);
      }
    } catch (err) {
      console.error("Failed to load revisions", err);
    } finally {
      setIsRevisionsLoading(false);
    }
  }, [treeId]);

  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false);
    if (previewRevisionId && latestTreeRef.current) {
      setRootNode({ ...latestTreeRef.current });
      setSelectedNodeId(getDefaultSelectedNodeId(latestTreeRef.current));
    }
    setPreviewRevisionId(null);
  }, [previewRevisionId]);

  const handlePreviewRevision = useCallback(
    async (revisionId: string) => {
      latestTreeRef.current = rootNode;
      try {
        const response = await fetch(
          `/api/issue-trees/${treeId}/revisions/${revisionId}`
        );
        if (!response.ok) return;
        const data = await response.json();
        const parsedDetail = revisionDetailSchema.safeParse(data);

        if (!parsedDetail.success) {
          console.error("Failed to parse revision detail:", parsedDetail.error);
          return;
        }

        const previewRoot = getRootNode(parsedDetail.data.tree as IssueTreeJson);
        setRootNode({ ...previewRoot });
        setSelectedNodeId(getDefaultSelectedNodeId(previewRoot));
        setPreviewRevisionId(revisionId);
      } catch (err) {
        console.error("Failed to preview revision", err);
      }
    },
    [rootNode, treeId]
  );

  const handleBackToLatest = useCallback(() => {
    if (latestTreeRef.current) {
      setRootNode({ ...latestTreeRef.current });
      setSelectedNodeId(getDefaultSelectedNodeId(latestTreeRef.current));
    }
    setPreviewRevisionId(null);
  }, []);

  const handleRestoreRevision = useCallback(async () => {
    if (!previewRevisionId) return;
    try {
      const response = await fetch(
        `/api/issue-trees/${treeId}/revisions/${previewRevisionId}/restore`,
        { method: "POST" }
      );
      if (!response.ok) {
        console.error("Failed to restore revision");
        return;
      }
      const data = await response.json();
      const parsedResponse = restoreResponseSchema.safeParse(data);

      if (!parsedResponse.success) {
        console.error("Failed to parse restore response:", parsedResponse.error);
        return;
      }

      const restoredRoot = getRootNode(parsedResponse.data.tree as IssueTreeJson);
      latestTreeRef.current = restoredRoot;
      setRootNode({ ...restoredRoot });
      setSelectedNodeId(getDefaultSelectedNodeId(restoredRoot));
      setPreviewRevisionId(null);
      void openHistory();
    } catch (err) {
      console.error("Failed to restore revision", err);
    }
  }, [previewRevisionId, treeId, openHistory]);

  return (
    <AppShell>
      {/* Header */}
      <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 z-50">
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground tracking-tight truncate max-w-md">
            {rootNode.content || "Untitled problem"}
          </span>
          {forkedFromId ? (
            <span className="text-xs text-muted-foreground mt-0.5">
              Forked from{" "}
              <a
                href={`/t/${forkedFromId}`}
                className="underline underline-offset-2 hover:text-foreground"
              >
                {forkedFromTitle ?? "another tree"}
              </a>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Issue tree
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isHistoryOpen) {
                void openHistory();
              } else {
                closeHistory();
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary hover:bg-accent rounded-md transition-colors"
            type="button"
          >
            <History size={14} />
            History
          </button>
          <button
            onClick={async () => {
              if (isForking) return;
              try {
                setIsForking(true);
                const response = await fetch(`/api/issue-trees/${treeId}/fork`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) {
                  console.error("Failed to fork issue tree");
                  return;
                }

                const data = (await response.json()) as { id: string };

                if (typeof window !== "undefined") {
                  window.location.href = `/t/${data.id}`;
                }
              } catch (err) {
                console.error("Failed to fork issue tree", err);
              } finally {
                setIsForking(false);
              }
            }}
            disabled={isForking}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary hover:bg-accent rounded-md transition-colors"
          >
            {isForking ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Forking…
              </>
            ) : (
              <>
                <GitBranch size={14} />
                Fork
              </>
            )}
          </button>
          <TooltipProvider>
            <Tooltip open={copyMessageVisible}>
              <TooltipTrigger asChild>
                <button
                  onClick={async () => {
                    if (typeof window === "undefined") return;

                    // Always use production URL for sharing
                    const shareUrl = `https://issuetree.ai/t/${treeId}`;
                    try {
                      if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(shareUrl);
                        setCopyMessageVisible(true);
                        window.setTimeout(() => setCopyMessageVisible(false), 1500);
                        return;
                      }
                    } catch (err) {
                      console.error("Failed to copy share URL", err);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary hover:bg-accent rounded-md transition-colors"
                >
                  <Share2 size={14} />
                  Share
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copied to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            onClick={handleExportImage}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md shadow-sm transition-colors"
          >
            <ImageIcon size={14} />
            Export
          </button>
        </div>
      </header>

      {/* Tree canvas */}
      <SidebarCollapseOnClick onMouseDown={handleMouseDown}>
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-background bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:20px_20px]"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
        <div
          ref={treeRef}
          className="absolute origin-top-left transition-transform duration-75 ease-out px-12"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <div className={isExportingImage ? "relative pb-20" : "relative"}>
            <TreeRenderer
              node={rootNode}
              onAddChild={handleAddChild}
              onAddSibling={handleAddSibling}
              onDelete={handleDeleteNode}
              onUpdate={handleUpdateNode}
              onUpdateTags={handleUpdateTags}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              aiLoadingNodeId={aiLoadingNodeId}
              pendingSuggestion={pendingSuggestion}
              aiError={aiError}
              onAiOperation={handleAiOperation}
              onAiGenerateNode={handleAiGenerateNode}
              onAcceptSuggestion={handleAcceptSuggestion}
              onDiscardSuggestion={handleDiscardSuggestion}
              onEditAndAcceptSuggestion={handleEditAndAcceptSuggestion}
            />

            {isExportingImage && (
              <div className="absolute bottom-4 right-4">
                <SocratifyBranding variant="minimal" showArrow={false} />
              </div>
            )}
          </div>
        </div>

        <div
          ref={controlsRef}
          className="absolute bottom-8 right-8 flex flex-col gap-2 p-2 bg-secondary rounded-xl shadow-xl border border-border"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setScale((s) => Math.min(s + 0.1, 2))}
            className="p-2 hover:bg-accent rounded-lg text-muted-foreground"
          >
            <Plus size={20} />
          </button>
          <div className="h-px bg-border w-full" />
          <button
            onClick={() => setScale((s) => Math.max(s - 0.1, 0.2))}
            className="p-2 hover:bg-accent rounded-lg text-muted-foreground"
          >
            <Minus size={20} />
          </button>
          <div className="h-px bg-border w-full" />
          <button
            onClick={() => {
              setPosition({ x: 100, y: 100 });
              setScale(1);
            }}
            className="p-2 hover:bg-accent rounded-lg text-muted-foreground"
            title="Reset View"
          >
            <RotateCcw size={18} />
          </button>
        </div>

          <div
            ref={helperRef}
            className="absolute bottom-6 left-6 flex flex-col gap-1.5 bg-secondary/80 backdrop-blur px-3 py-2 rounded-lg border border-border text-[10px] text-muted-foreground shadow-sm pointer-events-none"
          >
            <span className="font-semibold uppercase tracking-wide text-[9px] text-foreground/80 mb-0.5">
              Shortcuts
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-medium bg-muted rounded border border-border shadow-sm">
                Enter
              </kbd>
              <span className="opacity-70">Add sibling</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-medium bg-muted rounded border border-border shadow-sm">
                Tab
              </kbd>
              <span className="opacity-70">Add child</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-medium bg-muted rounded border border-border shadow-sm">
                Backspace
              </kbd>
              <span className="opacity-70">Delete node</span>
            </span>
          </div>

          <FloatingChatWidget
            treeContext={rootNode}
            selectedNodeId={selectedNodeId}
            pendingSuggestion={pendingSuggestion}
            onApplySuggestion={({ suggestion, targetNodeId }) => {
              setPendingSuggestion({ targetNodeId, suggestion });
              setSelectedNodeId(targetNodeId);
            }}
          />
        </div>
      </SidebarCollapseOnClick>
      {isHistoryOpen && (
        <div className="absolute top-14 right-0 h-[calc(100%-3.5rem)] w-72 border-l border-border bg-background/95 backdrop-blur-sm shadow-xl z-40 flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                History
              </span>
            </div>
            <button
              type="button"
              onClick={closeHistory}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 text-xs">
            {isRevisionsLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading revisions…
              </div>
            ) : revisions.length === 0 ? (
              <p className="text-muted-foreground py-2">
                No history yet. Changes will appear here over time.
              </p>
            ) : (
              <ul className="space-y-1">
                {revisions.map((rev) => {
                  const createdAt = new Date(rev.createdAt);
                  const label = rev.label ?? "Autosave";
                  const isActive = previewRevisionId === rev.id;
                  return (
                    <li key={rev.id}>
                      <button
                        type="button"
                        onClick={() => void handlePreviewRevision(rev.id)}
                        className={`
                          w-full text-left px-2 py-1.5 rounded-md transition-colors
                          ${
                            isActive
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }
                        `}
                      >
                        <div className="truncate font-medium text-[11px]">
                          {label}
                        </div>
                        <div className="text-[10px] opacity-80">
                          {createdAt.toLocaleString()}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
      {previewRevisionId && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-background/95 border border-border rounded-full px-4 py-1.5 shadow-md flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>Previewing past revision</span>
          <button
            type="button"
            onClick={handleBackToLatest}
            className="underline underline-offset-2 hover:text-foreground"
          >
            Back to latest
          </button>
          <button
            type="button"
            onClick={() => void handleRestoreRevision()}
            className="text-foreground font-semibold hover:underline underline-offset-2"
          >
            Restore this version
          </button>
        </div>
      )}
      </AppShell>
    );
};

export default IssueTreeEditor;
