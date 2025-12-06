import type { Meta, StoryObj } from '@storybook/react';
import { Facebook, Github, Youtube } from 'lucide-react';

import { SocratifyFooter } from '../src/branding/SocratifyFooter';

const meta = {
  title: 'Marketing/SocratifyFooter',
  component: SocratifyFooter,
  parameters: {
    layout: 'fullscreen',
  },
  args: {},
} satisfies Meta<typeof SocratifyFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default footer using semantic CSS variables.
 * Theme adapts automatically based on the `dark` class on document root.
 * Use Storybook's theme switcher to toggle between light and dark modes.
 */
export const Default: Story = {};

/**
 * Footer with custom company and social links.
 */
export const CustomLinks: Story = {
  args: {
    companyLinks: [
      { name: 'About', href: '/about' },
      { name: 'Press', href: '/press' },
    ],
    legalLinks: [
      { name: 'Security', href: '/security' },
      { name: 'Responsible Disclosure', href: '/security/responsible-disclosure' },
    ],
    socialLinks: [
      { name: 'GitHub', href: 'https://github.com/socratify', icon: <Github className="h-5 w-5" /> },
      { name: 'Facebook', href: 'https://www.facebook.com/socratifyai', icon: <Facebook className="h-5 w-5" /> },
      { name: 'YouTube', href: 'https://www.youtube.com/@socratify', icon: <Youtube className="h-5 w-5" /> },
    ],
    contactEmail: 'partners@socratify.com',
  },
};

/**
 * Footer with email subscription form enabled.
 */
export const WithSubscribe: Story = {
  args: {
    enableSubscribe: true,
    subscribeDescription: 'Monthly updates on new releases and research drops.',
    onSubscribe: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    },
  },
};

/**
 * Footer in dark mode.
 * Uses the Storybook theme addon to force dark mode.
 */
export const DarkMode: Story = {
  parameters: {
    themes: {
      themeOverride: 'dark',
    },
    backgrounds: {
      default: 'dark',
    },
  },
};

/**
 * Footer with subscription form in dark mode.
 */
export const DarkModeWithSubscribe: Story = {
  args: {
    enableSubscribe: true,
    subscribeDescription: 'Monthly updates on new releases and research drops.',
    onSubscribe: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    },
  },
  parameters: {
    themes: {
      themeOverride: 'dark',
    },
    backgrounds: {
      default: 'dark',
    },
  },
};
