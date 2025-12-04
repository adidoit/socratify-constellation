import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the intended destination
      const redirectUrl = next.startsWith("/") ? `${origin}${next}` : next;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Auth failed, redirect to sign-in with error
  return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`);
}
