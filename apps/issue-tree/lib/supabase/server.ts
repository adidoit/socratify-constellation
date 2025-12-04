import { cookies, headers } from "next/headers";
import { createSupabaseServerClient } from "@constellation/supabase";

export async function createClient() {
  return createSupabaseServerClient({
    cookies,
    headers,
  });
}
