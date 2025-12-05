"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SocratifyBranding } from "@/components/SocratifyBranding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
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

  if (magicLinkSent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-6 shadow-lg">
          <div className="text-center space-y-2">
            <Mail className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-xl font-semibold">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Click the link in the email to continue. Look for a message from hello@socratify.com.
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setMagicLinkSent(false)}
          >
            Use a different email
          </Button>
          <div className="pt-2 text-center text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold uppercase tracking-wide text-foreground">Powered by Socratify</p>
            <p>Make sure hello@socratify.com is in your safe senders.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to continue
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleMagicLink} className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" disabled={isLoading || !email} className="w-full">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send magic link"
            )}
          </Button>
        </form>

        <div className="text-center text-[11px] text-muted-foreground space-y-2">
          <p>We send magic links from hello@socratify.com.</p>
          <div className="flex justify-center">
            <SocratifyBranding variant="minimal" />
          </div>
        </div>
      </div>
    </div>
  );
}
