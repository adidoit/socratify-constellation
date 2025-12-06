"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

const heroTitleVariants = cva(
  "font-sans font-bold tracking-tight text-center leading-tight",
  {
    variants: {
      size: {
        sm: "text-2xl sm:text-3xl md:text-4xl",
        md: "text-3xl sm:text-4xl md:text-5xl",
        lg: "text-4xl sm:text-5xl md:text-6xl",
        xl: "text-5xl sm:text-6xl md:text-7xl",
        "display-sm": "text-display-sm",
        "display-md": "text-display-md",
        "display-lg": "text-display-lg",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: {
      size: "lg",
      align: "center",
    },
  }
);

const heroSubtitleVariants = cva("font-sans text-muted-foreground", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    size: "sm",
    align: "center",
  },
});

export interface HeroTitleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof heroTitleVariants> {
  title: string;
  subtitle?: React.ReactNode;
  subtitleSize?: "sm" | "md" | "lg";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  gap?: "sm" | "md" | "lg";
}

const maxWidthStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "max-w-full",
};

const gapStyles = {
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
};

export function HeroTitle({
  title,
  subtitle,
  size,
  subtitleSize = "sm",
  align,
  maxWidth = "4xl",
  gap = "md",
  className,
  ...props
}: HeroTitleProps) {
  return (
    <div
      data-slot="hero-title"
      className={cn(
        "flex flex-col items-center",
        gapStyles[gap],
        className
      )}
      {...props}
    >
      <h1
        className={cn(
          heroTitleVariants({ size, align }),
          maxWidthStyles[maxWidth]
        )}
      >
        {title}
      </h1>
      {subtitle && (
        <div className={cn(heroSubtitleVariants({ size: subtitleSize, align }))}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

export { heroTitleVariants, heroSubtitleVariants };
