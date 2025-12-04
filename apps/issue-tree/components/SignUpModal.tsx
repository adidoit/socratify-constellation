"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SignUpModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SignUpModal({ open, onClose }: SignUpModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const buildResumeUrl = () => {
    try {
      const current = new URL(window.location.href);
      const params = new URLSearchParams(current.search);
      params.set("resume", "1");
      const qs = params.toString();
      return `${current.pathname}${qs ? `?${qs}` : ""}`;
    } catch {
      return "/?resume=1";
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const target = buildResumeUrl();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setMagicLinkSent(true);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setMagicLinkSent(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isLoading && !next) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden">
        {magicLinkSent ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl text-center">
                Check your email
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                We sent a magic link to
                <br />
                <strong className="text-foreground">{email}</strong>
              </DialogDescription>
            </DialogHeader>
            <p className="mt-4 text-sm text-muted-foreground">
              Click the link in the email to continue.
            </p>
            <Button
              variant="ghost"
              className="mt-6 w-full"
              onClick={() => setMagicLinkSent(false)}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <div className="p-8">
            <div className="mx-auto mb-6 flex justify-center">
              <img src="/logo.png" alt="Logo" className="h-12 w-12" />
            </div>
            <DialogHeader className="space-y-3 mb-6">
              <DialogTitle className="text-xl text-center">
                Sign in to continue
              </DialogTitle>
            </DialogHeader>

            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className="h-12 text-base"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-12 text-base gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send magic link
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              No password needed. We&apos;ll email you a secure link.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
