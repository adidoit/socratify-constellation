import { createSupabaseBrowserClient } from "@constellation/supabase";

export function createClient() {
  return createSupabaseBrowserClient();
}
