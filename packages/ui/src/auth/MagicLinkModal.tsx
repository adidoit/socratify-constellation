'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@constellation/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import type { SupabaseClient } from '@supabase/supabase-js';

type MagicLinkModalProps = {
  open: boolean;
  onClose: () => void;
  siteUrl?: string;
  logoSrc?: string;
  title?: string;
  subtitle?: string;
  supabaseClient?: SupabaseClient;
};

function resolveSiteUrl(explicit?: string) {
  if (explicit) return explicit;
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL;
}

function buildRedirect(siteUrl: string | undefined) {
  const origin = siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const next =
    typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}${window.location.hash}`
      : '/';
  if (!origin) return undefined;
  const callback = `${origin.replace(/\/$/, '')}/auth/callback`;
  return `${callback}?next=${encodeURIComponent(next)}`;
}

export function MagicLinkModal({
  open,
  onClose,
  siteUrl,
  logoSrc,
  title = 'Sign in to continue',
  subtitle = 'We will email you a magic link.',
  supabaseClient,
}: MagicLinkModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    if (supabaseClient) return supabaseClient;
    try {
      return createSupabaseBrowserClient();
    } catch (err) {
      console.error('Supabase not configured', err);
      return null;
    }
  }, [supabaseClient]);

  const reset = () => {
    setEmail('');
    setStatus('idle');
    setError(null);
  };

  const handleClose = () => {
    if (status === 'sending') return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !supabase) {
      setError('Supabase is not configured.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setError(null);
    try {
      const redirectTo = buildRedirect(resolveSiteUrl(siteUrl));
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      });
      if (signInError) {
        setError(signInError.message);
        setStatus('error');
      } else {
        setStatus('sent');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send link');
      setStatus('error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen: boolean) => (!nextOpen ? handleClose() : null)}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden">
        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl text-center flex flex-col items-center gap-3">
              {logoSrc ? <img src={logoSrc} alt="Logo" className="h-12 w-12" /> : null}
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-base">{subtitle}</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {status === 'sent' ? (
            <div className="space-y-2 text-center text-sm text-muted-foreground">
              <p className="text-foreground font-medium">Check your email</p>
              <p>We sent a magic link to</p>
              <p className="text-foreground font-semibold">{email}</p>
              <p className="text-xs">Click it to finish signing in, then retry your action.</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="magic-email">
                  Work or personal email
                </label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'sending'}
                  autoFocus
                  className="h-12 text-base"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={!email || status === 'sending'}
                className="w-full h-12 text-base gap-2"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending magic link...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send magic link
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
