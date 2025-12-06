import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from "../src/ui/input-group";
import { Search, Mail, Lock, Eye, EyeOff, Copy, Check } from "lucide-react";

const meta: Meta<typeof InputGroup> = {
  title: "UI/InputGroup",
  component: InputGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

export const Default: Story = {
  render: () => (
    <InputGroup className="w-[300px]">
      <InputGroupAddon align="inline-start">
        <InputGroupText>
          <Search />
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="Search..." />
    </InputGroup>
  ),
};

export const WithPrefix: Story = {
  render: () => (
    <InputGroup className="w-[300px]">
      <InputGroupAddon align="inline-start">
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="example.com" />
    </InputGroup>
  ),
};

export const WithSuffix: Story = {
  render: () => (
    <InputGroup className="w-[300px]">
      <InputGroupInput placeholder="Email" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>@example.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithPrefixAndSuffix: Story = {
  render: () => (
    <InputGroup className="w-[350px]">
      <InputGroupAddon align="inline-start">
        <InputGroupText>$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput type="number" placeholder="0.00" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>USD</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithButton: Story = {
  render: () => (
    <InputGroup className="w-[300px]">
      <InputGroupAddon align="inline-start">
        <InputGroupText>
          <Mail />
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="Enter your email" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>
          <Copy className="w-3.5 h-3.5" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const PasswordWithToggle: Story = {
  render: function PasswordInput() {
    const [showPassword, setShowPassword] = React.useState(false);
    return (
      <InputGroup className="w-[300px]">
        <InputGroupAddon align="inline-start">
          <InputGroupText>
            <Lock />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  },
};

export const CopyToClipboard: Story = {
  render: function CopyInput() {
    const [copied, setCopied] = React.useState(false);
    const handleCopy = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <InputGroup className="w-[350px]">
        <InputGroupInput readOnly value="npx create-next-app@latest" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={handleCopy}>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  },
};

export const WithTextarea: Story = {
  render: () => (
    <InputGroup className="w-[400px]">
      <InputGroupTextarea placeholder="Write your message..." rows={3} />
      <InputGroupAddon align="block-end">
        <InputGroupButton size="sm">Send</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const BlockLayout: Story = {
  render: () => (
    <InputGroup className="w-[400px]">
      <InputGroupAddon align="block-start">
        <InputGroupText>Title</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="Enter title..." />
    </InputGroup>
  ),
};
