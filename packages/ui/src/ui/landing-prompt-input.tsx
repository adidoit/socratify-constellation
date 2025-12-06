"use client";

import * as React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "../cn";

export type LandingPromptInputStatus = "idle" | "loading" | "error";

export interface LandingPromptInputProps
  extends Omit<React.HTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /** Current input value (controlled) */
  value: string;
  /** Called when input value changes */
  onValueChange: (value: string) => void;
  /** Called when form is submitted */
  onSubmit: (value: string) => void | Promise<void>;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Current status - affects button state and loading message */
  status?: LandingPromptInputStatus;
  /** Loading message to show when status is "loading" */
  loadingMessage?: string;
  /** Whether to show keyboard shortcut hint */
  showKeyboardHint?: boolean;
  /** Keyboard shortcut modifier key label */
  modifierKey?: string;
  /** Minimum height of textarea */
  minHeight?: string;
  /** Number of rows for textarea */
  rows?: number;
  /** Whether textarea is disabled */
  disabled?: boolean;
}

export function LandingPromptInput({
  value,
  onValueChange,
  onSubmit,
  placeholder = "Describe the problem...",
  status = "idle",
  loadingMessage,
  showKeyboardHint = true,
  modifierKey = "Cmd",
  minHeight = "72px",
  rows = 2,
  disabled,
  className,
  ...props
}: LandingPromptInputProps) {
  const isLoading = status === "loading";
  const isDisabled = disabled || isLoading;
  const canSubmit = !!value.trim() && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (canSubmit) {
        onSubmit(value);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)} {...props}>
      <div className="bg-secondary rounded-xl border border-border shadow-lg overflow-hidden">
        {/* Textarea */}
        <div className="p-4">
          <textarea
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "pl-2 w-full bg-transparent text-foreground font-sans text-base font-normal",
              "placeholder-muted-foreground/60 resize-none outline-none leading-relaxed",
              "transition-colors focus:placeholder-muted-foreground/40"
            )}
            style={{ minHeight }}
            rows={rows}
            disabled={isDisabled}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="px-4 py-2 flex items-center justify-between">
          {isLoading && loadingMessage ? (
            <span className="text-muted-foreground text-xs font-sans font-medium flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              {loadingMessage}
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            {showKeyboardHint && (
              <span className="text-muted-foreground text-xs hidden sm:inline font-mono">
                <kbd className="px-2 py-1 text-[10px] font-medium bg-muted rounded border border-border">
                  {modifierKey}
                </kbd>
                <span className="mx-1">+</span>
                <kbd className="px-2 py-1 text-[10px] font-medium bg-muted rounded border border-border">
                  Enter
                </kbd>
              </span>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "w-8 h-8 rounded-full bg-primary text-primary-foreground",
                "flex items-center justify-center",
                "hover:bg-primary/90 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export interface LandingPromptInputWithChipsProps extends LandingPromptInputProps {
  /** Suggestion chips to display below the input */
  chips?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  /** Called when a chip is clicked */
  onChipClick?: (label: string) => void;
}

export function LandingPromptInputWithChips({
  chips = [],
  onChipClick,
  status,
  ...props
}: LandingPromptInputWithChipsProps) {
  const isLoading = status === "loading";

  return (
    <div className="w-full">
      <LandingPromptInput status={status} {...props} />

      {chips.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {chips.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => onChipClick?.(label)}
              disabled={isLoading}
              className={cn(
                "inline-flex items-center gap-2 rounded-full",
                "border border-border bg-secondary px-4 py-2",
                "text-xs font-sans font-medium text-muted-foreground",
                "hover:bg-accent hover:text-foreground hover:border-foreground/20",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
