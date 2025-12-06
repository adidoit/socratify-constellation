"use client";

import React, { useState } from "react";
import { cn } from "../cn";

export interface Question {
  id: string;
  text: string;
  company: string;
  logoUrl: string;
}

export interface AnswerState {
  questionId: string | null;
  content: string | null;
  isLoading: boolean;
  error: string | null;
}

interface QuestionCardProps {
  question: Question;
  onClick: (question: Question) => void;
  isSelected?: boolean;
  variant?: "light" | "dark";
  className?: string;
}

export const InterviewQuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onClick,
  isSelected,
  variant = "light",
  className,
}) => {
  const isDark = variant === "dark";
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const handleClick = () => {
    onClick(question);
  };

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className={cn(
        // Base layout
        "group relative flex flex-col justify-between",
        "w-full max-w-[320px] h-[320px] p-8",
        "rounded-[28px] cursor-pointer overflow-hidden",
        "select-none",

        // Press animation with spring-like easing
        "transition-all duration-200",
        isPressed
          ? "scale-[0.97] duration-100 ease-out"
          : "scale-100 duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",

        // Light variant
        !isDark && [
          "bg-white",
          "border border-stone-200/60",
          isSelected
            ? "ring-2 ring-amber-500/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] scale-[1.02]"
            : isPressed
              ? "shadow-[0_2px_10px_-2px_rgba(0,0,0,0.08)]"
              : [
                  "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]",
                  "hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)]",
                  "hover:-translate-y-1.5",
                  "hover:border-stone-300/80",
                ],
        ],

        // Dark variant - refined obsidian aesthetic
        isDark && [
          "bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950",
          "border border-zinc-800/80",
          isSelected
            ? "ring-2 ring-amber-400/70 shadow-[0_20px_60px_-12px_rgba(251,191,36,0.15)] scale-[1.02]"
            : isPressed
              ? "shadow-[0_4px_16px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.02)]"
              : [
                  "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.03)]",
                  "hover:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
                  "hover:-translate-y-2",
                  "hover:border-zinc-700/90",
                ],
        ],

        className
      )}
    >
      {/* Ambient glow effect for dark mode */}
      {isDark && (
        <div
          className={cn(
            "absolute -inset-px rounded-[28px] opacity-0 transition-opacity duration-500",
            "bg-gradient-to-br from-amber-500/10 via-transparent to-rose-500/5",
            "group-hover:opacity-100"
          )}
        />
      )}

      {/* Subtle noise texture overlay */}
      <div
        className={cn(
          "absolute inset-0 rounded-[28px] pointer-events-none opacity-[0.015]",
          isDark && "opacity-[0.03]"
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Question Text */}
      <div className="relative flex-grow z-10">
        <h3
          className={cn(
            "text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.02em]",
            "transition-colors duration-300",
            !isDark && "text-stone-800 group-hover:text-stone-900",
            isDark && "text-zinc-100 group-hover:text-white"
          )}
        >
          {question.text}
        </h3>
      </div>

      {/* Footer: Logo and Company Name */}
      <div className="relative flex items-center gap-4 mt-6 z-10">
        {/* Logo container with refined styling */}
        <div
          className={cn(
            "relative w-14 h-14 rounded-2xl overflow-hidden",
            "flex items-center justify-center shrink-0",
            "transition-all duration-300",
            !isDark && [
              "bg-stone-50 border border-stone-200/80",
              "group-hover:border-stone-300 group-hover:bg-stone-100/80",
            ],
            isDark && [
              "bg-zinc-800/80 border border-zinc-700/60",
              "group-hover:border-zinc-600 group-hover:bg-zinc-800",
              "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
            ]
          )}
        >
          <img
            src={question.logoUrl}
            alt={`${question.company} logo`}
            className={cn(
              "w-full h-full object-contain p-2.5",
              isDark && "brightness-110 contrast-105"
            )}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://picsum.photos/64/64";
            }}
          />
        </div>

        {/* Company name with refined typography */}
        <span
          className={cn(
            "text-lg font-medium tracking-[-0.01em]",
            "transition-colors duration-300",
            !isDark && "text-stone-500 group-hover:text-stone-700",
            isDark && "text-zinc-400 group-hover:text-zinc-200"
          )}
        >
          {question.company}
        </span>
      </div>

      {/* Corner accent - subtle brand touch */}
      <div
        className={cn(
          "absolute top-6 right-6 w-2 h-2 rounded-full",
          "transition-all duration-500",
          !isDark && [
            "bg-stone-200 group-hover:bg-amber-400",
            "group-hover:shadow-[0_0_12px_2px_rgba(251,191,36,0.3)]",
          ],
          isDark && [
            "bg-zinc-700 group-hover:bg-amber-400",
            "group-hover:shadow-[0_0_16px_3px_rgba(251,191,36,0.4)]",
          ],
          isSelected && [
            isDark ? "bg-amber-400" : "bg-amber-500",
            isDark
              ? "shadow-[0_0_16px_3px_rgba(251,191,36,0.4)]"
              : "shadow-[0_0_12px_2px_rgba(251,191,36,0.3)]",
          ]
        )}
      />

      {/* Bottom edge highlight for depth */}
      {isDark && (
        <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
      )}
    </div>
  );
};
