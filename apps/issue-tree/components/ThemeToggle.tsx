"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  /**
   * Default shows label + icon.
   * Compact is used in the collapsed sidebar.
   */
  variant?: "default" | "compact";
};

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
      >
        {isDark ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
    >
      <span
        className={cn(
          "relative inline-flex h-4 w-7 items-center rounded-full border border-border bg-muted transition-colors",
          isDark && "bg-primary/80 border-primary/70"
        )}
      >
        <span
          className={cn(
            "inline-block h-2.5 w-2.5 rounded-full bg-foreground shadow transition-transform ml-0.5",
            isDark ? "translate-x-3" : "translate-x-0"
          )}
        />
      </span>
      <span className="flex items-center gap-1.5">
        {isDark ? (
          <Moon className="h-3.5 w-3.5" />
        ) : (
          <Sun className="h-3.5 w-3.5" />
        )}
        <span>Theme</span>
      </span>
    </button>
  );
}
