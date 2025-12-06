import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputButton,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectValue,
  usePromptInputController,
  type PromptInputMessage,
} from "../src/ui/prompt-input";
import { ImageIcon, MicIcon, SparklesIcon, BrainIcon, RocketIcon } from "lucide-react";

const meta: Meta<typeof PromptInput> = {
  title: "UI/PromptInput",
  component: PromptInput,
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
type Story = StoryObj<typeof PromptInput>;

export const Default: Story = {
  render: () => {
    const handleSubmit = (message: PromptInputMessage) => {
      console.log("Submitted:", message);
    };

    return (
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea placeholder="Ask me anything..." />
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    );
  },
};

export const WithToolbar: Story = {
  render: () => {
    const handleSubmit = (message: PromptInputMessage) => {
      console.log("Submitted:", message);
    };

    return (
      <PromptInput onSubmit={handleSubmit} accept="image/*" multiple>
        <PromptInputTextarea placeholder="What would you like to know?" />
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputButton>
              <MicIcon className="size-4" />
            </PromptInputButton>
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    );
  },
};

export const WithAttachments: Story = {
  render: () => {
    const handleSubmit = (message: PromptInputMessage) => {
      console.log("Submitted:", message);
    };

    return (
      <PromptInput onSubmit={handleSubmit} accept="image/*" multiple>
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>
        <PromptInputTextarea placeholder="Describe what you need..." />
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments label="Add images" />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    );
  },
};

export const WithModelSelect: Story = {
  render: () => {
    const handleSubmit = (message: PromptInputMessage) => {
      console.log("Submitted:", message);
    };

    return (
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea placeholder="Ask a question..." />
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputSelect defaultValue="gpt-4">
              <PromptInputSelectTrigger className="h-8 w-auto gap-1.5 px-2 text-xs">
                <SparklesIcon className="size-3.5" />
                <PromptInputSelectValue />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                <PromptInputSelectItem value="gpt-4">
                  <span className="flex items-center gap-2">
                    <SparklesIcon className="size-3.5" />
                    GPT-4
                  </span>
                </PromptInputSelectItem>
                <PromptInputSelectItem value="claude">
                  <span className="flex items-center gap-2">
                    <BrainIcon className="size-3.5" />
                    Claude 3
                  </span>
                </PromptInputSelectItem>
                <PromptInputSelectItem value="gemini">
                  <span className="flex items-center gap-2">
                    <RocketIcon className="size-3.5" />
                    Gemini Pro
                  </span>
                </PromptInputSelectItem>
              </PromptInputSelectContent>
            </PromptInputSelect>
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    );
  },
};

export const LoadingState: Story = {
  render: () => {
    const handleSubmit = (message: PromptInputMessage) => {
      console.log("Submitted:", message);
    };

    return (
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea placeholder="Waiting for response..." />
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit status="submitted" disabled />
        </PromptInputFooter>
      </PromptInput>
    );
  },
};

export const StreamingState: Story = {
  render: () => {
    const handleSubmit = (message: PromptInputMessage) => {
      console.log("Submitted:", message);
    };

    return (
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea placeholder="Click stop to cancel..." />
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit status="streaming" />
        </PromptInputFooter>
      </PromptInput>
    );
  },
};

export const ErrorState: Story = {
  render: () => {
    const handleSubmit = (message: PromptInputMessage) => {
      console.log("Submitted:", message);
    };

    return (
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea placeholder="An error occurred..." />
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit status="error" />
        </PromptInputFooter>
      </PromptInput>
    );
  },
};

// Example using the Provider pattern for controlled state
const ControlledExample = () => {
  const controller = usePromptInputController();

  const handleSubmit = async (message: PromptInputMessage) => {
    console.log("Message:", message.text);
    console.log("Files:", message.files);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <PromptInput onSubmit={handleSubmit} accept="image/*" multiple>
      <PromptInputHeader>
        <PromptInputAttachments>
          {(attachment) => <PromptInputAttachment data={attachment} />}
        </PromptInputAttachments>
      </PromptInputHeader>
      <PromptInputTextarea />
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
        </PromptInputTools>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {controller.textInput.value.length} chars
          </span>
          <PromptInputSubmit disabled={!controller.textInput.value.trim()} />
        </div>
      </PromptInputFooter>
    </PromptInput>
  );
};

export const WithProvider: Story = {
  render: () => (
    <PromptInputProvider initialInput="">
      <ControlledExample />
    </PromptInputProvider>
  ),
};

export const FullFeatured: Story = {
  render: () => {
    const [status, setStatus] = useState<"ready" | "submitted" | "streaming">("ready");

    const handleSubmit = async (message: PromptInputMessage) => {
      console.log("Submitted:", message);
      setStatus("submitted");
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus("streaming");
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus("ready");
    };

    return (
      <PromptInput
        onSubmit={handleSubmit}
        accept="image/*,.pdf,.doc,.docx"
        multiple
        maxFiles={5}
        onError={(err) => console.error(err)}
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>
        <PromptInputTextarea placeholder="What can I help you with today?" />
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputSelect defaultValue="gpt-4">
              <PromptInputSelectTrigger className="h-8 w-auto gap-1.5 px-2 text-xs">
                <PromptInputSelectValue />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                <PromptInputSelectItem value="gpt-4">GPT-4o</PromptInputSelectItem>
                <PromptInputSelectItem value="gpt-3.5">GPT-3.5</PromptInputSelectItem>
                <PromptInputSelectItem value="claude">Claude</PromptInputSelectItem>
              </PromptInputSelectContent>
            </PromptInputSelect>
          </PromptInputTools>
          <PromptInputSubmit
            status={status}
            disabled={status === "submitted"}
          />
        </PromptInputFooter>
      </PromptInput>
    );
  },
};
