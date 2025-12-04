import { createClient } from "@/lib/supabase/server";

export async function getServerAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { userId: user?.id ?? null, user };
}
