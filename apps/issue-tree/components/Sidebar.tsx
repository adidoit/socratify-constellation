"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { GitBranch, Loader2, PanelLeftClose, SquarePen, Search, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/AppShell";
import { Input } from "@/components/ui/input";

const SOCRATIFY_LOGO_URL = "/socratify.logo.transparent.png";

export type HistoryItem = {
  id: string;
  title: string;
  createdAt: string;
  forkedFromId?: string | null;
};

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
  history: HistoryItem[];
  isLoading: boolean;
  onDeleteTree?: (id: string) => void;
};

export function Sidebar({
  className,
  onNavigate,
  history,
  isLoading,
  onDeleteTree,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleNewTree = () => {
    router.push("/");
    onNavigate?.();
  };

  const handleTreeClick = (treeId: string) => {
    router.push(`/t/${treeId}`);
    onNavigate?.();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const currentTreeId = pathname?.startsWith("/t/") ? pathname.split("/")[2] : null;
  const filteredHistory = React.useMemo(
    () => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return history;
      return history.filter((item) =>
        item.title.toLowerCase().includes(query)
      );
    },
    [history, searchQuery]
  );

  const { collapseSidebar } = useSidebar();

  return (
    <aside className={cn("w-64 h-full border-r border-border bg-background flex flex-col", className)}>
      {/* Header: Logo (left) + Collapse button (right) */}
      <div className="h-14 shrink-0 px-3 flex items-center justify-between">
        <img
          src={SOCRATIFY_LOGO_URL}
          alt="Socratify"
          className="w-8 h-8 object-contain"
        />
        <button
          onClick={collapseSidebar}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {/* Action buttons: New issue tree + Search */}
      <div className="px-3 py-2 flex flex-col gap-1">
        <button
          onClick={handleNewTree}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
        >
          <SquarePen className="w-5 h-5" />
          <span>New issue tree</span>
        </button>
        <div className="mt-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="h-9 pl-9 pr-7 text-xs bg-muted/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 px-3 py-3 flex flex-col gap-4">

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            History
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No trees yet. Create your first one!
              </p>
            ) : filteredHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No trees match “{searchQuery}”.
              </p>
            ) : (
              <div className="space-y-1">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group relative"
                  >
                    <button
                      onClick={() => handleTreeClick(item.id)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 pr-8 rounded-md text-sm transition-colors",
                        currentTreeId === item.id
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {item.forkedFromId ? (
                          <GitBranch className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                        ) : null}
                        <div className="truncate font-medium">{item.title}</div>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </div>
                    </button>
                    {onDeleteTree && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTree(item.id);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        aria-label="Delete issue tree"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section with theme toggle */}
      <div className="shrink-0 px-4 py-3 border-t border-border">
        <ThemeToggle />
      </div>
    </aside>
  );
}
