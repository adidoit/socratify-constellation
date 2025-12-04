"use client";

import { usePromptInputController } from "@/components/ai-elements/prompt-input";

interface ExamplePromptChipsProps {
  onSelect: (text: string) => void | Promise<void>;
}

export function ExamplePromptChips({ onSelect }: ExamplePromptChipsProps) {
  const controller = usePromptInputController();

  const examples = [
    "Reduce customer churn for our SaaS",
    "Improve onboarding conversion for new users",
    "Increase profitability of our core product",
  ];

  const handleClick = (example: string) => {
    controller.textInput.setInput(example);
    void onSelect(example);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
      {examples.map((example) => (
        <button
          key={example}
          type="button"
          onClick={() => handleClick(example)}
          className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-neutral-700 shadow-sm hover:bg-neutral-100 transition-colors"
        >
          {example}
        </button>
      ))}
    </div>
  );
}

