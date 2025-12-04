import { cookies, headers } from 'next/headers';
import { createSupabaseServerClient } from '@constellation/supabase';

export function getSupabaseServerClient() {
  return createSupabaseServerClient({
    cookies,
    headers
  });
}
