"use client";

import React from "react";
import { SquarePen, Search, PanelLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const SOCRATIFY_LOGO_URL = "/socratify.logo.transparent.png";

type CollapsedSidebarProps = {
  onExpand: () => void;
};

export function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
  return (
    <aside className="w-16 h-full border-r border-border bg-background flex flex-col items-center py-3 gap-1">
      {/* Logo / expand control - changes to sidebar icon on hover */}
      <button
        type="button"
        onClick={onExpand}
        className="group flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent transition-colors"
        title="Open sidebar"
      >
        <img
          src={SOCRATIFY_LOGO_URL}
          alt="Socratify"
          className="h-7 w-7 object-contain group-hover:hidden"
        />
        <PanelLeft className="h-5 w-5 text-foreground hidden group-hover:block" />
      </button>

      {/* Action icons */}
      <button
        type="button"
        onClick={onExpand}
        className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        title="New issue tree"
      >
        <SquarePen className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={onExpand}
        className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        title="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Spacer to push theme toggle to bottom */}
      <div className="flex-1" />

      {/* Theme toggle at bottom */}
      <div className="pb-2">
        <ThemeToggle variant="compact" />
      </div>
    </aside>
  );
}
