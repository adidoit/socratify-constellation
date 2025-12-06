"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "../cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Button } from "./button";
import { CompanyInterviewQuestionCard, Question } from "./company-interview-question-card";

// Filter state type
export interface QuestionTableFilters {
  company: string | null;
  industry: string | null;
  type: string | null;
}

// Pagination state type
export interface QuestionTablePagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface QuestionTableProps {
  /** Questions to display */
  questions: Question[];
  /** Called when a question is clicked */
  onQuestionClick: (question: Question) => void;
  /** Current filter values (controlled) */
  filters?: QuestionTableFilters;
  /** Called when filters change */
  onFiltersChange?: (filters: QuestionTableFilters) => void;
  /** Pagination state (for server-side pagination) */
  pagination?: QuestionTablePagination;
  /** Called when page changes */
  onPageChange?: (page: number) => void;
  /** Called when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Available companies for filter dropdown */
  companies?: string[];
  /** Available industries for filter dropdown */
  industries?: string[];
  /** Available types for filter dropdown */
  types?: string[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Visual variant */
  variant?: "light" | "dark";
  /** Card layout variant */
  layout?: "company-only" | "full-context";
  /** Additional class name */
  className?: string;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Number of columns in the grid */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between cards */
  gap?: number;
}

export function QuestionTable({
  questions,
  onQuestionClick,
  filters,
  onFiltersChange,
  pagination,
  onPageChange,
  onPageSizeChange,
  companies = [],
  industries = [],
  types = [],
  isLoading = false,
  variant = "light",
  layout = "full-context",
  className,
  pageSizeOptions = [8, 16, 24],
  columns = 4,
  gap = 24,
}: QuestionTableProps) {
  const isDark = variant === "dark";

  // Internal filter state if not controlled
  const [internalFilters, setInternalFilters] = useState<QuestionTableFilters>({
    company: null,
    industry: null,
    type: null,
  });

  const activeFilters = filters ?? internalFilters;
  const handleFiltersChange = onFiltersChange ?? setInternalFilters;

  // Derive unique filter options from questions if not provided
  const derivedCompanies = useMemo(() => {
    if (companies.length > 0) return companies;
    return [...new Set(questions.map((q) => q.company))].sort();
  }, [companies, questions]);

  const derivedIndustries = useMemo(() => {
    if (industries.length > 0) return industries;
    return [...new Set(questions.map((q) => q.industry).filter(Boolean) as string[])].sort();
  }, [industries, questions]);

  const derivedTypes = useMemo(() => {
    if (types.length > 0) return types;
    return [...new Set(questions.map((q) => q.type).filter(Boolean) as string[])].sort();
  }, [types, questions]);

  // Calculate pagination display
  const startItem = pagination
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 1;
  const endItem = pagination
    ? Math.min(pagination.page * pagination.pageSize, pagination.totalItems)
    : questions.length;
  const totalItems = pagination?.totalItems ?? questions.length;

  const handleFilterChange = (
    key: keyof QuestionTableFilters,
    value: string | null
  ) => {
    handleFiltersChange({
      ...activeFilters,
      [key]: value,
    });
    // Reset to first page when filter changes
    onPageChange?.(1);
  };

  const clearFilters = () => {
    handleFiltersChange({
      company: null,
      industry: null,
      type: null,
    });
    onPageChange?.(1);
  };

  const hasActiveFilters =
    activeFilters.company || activeFilters.industry || activeFilters.type;

  // Grid column classes
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns];

  return (
    <div className={cn("w-full", className)}>
      {/* Filters */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-4 mb-6"
        )}
      >
        {/* Company Filter */}
        <Select
          value={activeFilters.company ?? "all"}
          onValueChange={(v) =>
            handleFilterChange("company", v === "all" ? null : v)
          }
        >
          <SelectTrigger
            className={cn(
              "w-[160px] h-9 text-sm",
              !isDark && "bg-white border-stone-200 text-stone-900",
              isDark && "bg-zinc-800 border-zinc-700 text-zinc-100"
            )}
          >
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All companies</SelectItem>
            {derivedCompanies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Industry Filter */}
        {derivedIndustries.length > 0 && (
          <Select
            value={activeFilters.industry ?? "all"}
            onValueChange={(v) =>
              handleFilterChange("industry", v === "all" ? null : v)
            }
          >
            <SelectTrigger
              className={cn(
                "w-[160px] h-9 text-sm",
                !isDark && "bg-white border-stone-200 text-stone-900",
                isDark && "bg-zinc-800 border-zinc-700 text-zinc-100"
              )}
            >
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              {derivedIndustries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Type Filter */}
        {derivedTypes.length > 0 && (
          <Select
            value={activeFilters.type ?? "all"}
            onValueChange={(v) =>
              handleFilterChange("type", v === "all" ? null : v)
            }
          >
            <SelectTrigger
              className={cn(
                "w-[160px] h-9 text-sm",
                !isDark && "bg-white border-stone-200 text-stone-900",
                isDark && "bg-zinc-800 border-zinc-700 text-zinc-100"
              )}
            >
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {derivedTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className={cn(
              "h-9 text-sm",
              !isDark && "text-stone-500 hover:text-stone-900",
              isDark && "text-zinc-400 hover:text-zinc-100"
            )}
          >
            Clear
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Results info */}
        <span
          className={cn(
            "text-sm",
            !isDark ? "text-stone-500" : "text-zinc-400"
          )}
        >
          Showing {startItem}-{endItem} of {totalItems}
        </span>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        // Loading skeleton grid
        <div
          className={cn("grid", gridColsClass)}
          style={{ gap: `${gap}px` }}
        >
          {Array.from({ length: pagination?.pageSize ?? 6 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-full aspect-square rounded-[28px] animate-pulse",
                !isDark ? "bg-stone-200" : "bg-zinc-800"
              )}
            />
          ))}
        </div>
      ) : questions.length === 0 ? (
        // Empty state
        <div
          className={cn(
            "flex flex-col items-center justify-center py-16",
            !isDark ? "text-stone-500" : "text-zinc-400"
          )}
        >
          <p className="text-base font-medium mb-1">No questions found</p>
          <p className="text-sm">Try adjusting your filters</p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="mt-3"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        // Question cards grid
        <div
          className={cn("grid", gridColsClass)}
          style={{ gap: `${gap}px` }}
        >
          {questions.map((question) => (
            <CompanyInterviewQuestionCard
              key={question.id}
              question={question}
              onClick={onQuestionClick}
              variant={variant}
              layout={layout}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div
          className={cn(
            "flex items-center justify-center gap-1 mt-8",
            !isDark ? "text-stone-600" : "text-zinc-400"
          )}
        >
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(1)}
              disabled={pagination.page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
      )}
    </div>
  );
}
