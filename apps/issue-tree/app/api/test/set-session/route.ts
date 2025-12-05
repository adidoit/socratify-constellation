import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  // Guard to avoid exposing this endpoint outside test/local
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_TEST_AUTH_ENDPOINT !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { access_token, refresh_token } = await req.json().catch(() => ({}));
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "access_token and refresh_token are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user: data.user ?? null });
}
