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

export const Default: Story = {};

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
    subscribeDescription: 'Monthly updates on new releases and research drops.',
  },
};

export const WithSubscribe: Story = {
  args: {
    enableSubscribe: true,
    onSubscribe: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    },
  },
};

export const LightMode: Story = {
  args: {
    theme: 'light',
    companyLinks: [
      { name: 'About', href: '/about' },
      { name: 'Docs', href: '/docs' },
    ],
    legalLinks: [
      { name: 'Terms', href: '/terms' },
      { name: 'Privacy', href: '/privacy' },
    ],
  },
};
