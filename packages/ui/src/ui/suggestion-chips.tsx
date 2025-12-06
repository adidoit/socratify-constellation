"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

const suggestionChipVariants = cva(
  "inline-flex items-center gap-2 rounded-full border font-sans font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none",
  {
    variants: {
      variant: {
        default:
          "border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground hover:border-foreground/20",
        outline:
          "border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        subtle:
          "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-xs",
        lg: "px-5 py-2.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface SuggestionChip {
  id?: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface SuggestionChipsProps
  extends VariantProps<typeof suggestionChipVariants> {
  chips: SuggestionChip[];
  onChipClick?: (chip: SuggestionChip, index: number) => void;
  disabled?: boolean;
  className?: string;
  chipClassName?: string;
  align?: "left" | "center" | "right";
  gap?: "sm" | "md" | "lg";
}

const gapStyles = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-3",
};

const alignStyles = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export function SuggestionChips({
  chips,
  onChipClick,
  disabled,
  variant,
  size,
  className,
  chipClassName,
  align = "center",
  gap = "md",
}: SuggestionChipsProps) {
  return (
    <div
      data-slot="suggestion-chips"
      className={cn(
        "flex flex-wrap items-center",
        gapStyles[gap],
        alignStyles[align],
        className
      )}
    >
      {chips.map((chip, index) => {
        const Icon = chip.icon;
        const isDisabled = disabled || chip.disabled;

        return (
          <button
            key={chip.id ?? `chip-${index}`}
            type="button"
            onClick={() => onChipClick?.(chip, index)}
            disabled={isDisabled}
            className={cn(
              suggestionChipVariants({ variant, size }),
              chipClassName
            )}
          >
            {Icon && (
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { suggestionChipVariants };
