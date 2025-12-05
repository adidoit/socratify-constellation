import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { MagicLinkModal } from '../src/auth/MagicLinkModal';
import { Button } from '../src/ui/button';

type SignInWithOtpResponse = Awaited<ReturnType<SupabaseClient['auth']['signInWithOtp']>>;

const mockSupabaseClient = {
  auth: {
    signInWithOtp: async ({ email }: { email: string }): Promise<SignInWithOtpResponse> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (email.includes('fail')) {
        return {
          data: { user: null, session: null },
          error: { message: 'Unable to send magic link right now' } as SignInWithOtpResponse['error'],
        };
      }
      return { data: { user: null, session: null }, error: null };
    },
  },
} as unknown as SupabaseClient;

const meta = {
  title: 'Auth/MagicLinkModal',
  component: MagicLinkModal,
  args: {
    open: true,
    title: 'Sign in to continue',
    subtitle: 'We’ll send you a magic link from hello@socratify.com.',
    supabaseClient: mockSupabaseClient,
    brandingUtmSource: 'storybook',
    brandingProps: {
      variant: 'minimal',
      logoPath: 'https://cdn.socratify.com/logo.png',
      clickable: false,
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <p className="text-sm text-muted-foreground">Use an email with “fail” to see the error state.</p>
        </div>
        <MagicLinkModal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          supabaseClient={args.supabaseClient ?? mockSupabaseClient}
          brandingProps={{ clickable: false, ...(args.brandingProps ?? {}) }}
        />
      </div>
    );
  },
} satisfies Meta<typeof MagicLinkModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithBranding: Story = {
  args: {
    logoSrc: 'https://dummyimage.com/96x96/111827/ffffff&text=S',
    title: 'Sign in to Issue Tree',
    subtitle: 'Secure magic link sign-in for your workspace.',
    siteUrl: 'https://issuetree.ai',
  },
};
