import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SuggestionChips, type SuggestionChip } from "../src/ui/suggestion-chips";
import { TrendingDown, TrendingUp, Megaphone, Sparkles, Zap, Target, Lightbulb } from "lucide-react";

const meta: Meta<typeof SuggestionChips> = {
  title: "UI/SuggestionChips",
  component: SuggestionChips,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SuggestionChips>;

const defaultChips: SuggestionChip[] = [
  { label: "Reduce user churn", icon: TrendingDown },
  { label: "Improve conversion", icon: TrendingUp },
  { label: "Increase awareness", icon: Megaphone },
];

export const Default: Story = {
  args: {
    chips: defaultChips,
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
};

export const WithoutIcons: Story = {
  args: {
    chips: [
      { label: "Marketing" },
      { label: "Product" },
      { label: "Sales" },
      { label: "Engineering" },
    ],
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
};

export const SmallSize: Story = {
  args: {
    chips: defaultChips,
    size: "sm",
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
};

export const LargeSize: Story = {
  args: {
    chips: defaultChips,
    size: "lg",
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
};

export const OutlineVariant: Story = {
  args: {
    chips: defaultChips,
    variant: "outline",
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
};

export const GhostVariant: Story = {
  args: {
    chips: defaultChips,
    variant: "ghost",
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
};

export const SubtleVariant: Story = {
  args: {
    chips: defaultChips,
    variant: "subtle",
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
};

export const AlignLeft: Story = {
  args: {
    chips: defaultChips,
    align: "left",
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
};

export const AlignRight: Story = {
  args: {
    chips: defaultChips,
    align: "right",
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
};

export const LargeGap: Story = {
  args: {
    chips: defaultChips,
    gap: "lg",
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
};

export const SmallGap: Story = {
  args: {
    chips: defaultChips,
    gap: "sm",
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
};

export const Disabled: Story = {
  args: {
    chips: defaultChips,
    disabled: true,
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
};

export const PartiallyDisabled: Story = {
  args: {
    chips: [
      { label: "Available", icon: Sparkles },
      { label: "Disabled", icon: Zap, disabled: true },
      { label: "Available", icon: Target },
    ],
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
};

export const ManyChips: Story = {
  args: {
    chips: [
      { label: "Strategy", icon: Target },
      { label: "Growth", icon: TrendingUp },
      { label: "Innovation", icon: Lightbulb },
      { label: "Marketing", icon: Megaphone },
      { label: "Analytics", icon: Sparkles },
      { label: "Performance", icon: Zap },
    ],
    onChipClick: (chip) => console.log("Clicked:", chip.label),
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};
