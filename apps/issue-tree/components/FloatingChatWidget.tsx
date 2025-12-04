"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, SquarePen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/AppShell";
import { Streamdown } from "streamdown";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import type {
  IssueTreeAiSuggestion,
  IssueTreeAiOperationType,
} from "@/schema/issueTreeAiOperations";
import type { IssueNode } from "@/types";

const SOCRATES_THUMBNAIL_URL =
  "https://cdn.socratify.com/socrates.thumbnail.png";
const MAX_MESSAGES = 10;

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type EditSuggestionResponse = {
  mode: "edit-suggestion";
  explanation?: string;
  targetNodeId: string;
  operationType: IssueTreeAiOperationType;
  suggestion: IssueTreeAiSuggestion;
};

type FloatingChatWidgetProps = {
  treeContext?: IssueNode;
  selectedNodeId?: string;
  pendingSuggestion?: {
    targetNodeId: string;
    suggestion: IssueTreeAiSuggestion;
  } | null;
  onApplySuggestion?: (payload: {
    suggestion: IssueTreeAiSuggestion;
    targetNodeId: string;
  }) => void;
};

export function FloatingChatWidget({
  treeContext,
  selectedNodeId,
  pendingSuggestion,
  onApplySuggestion,
}: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { collapseSidebar } = useSidebar();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleNewChat = () => {
    setMessages([]);
    setInputValue("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Text-only streaming chat
  const sendPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading || messages.length >= MAX_MESSAGES) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const assistantMessageId = crypto.randomUUID();

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Add empty assistant message that will be streamed into
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          tree: treeContext,
          mode: "text-only",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedText }
              : msg
          )
        );
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Edit-suggestion mode (non-streaming)
  const sendEditSuggestion = useCallback(
    async (operationType: IssueTreeAiOperationType, chipLabel: string) => {
      if (
        !treeContext ||
        !selectedNodeId ||
        isEditLoading ||
        pendingSuggestion ||
        messages.length >= MAX_MESSAGES
      ) {
        return;
      }

      setIsEditLoading(true);

      // Add user message showing what they clicked
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: chipLabel,
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "edit-suggestion",
            tree: treeContext,
            targetNodeId: selectedNodeId,
            operationType,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate suggestion");
        }

        const data = (await response.json()) as EditSuggestionResponse;

        // Add explanation as assistant message
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            data.explanation ||
            "Here's my suggestion for the selected node. Check the tree to preview and accept or discard it.",
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Trigger the suggestion in the editor
        onApplySuggestion?.({
          suggestion: data.suggestion,
          targetNodeId: data.targetNodeId,
        });
      } catch (err) {
        console.error("Edit suggestion error:", err);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "Sorry, I couldn't generate a suggestion. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsEditLoading(false);
      }
    },
    [
      treeContext,
      selectedNodeId,
      isEditLoading,
      pendingSuggestion,
      onApplySuggestion,
      messages.length,
    ]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    setInputValue("");
    await sendPrompt(trimmed);
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputValue("");
    void sendPrompt(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleOpenChat = () => {
    collapseSidebar();
    setIsOpen(true);
  };

  // Get the selected node's content for display
  const getSelectedNodeContent = useCallback(() => {
    if (!treeContext || !selectedNodeId) return null;

    const findNode = (node: IssueNode, id: string): IssueNode | null => {
      if (node.id === id) return node;
      for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
      return null;
    };

    return findNode(treeContext, selectedNodeId);
  }, [treeContext, selectedNodeId]);

  const selectedNode = getSelectedNodeContent();
  const isEditDisabled =
    !selectedNodeId || isEditLoading || !!pendingSuggestion;
  const isAnyLoading = isLoading || isEditLoading;
  const hasReachedLimit = messages.length >= MAX_MESSAGES;

  if (!isOpen) {
    return (
      <button
        onClick={handleOpenChat}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed bottom-24 right-24 sm:bottom-20 sm:right-36 z-50 rounded-full shadow-lg transition-all duration-300 ease-out",
          "hover:shadow-xl hover:shadow-primary/20",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isHovered ? "scale-110" : "scale-100"
        )}
        aria-label="Open AI chat"
      >
        <div className="relative">
          <img
            src={SOCRATES_THUMBNAIL_URL}
            alt="Socrates AI"
            className={cn(
              "w-14 h-14 rounded-full object-cover transition-all duration-300",
              isHovered && "ring-4 ring-primary/30"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-primary/10 transition-opacity duration-300",
              isHovered ? "opacity-100 animate-pulse" : "opacity-0"
            )}
          />
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-24 right-24 sm:bottom-20 sm:right-36 z-50 w-[calc(100vw-7rem)] sm:w-80 max-h-[72vh] sm:h-[576px] flex flex-col",
        "bg-background border border-border rounded-xl shadow-2xl",
        "animate-in slide-in-from-bottom-4 slide-in-from-right-4 duration-300"
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <img
            src={SOCRATES_THUMBNAIL_URL}
            alt="Socrates"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Socratify</h3>
            <p className="text-xs text-muted-foreground">Chat Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="New chat"
            type="button"
          >
            <SquarePen size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close chat"
            type="button"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <img
              src={SOCRATES_THUMBNAIL_URL}
              alt="Socrates"
              className="w-16 h-16 rounded-full object-cover mb-4 opacity-50"
            />
            <p className="text-sm text-muted-foreground">
              I can help problem solve your issue tree. Ask me anything!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-3 py-2 rounded-lg text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                )}
              >
                {message.role === "assistant" ? (
                  <Streamdown>{message.content}</Streamdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))
        )}
        {isAnyLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary px-3 py-2 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        {hasReachedLimit ? (
          <div className="flex flex-col items-center justify-center py-4 gap-3">
            <p className="text-xs text-muted-foreground text-center">
              Message limit reached. Start a new chat to continue.
            </p>
            <button
              type="button"
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <SquarePen size={16} />
              New Chat
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Edit mode chips - for structural edits */}
            {onApplySuggestion && (
              <div className="flex flex-col gap-1.5 pb-2 border-b border-border/50">
                {selectedNode ? (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                    <Sparkles size={10} />
                    <span className="truncate">
                      Edit:{" "}
                      <span className="font-medium text-foreground">
                        {selectedNode.content || "Selected node"}
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                    <Sparkles size={10} />
                    <span>Select a node in the tree to enable AI edits</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      void sendEditSuggestion(
                        "suggestChildren",
                        "Add children to selected node"
                      )
                    }
                    disabled={isEditDisabled}
                    className={cn(
                      "px-2 py-1 text-[10px] rounded-md border transition-colors",
                      isEditDisabled
                        ? "bg-muted text-muted-foreground border-border/50 cursor-not-allowed opacity-50"
                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    )}
                  >
                    + Children
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void sendEditSuggestion(
                        "suggestSibling",
                        "Add sibling to selected node"
                      )
                    }
                    disabled={isEditDisabled || selectedNode?.type === "root"}
                    className={cn(
                      "px-2 py-1 text-[10px] rounded-md border transition-colors",
                      isEditDisabled || selectedNode?.type === "root"
                        ? "bg-muted text-muted-foreground border-border/50 cursor-not-allowed opacity-50"
                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    )}
                  >
                    + Sibling
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void sendEditSuggestion(
                        "rewriteLabel",
                        "Improve label of selected node"
                      )
                    }
                    disabled={isEditDisabled}
                    className={cn(
                      "px-2 py-1 text-[10px] rounded-md border transition-colors",
                      isEditDisabled
                        ? "bg-muted text-muted-foreground border-border/50 cursor-not-allowed opacity-50"
                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    )}
                  >
                    Rewrite
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void sendEditSuggestion(
                        "restructureChildren",
                        "Restructure children of selected node"
                      )
                    }
                    disabled={isEditDisabled || !selectedNode?.children?.length}
                    className={cn(
                      "px-2 py-1 text-[10px] rounded-md border transition-colors",
                      isEditDisabled || !selectedNode?.children?.length
                        ? "bg-muted text-muted-foreground border-border/50 cursor-not-allowed opacity-50"
                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    )}
                  >
                    Restructure
                  </button>
                </div>
                {pendingSuggestion && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">
                    Accept or discard the current suggestion first
                  </p>
                )}
              </div>
            )}

            {/* Conversation suggestions */}
            <Suggestions>
              <Suggestion
                suggestion="Review my current issue tree and suggest improvements to its structure."
                onClick={handleSuggestionClick}
              >
                Review my tree
              </Suggestion>
              <Suggestion
                suggestion="Suggest concrete fixes for weaknesses or gaps in my current issue tree."
                onClick={handleSuggestionClick}
              >
                Suggest a fix
              </Suggestion>
              <Suggestion
                suggestion="Check whether my issue tree is MECE and point out overlaps or missing branches."
                onClick={handleSuggestionClick}
              >
                Check MECE
              </Suggestion>
            </Suggestions>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your issue tree..."
                className="flex-1 resize-none bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[40px] max-h-[100px]"
                rows={1}
                disabled={isAnyLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isAnyLoading}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                aria-label="Send message"
              >
                {isAnyLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default FloatingChatWidget;
