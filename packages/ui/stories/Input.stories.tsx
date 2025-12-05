import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../src/ui/input';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    placeholder: 'Enter text...',
    type: 'text',
  },
  render: (args) => (
    <div className="w-80 space-y-2">
      <label className="text-sm font-medium text-foreground" htmlFor="storybook-input">
        Label
      </label>
      <Input id="storybook-input" {...args} />
    </div>
  ),
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue: 'Prefilled value',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Create a password',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Disabled input',
  },
};
