"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    const doSignOut = async () => {
      try {
        await supabase.auth.signOut();
      } finally {
        if (!cancelled) {
          router.replace("/");
        }
      }
    };
    void doSignOut();
    return () => {
      cancelled = true;
    };
  }, [router, supabase.auth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-xl border border-border bg-card shadow-lg">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm text-foreground font-medium">Signing you out…</p>
      </div>
    </div>
  );
}
