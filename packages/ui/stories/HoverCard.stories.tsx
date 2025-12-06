import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../src/ui/hover-card";
import { Button } from "../src/ui/button";

const meta: Meta<typeof HoverCard> = {
  title: "UI/HoverCard",
  component: HoverCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@nextjs</h4>
            <p className="text-sm">
              The React Framework – created and maintained by @vercel.
            </p>
            <div className="flex items-center pt-2">
              <span className="text-xs text-muted-foreground">
                Joined December 2021
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" className="text-base">
          Hover over me
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="flex space-x-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-sm font-medium">JD</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">John Doe</h4>
            <p className="text-sm text-muted-foreground">
              Software Engineer at Acme Inc.
            </p>
            <p className="text-xs text-muted-foreground">john@example.com</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const AlignStart: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline">Align Start</Button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-64">
        <p className="text-sm">
          This hover card is aligned to the start of the trigger element.
        </p>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const AlignEnd: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline">Align End</Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-64">
        <p className="text-sm">
          This hover card is aligned to the end of the trigger element.
        </p>
      </HoverCardContent>
    </HoverCard>
  ),
};
