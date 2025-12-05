import type { Meta, StoryObj } from '@storybook/react';
import { SocratifyBranding } from '../src/branding/SocratifyBranding';

const meta = {
  title: 'Marketing/SocratifyBranding',
  component: SocratifyBranding,
  args: {
    utmSource: 'storybook',
    variant: 'compact',
    tagline: 'Sharpen how you think and speak',
    logoPath: 'https://cdn.socratify.com/logo.png',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['full', 'compact', 'minimal'],
    },
    clickable: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof SocratifyBranding>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Compact: Story = {};

export const Full: Story = {
  args: {
    variant: 'full',
  },
};

export const Minimal: Story = {
  args: {
    variant: 'minimal',
    logoPath: 'https://cdn.socratify.com/logo.png',
  },
};
