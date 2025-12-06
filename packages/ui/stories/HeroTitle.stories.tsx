import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { HeroTitle } from "../src/ui/hero-title";

const meta: Meta<typeof HeroTitle> = {
  title: "UI/HeroTitle",
  component: HeroTitle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HeroTitle>;

export const Default: Story = {
  args: {
    title: "What should we solve today?",
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "What should we solve today?",
    subtitle: "Powered by Socratify",
  },
};

export const WithCustomSubtitle: Story = {
  args: {
    title: "Build something amazing",
    subtitle: (
      <span className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
        Ready to start
      </span>
    ),
  },
};

export const SizeSmall: Story = {
  args: {
    title: "Small Hero Title",
    subtitle: "This is a smaller hero section",
    size: "sm",
  },
};

export const SizeMedium: Story = {
  args: {
    title: "Medium Hero Title",
    subtitle: "This is a medium hero section",
    size: "md",
  },
};

export const SizeLarge: Story = {
  args: {
    title: "Large Hero Title",
    subtitle: "This is a large hero section",
    size: "lg",
  },
};

export const SizeXL: Story = {
  args: {
    title: "Extra Large Title",
    size: "xl",
  },
};

export const DisplaySizes: Story = {
  render: () => (
    <div className="space-y-12">
      <HeroTitle
        title="Display Small"
        subtitle="Using display-sm size"
        size="display-sm"
      />
      <HeroTitle
        title="Display Medium"
        subtitle="Using display-md size"
        size="display-md"
      />
      <HeroTitle
        title="Display Large"
        subtitle="Using display-lg size"
        size="display-lg"
      />
    </div>
  ),
};

export const AlignLeft: Story = {
  args: {
    title: "Left Aligned Title",
    subtitle: "Subtitle also aligned to the left",
    align: "left",
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export const AlignRight: Story = {
  args: {
    title: "Right Aligned Title",
    subtitle: "Subtitle also aligned to the right",
    align: "right",
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export const NarrowMaxWidth: Story = {
  args: {
    title: "This is a very long title that will wrap because of the narrow max width constraint",
    subtitle: "The subtitle follows the same width",
    maxWidth: "md",
  },
};

export const WideMaxWidth: Story = {
  args: {
    title: "This is a very long title that won't wrap because it has plenty of room",
    subtitle: "Using full max width",
    maxWidth: "full",
  },
  decorators: [
    (Story) => (
      <div className="w-[900px]">
        <Story />
      </div>
    ),
  ],
};

export const SmallGap: Story = {
  args: {
    title: "Title with Small Gap",
    subtitle: "Closer subtitle",
    gap: "sm",
  },
};

export const LargeGap: Story = {
  args: {
    title: "Title with Large Gap",
    subtitle: "More space between title and subtitle",
    gap: "lg",
  },
};

export const LargeSubtitle: Story = {
  args: {
    title: "Main Heading",
    subtitle: "This is a larger subtitle for more emphasis",
    subtitleSize: "lg",
  },
};

export const LandingPageExample: Story = {
  render: () => (
    <div className="space-y-8 py-12">
      <HeroTitle
        title="What should we solve today?"
        subtitle="Powered by Socratify"
        size="display-lg"
        gap="md"
      />
    </div>
  ),
};

export const ProductHero: Story = {
  render: () => (
    <div className="space-y-6 py-12">
      <HeroTitle
        title="Ship faster with AI"
        subtitle={
          <span>
            The intelligent development platform for modern teams.{" "}
            <span className="text-primary font-medium">Get started free →</span>
          </span>
        }
        size="xl"
        subtitleSize="md"
        gap="lg"
      />
    </div>
  ),
};
