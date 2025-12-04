"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar, type HistoryItem } from "@/components/Sidebar";
import { CollapsedSidebar } from "@/components/CollapsedSidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

const SOCRATIFY_LOGO_URL = "/socratify.logo.transparent.png";

type SidebarContextType = {
  isCollapsed: boolean;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isCollapsed: false,
      collapseSidebar: () => {},
      expandSidebar: () => {},
      toggleSidebar: () => {},
    };
  }
  return context;
}

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    treeId: string | null;
    treeTitle: string | null;
    isDeleting: boolean;
  }>({ open: false, treeId: null, treeTitle: null, isDeleting: false });
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Derive current tree ID from pathname (e.g., /t/abc123 -> abc123)
  const currentTreeId = pathname?.startsWith("/t/") ? pathname.split("/")[2] : null;

  const collapseSidebar = useCallback(() => setIsCollapsed(true), []);
  const expandSidebar = useCallback(() => setIsCollapsed(false), []);
  const toggleSidebar = useCallback(() => setIsCollapsed((prev) => !prev), []);

  // Opens the delete confirmation dialog
  const requestDeleteTree = useCallback((id: string) => {
    const tree = history.find((item) => item.id === id) ?? null;
    setDeleteDialog({
      open: true,
      treeId: id,
      treeTitle: tree?.title ?? null,
      isDeleting: false,
    });
  }, [history]);

  // Actually performs the delete after confirmation, returns true on success
  const handleDeleteTree = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/issue-trees/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete tree");
        return false;
      }

      setHistory((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error("Failed to delete tree", err);
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!isSignedIn) {
      setHistory([]);
      setIsHistoryLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setIsHistoryLoading(true);
        const response = await fetch("/api/issue-trees?limit=20");
        if (!response.ok) {
          if (!cancelled) setHistory([]);
          return;
        }
        const trees: Array<{ id: string; title: string; createdAt: string; forkedFromId?: string | null }> =
          await response.json();
        if (!cancelled) {
          setHistory(
            Array.isArray(trees)
              ? trees.map((tree) => ({
                  id: tree.id,
                  title: tree.title,
                  createdAt: tree.createdAt,
                  forkedFromId: tree.forkedFromId ?? null,
                }))
              : []
          );
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
        if (!cancelled) {
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setIsHistoryLoading(false);
        }
      }
    };

    void fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  const isHome = pathname === "/";

  // On the home page, only show the sidebar once we've confirmed there is history
  // to avoid an initial flash/shift when history is empty. On all other pages,
  // always show the sidebar.
  const shouldShowSidebar =
    !isHome || (!isHistoryLoading && history.length > 0);

  const sidebarContextValue: SidebarContextType = {
    isCollapsed,
    collapseSidebar,
    expandSidebar,
    toggleSidebar,
  };

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background font-sans text-foreground">
        {/* Mobile header - only visible on small screens */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border md:hidden">
          {shouldShowSidebar ? (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <SheetContent side="left" className="w-64 p-0" hideCloseButton>
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Sidebar
                  className="w-full border-r-0 h-full"
                  onNavigate={() => setSidebarOpen(false)}
                  history={history}
                  isLoading={isHistoryLoading}
                  onDeleteTree={requestDeleteTree}
                />
              </SheetContent>
            </Sheet>
          ) : (
            <div className="w-9" />
          )}

          <div className="flex items-center gap-2">
            <img
              src={SOCRATIFY_LOGO_URL}
              alt="Socratify"
              className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-semibold text-foreground">Issue Tree AI</span>
          </div>

          {/* Spacer to center the logo/title */}
          <div className="w-9" />
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Desktop sidebar - hidden on mobile, collapsible to icon rail */}
          {shouldShowSidebar && (
            <div
              className={`hidden md:flex h-full transition-all duration-300 ease-in-out ${
                isCollapsed ? "w-16" : "w-64"
              }`}
            >
              {isCollapsed ? (
                <CollapsedSidebar onExpand={expandSidebar} />
              ) : (
                  <Sidebar
                    className="h-full w-64 shrink-0"
                    history={history}
                    isLoading={isHistoryLoading}
                    onDeleteTree={requestDeleteTree}
                  />
              )}
            </div>
          )}

          <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open && !deleteDialog.isDeleting) {
            setDeleteDialog({ open: false, treeId: null, treeTitle: null, isDeleting: false });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this issue tree?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently remove
              {deleteDialog.treeTitle ? ` "${deleteDialog.treeTitle}"` : " this tree"}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, treeId: null, treeTitle: null, isDeleting: false })
              }
              disabled={deleteDialog.isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteDialog.treeId) return;
                const treeId = deleteDialog.treeId;
                const isCurrentTree = currentTreeId === treeId;

                setDeleteDialog((s) => ({ ...s, isDeleting: true }));
                const ok = await handleDeleteTree(treeId);

                // Redirect to home if we deleted the currently active tree
                if (ok && isCurrentTree) {
                  router.push("/");
                }

                setDeleteDialog({ open: false, treeId: null, treeTitle: null, isDeleting: false });
              }}
              disabled={deleteDialog.isDeleting}
            >
              {deleteDialog.isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarContext.Provider>
  );
}
