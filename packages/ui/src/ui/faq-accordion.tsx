"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../cn";

export type FaqItem = {
  id?: string;
  question: string;
  answer: React.ReactNode;
  /**
   * Optional plain-text version of the answer for JSON-LD schema generation.
   */
  answerPlainText?: string;
};

export interface FaqAccordionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: FaqItem[];
  title?: string;
  allowMultiple?: boolean;
  defaultOpenId?: string;
  /**
   * When true, renders FAQPage JSON-LD using provided questions/answers.
   * Requires either string answers or `answerPlainText` to generate text.
   */
  includeJsonLd?: boolean;
  jsonLdTitle?: string;
}

export function FaqAccordion({
  items,
  title = "Frequently asked questions",
  allowMultiple = false,
  defaultOpenId,
  includeJsonLd = false,
  jsonLdTitle,
  className,
  ...props
}: FaqAccordionProps) {
  const idPrefix = React.useId();

  const itemsWithIds = React.useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        id: item.id ?? `${idPrefix}-item-${index}`,
      })),
    [idPrefix, items]
  );

  const resolvedDefaultId = React.useMemo(() => {
    if (!defaultOpenId) return null;
    return itemsWithIds.some((item) => item.id === defaultOpenId)
      ? defaultOpenId
      : null;
  }, [defaultOpenId, itemsWithIds]);

  const [openItems, setOpenItems] = React.useState<Set<string>>(
    () => (resolvedDefaultId ? new Set([resolvedDefaultId]) : new Set())
  );

  // Keep open state in sync when items change
  React.useEffect(() => {
    setOpenItems((prev) => {
      const validIds = new Set(itemsWithIds.map((item) => item.id));
      const filtered = new Set([...prev].filter((id) => validIds.has(id)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [itemsWithIds]);

  // Apply default open item when provided
  React.useEffect(() => {
    if (!resolvedDefaultId) return;
    setOpenItems((prev) => {
      if (allowMultiple && prev.has(resolvedDefaultId)) return prev;
      const next = allowMultiple ? new Set(prev) : new Set<string>();
      next.add(resolvedDefaultId);
      return next;
    });
  }, [allowMultiple, resolvedDefaultId]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (allowMultiple) {
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      }

      if (next.has(id)) {
        next.clear();
        return next;
      }

      return new Set([id]);
    });
  };

  const faqJsonLd = React.useMemo(() => {
    if (!includeJsonLd) return null;

    const mainEntity = itemsWithIds
      .map((item) => {
        const answerText =
          typeof item.answer === "string"
            ? item.answer
            : item.answerPlainText;

        if (!answerText) return null;

        return {
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answerText,
          },
        };
      })
      .filter(
        (entry): entry is Exclude<typeof entry, null> => entry !== null
      );

    if (!mainEntity.length) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      name: jsonLdTitle ?? title,
      mainEntity,
    };
  }, [includeJsonLd, itemsWithIds, jsonLdTitle, title]);

  return (
    <div
      data-slot="faq-accordion"
      className={cn("w-full max-w-2xl", className)}
      {...props}
    >
      {faqJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Header */}
      {title && (
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      )}

      {/* Accordion items */}
      <div className="divide-y divide-border rounded-xl border border-border bg-secondary">
        {itemsWithIds.map((item) => {
          const isOpen = openItems.has(item.id);
          const contentId = `${item.id}-content`;
          const triggerId = `${item.id}-trigger`;

          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                id={triggerId}
                className={cn(
                  "flex w-full items-center justify-between gap-4 px-4 py-4 text-left",
                  "transition-colors duration-150",
                  "hover:bg-accent/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                <span className="font-sans text-sm font-medium text-foreground">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden
                />
              </button>

              <div
                id={contentId}
                role="region"
                aria-labelledby={triggerId}
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4">
                    <div className="text-sm leading-relaxed text-muted-foreground">
                      {typeof item.answer === "string" ? (
                        <p className="whitespace-pre-line">{item.answer}</p>
                      ) : (
                        item.answer
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
