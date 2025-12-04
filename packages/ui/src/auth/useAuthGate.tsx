'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@constellation/supabase';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { MagicLinkModal } from './MagicLinkModal';

type AuthGateOptions = {
  siteUrl?: string;
  logoSrc?: string;
  title?: string;
  subtitle?: string;
  supabaseClient?: SupabaseClient | null;
};

type AuthGateReturn = {
  requireAuth: () => Promise<User | null>;
  modal: React.ReactNode;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  supabase: SupabaseClient | null;
};

export function useAuthGate(options?: AuthGateOptions): AuthGateReturn {
  const supabase: SupabaseClient | null = useMemo(() => {
    if (options?.supabaseClient !== undefined) return options.supabaseClient;
    try {
      return createSupabaseBrowserClient();
    } catch (err) {
      console.error('Supabase not configured', err);
      return null;
    }
  }, [options?.supabaseClient]);

  const [open, setOpen] = useState(false);

  const requireAuth = useCallback(async (): Promise<User | null> => {
    if (!supabase) {
      setOpen(true);
      return null;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setOpen(true);
      return null;
    }
    return data.user;
  }, [supabase]);

  const modal = (
    <MagicLinkModal
      open={open}
      onClose={() => setOpen(false)}
      siteUrl={options?.siteUrl}
      logoSrc={options?.logoSrc}
      title={options?.title}
      subtitle={options?.subtitle}
      supabaseClient={supabase || undefined}
    />
  );

  return {
    requireAuth,
    modal,
    openAuthModal: () => setOpen(true),
    closeAuthModal: () => setOpen(false),
    supabase,
  };
}
