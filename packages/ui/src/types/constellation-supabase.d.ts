declare module '@constellation/supabase' {
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { Database } from '@constellation/db';

  export function createSupabaseBrowserClient(): SupabaseClient<Database>;
  export function createSupabaseServerClient(options: {
    cookies: () => {
      get: (name: string) => unknown;
      set?: (name: string, value: string, options?: Record<string, unknown>) => void;
      delete?: (name: string, options?: Record<string, unknown>) => void;
    };
    headers?: () => Headers;
  }): SupabaseClient<Database>;
}
