"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../cn";
import { InterviewQuestionCard, Question } from "./interview-question-card";

interface InterviewQuestionCardGridProps {
  questions: Question[];
  onQuestionClick: (question: Question) => void;
  selectedQuestionId?: string | null;
  variant?: "light" | "dark";
  className?: string;
  /** Gap between cards in pixels */
  gap?: number;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show scroll indicators (dots) */
  showIndicators?: boolean;
  /** Number of rows (1 or 2) */
  rows?: 1 | 2;
}

export const InterviewQuestionCardGrid: React.FC<
  InterviewQuestionCardGridProps
> = ({
  questions,
  onQuestionClick,
  selectedQuestionId,
  variant = "light",
  className,
  gap = 24,
  showArrows = true,
  showIndicators = true,
  rows = 1,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const isDark = variant === "dark";
  const cardWidth = 320;
  const scrollAmount = cardWidth + gap;

  // For 2-row layout, group questions into columns of 2
  const columns = rows === 2
    ? questions.reduce<Question[][]>((acc, question, index) => {
        const columnIndex = Math.floor(index / 2);
        if (!acc[columnIndex]) {
          acc[columnIndex] = [];
        }
        acc[columnIndex].push(question);
        return acc;
      }, [])
    : null;

  const totalColumns = columns?.length ?? questions.length;

  // Check scroll position and update states
  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate active index based on scroll position
    const index = Math.round(scrollLeft / scrollAmount);
    setActiveIndex(Math.min(index, totalColumns - 1));
  }, [scrollAmount, totalColumns]);

  useEffect(() => {
    updateScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollState, { passive: true });
      window.addEventListener("resize", updateScrollState);
      return () => {
        container.removeEventListener("scroll", updateScrollState);
        window.removeEventListener("resize", updateScrollState);
      };
    }
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const targetScroll =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTo({
      left: index * scrollAmount,
      behavior: "smooth",
    });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Navigation Arrows */}
      {showArrows && (
        <>
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-20",
              "w-12 h-12 rounded-full",
              "flex items-center justify-center",
              "transition-all duration-300",
              "disabled:opacity-0 disabled:pointer-events-none",
              !isDark && [
                "bg-white/90 backdrop-blur-sm",
                "border border-stone-200/80",
                "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]",
                "hover:bg-white hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)]",
                "hover:scale-105",
                "text-stone-600 hover:text-stone-900",
              ],
              isDark && [
                "bg-zinc-900/90 backdrop-blur-sm",
                "border border-zinc-700/80",
                "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]",
                "hover:bg-zinc-800 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5)]",
                "hover:scale-105",
                "text-zinc-400 hover:text-zinc-100",
              ]
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-20",
              "w-12 h-12 rounded-full",
              "flex items-center justify-center",
              "transition-all duration-300",
              "disabled:opacity-0 disabled:pointer-events-none",
              !isDark && [
                "bg-white/90 backdrop-blur-sm",
                "border border-stone-200/80",
                "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]",
                "hover:bg-white hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)]",
                "hover:scale-105",
                "text-stone-600 hover:text-stone-900",
              ],
              isDark && [
                "bg-zinc-900/90 backdrop-blur-sm",
                "border border-zinc-700/80",
                "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]",
                "hover:bg-zinc-800 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5)]",
                "hover:scale-105",
                "text-zinc-400 hover:text-zinc-100",
              ]
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Gradient Fade Edges */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none",
          "transition-opacity duration-300",
          !canScrollLeft && "opacity-0",
          !isDark && "bg-gradient-to-r from-stone-100 to-transparent",
          isDark && "bg-gradient-to-r from-zinc-950 to-transparent"
        )}
      />
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none",
          "transition-opacity duration-300",
          !canScrollRight && "opacity-0",
          !isDark && "bg-gradient-to-l from-stone-100 to-transparent",
          isDark && "bg-gradient-to-l from-zinc-950 to-transparent"
        )}
      />

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className={cn(
          "flex overflow-x-auto scrollbar-hide",
          "scroll-smooth snap-x snap-mandatory",
          "px-14 py-4",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          // Hide scrollbar across browsers
          "[&::-webkit-scrollbar]:hidden",
          "[-ms-overflow-style:none]",
          "[scrollbar-width:none]"
        )}
        style={{ gap: `${gap}px` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {rows === 1 ? (
          // Single row layout
          questions.map((question) => (
            <div
              key={question.id}
              className="snap-start shrink-0"
              onClick={(e) => {
                if (isDragging) {
                  e.stopPropagation();
                }
              }}
            >
              <InterviewQuestionCard
                question={question}
                onClick={onQuestionClick}
                isSelected={selectedQuestionId === question.id}
                variant={variant}
              />
            </div>
          ))
        ) : (
          // Two row layout - render columns
          columns?.map((columnQuestions, columnIndex) => (
            <div
              key={`column-${columnIndex}`}
              className="snap-start shrink-0 flex flex-col"
              style={{ gap: `${gap}px` }}
              onClick={(e) => {
                if (isDragging) {
                  e.stopPropagation();
                }
              }}
            >
              {columnQuestions.map((question) => (
                <InterviewQuestionCard
                  key={question.id}
                  question={question}
                  onClick={onQuestionClick}
                  isSelected={selectedQuestionId === question.id}
                  variant={variant}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Scroll Indicators */}
      {showIndicators && totalColumns > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalColumns }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={cn(
                "transition-all duration-300",
                "rounded-full",
                index === activeIndex
                  ? [
                      "w-8 h-2",
                      !isDark && "bg-amber-500",
                      isDark && "bg-amber-400",
                    ]
                  : [
                      "w-2 h-2",
                      !isDark && "bg-stone-300 hover:bg-stone-400",
                      isDark && "bg-zinc-700 hover:bg-zinc-600",
                    ]
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
