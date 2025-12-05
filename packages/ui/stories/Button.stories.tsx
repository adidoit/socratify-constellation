import type { Meta, StoryObj } from '@storybook/react';
import { Mail } from 'lucide-react';
import { Button } from '../src/ui/button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Click me',
    variant: 'default',
    size: 'default',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete issue',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="h-4 w-4" />
        Notify me
      </>
    ),
    variant: 'secondary',
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'secondary',
    size: 'icon',
    children: <Mail />,
    'aria-label': 'Notify me',
  },
};
