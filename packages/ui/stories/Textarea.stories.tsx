import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../src/ui/textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  args: {
    placeholder: 'Type your message here.',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Textarea placeholder="Type your message here." className="w-[300px]" />,
};

export const Disabled: Story = {
  render: () => (
    <Textarea
      placeholder="Disabled textarea"
      disabled
      className="w-[300px]"
    />
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-[300px] gap-1.5">
      <label htmlFor="message" className="text-sm font-medium">
        Your message
      </label>
      <Textarea placeholder="Type your message here." id="message" />
      <p className="text-sm text-muted-foreground">
        Your message will be copied to the support team.
      </p>
    </div>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <Textarea
      defaultValue="This is some pre-filled content in the textarea."
      className="w-[300px]"
    />
  ),
};
