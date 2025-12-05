import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set for test utilities`);
  }
  return value;
}

/**
 * Node-only Supabase client using the service role key.
 * Never import this into client-side code.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}
