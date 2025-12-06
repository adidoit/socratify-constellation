import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  LandingPromptInput,
  LandingPromptInputWithChips,
} from "../src/ui/landing-prompt-input";
import { TrendingDown, TrendingUp, Megaphone, Sparkles, Target } from "lucide-react";

const meta: Meta<typeof LandingPromptInput> = {
  title: "UI/LandingPromptInput",
  component: LandingPromptInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LandingPromptInput>;

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState("");

    return (
      <LandingPromptInput
        value={value}
        onValueChange={setValue}
        onSubmit={(val) => console.log("Submitted:", val)}
        placeholder="Describe the problem..."
      />
    );
  },
};

export const WithValue: Story = {
  render: function WithValueStory() {
    const [value, setValue] = useState("How can we reduce customer churn?");

    return (
      <LandingPromptInput
        value={value}
        onValueChange={setValue}
        onSubmit={(val) => console.log("Submitted:", val)}
      />
    );
  },
};

export const Loading: Story = {
  render: function LoadingStory() {
    const [value, setValue] = useState("Analyzing market trends");

    return (
      <LandingPromptInput
        value={value}
        onValueChange={setValue}
        onSubmit={(val) => console.log("Submitted:", val)}
        status="loading"
        loadingMessage="Analyzing your problem..."
      />
    );
  },
};

export const WithoutKeyboardHint: Story = {
  render: function WithoutKeyboardHintStory() {
    const [value, setValue] = useState("");

    return (
      <LandingPromptInput
        value={value}
        onValueChange={setValue}
        onSubmit={(val) => console.log("Submitted:", val)}
        showKeyboardHint={false}
      />
    );
  },
};

export const CustomPlaceholder: Story = {
  render: function CustomPlaceholderStory() {
    const [value, setValue] = useState("");

    return (
      <LandingPromptInput
        value={value}
        onValueChange={setValue}
        onSubmit={(val) => console.log("Submitted:", val)}
        placeholder="What challenge are you facing?"
      />
    );
  },
};

export const WithChips: Story = {
  render: function WithChipsStory() {
    const [value, setValue] = useState("");

    const chips = [
      { label: "Reduce user churn", icon: TrendingDown },
      { label: "Improve conversion", icon: TrendingUp },
      { label: "Increase awareness", icon: Megaphone },
    ];

    return (
      <LandingPromptInputWithChips
        value={value}
        onValueChange={setValue}
        onSubmit={(val) => console.log("Submitted:", val)}
        chips={chips}
        onChipClick={(label) => setValue(label)}
      />
    );
  },
};

export const WithChipsLoading: Story = {
  render: function WithChipsLoadingStory() {
    const [value, setValue] = useState("Reduce user churn");

    const chips = [
      { label: "Reduce user churn", icon: TrendingDown },
      { label: "Improve conversion", icon: TrendingUp },
      { label: "Increase awareness", icon: Megaphone },
    ];

    return (
      <LandingPromptInputWithChips
        value={value}
        onValueChange={setValue}
        onSubmit={(val) => console.log("Submitted:", val)}
        chips={chips}
        onChipClick={(label) => setValue(label)}
        status="loading"
        loadingMessage="Creating your tree..."
      />
    );
  },
};

export const WithChipsNoIcons: Story = {
  render: function WithChipsNoIconsStory() {
    const [value, setValue] = useState("");

    const chips = [
      { label: "Growth strategy" },
      { label: "Product roadmap" },
      { label: "Team scaling" },
    ];

    return (
      <LandingPromptInputWithChips
        value={value}
        onValueChange={setValue}
        onSubmit={(val) => console.log("Submitted:", val)}
        chips={chips}
        onChipClick={(label) => setValue(label)}
      />
    );
  },
};

export const FullExample: Story = {
  render: function FullExampleStory() {
    const [value, setValue] = useState("");
    const [status, setStatus] = useState<"idle" | "loading">("idle");
    const [loadingMessage, setLoadingMessage] = useState("");

    const chips = [
      { label: "Reduce user churn", icon: TrendingDown },
      { label: "Improve conversion", icon: TrendingUp },
      { label: "Increase awareness", icon: Megaphone },
      { label: "Launch new product", icon: Sparkles },
      { label: "Define OKRs", icon: Target },
    ];

    const handleSubmit = async (val: string) => {
      setStatus("loading");
      setLoadingMessage("Analyzing your problem...");
      await new Promise((r) => setTimeout(r, 1500));
      setLoadingMessage("Creating your tree...");
      await new Promise((r) => setTimeout(r, 1500));
      console.log("Submitted:", val);
      setStatus("idle");
      setValue("");
    };

    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">What should we solve today?</h1>
          <p className="text-sm text-muted-foreground">Powered by AI</p>
        </div>
        <LandingPromptInputWithChips
          value={value}
          onValueChange={setValue}
          onSubmit={handleSubmit}
          chips={chips}
          onChipClick={(label) => setValue(label)}
          status={status}
          loadingMessage={loadingMessage}
        />
      </div>
    );
  },
};
