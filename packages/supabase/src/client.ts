import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { Database } from '@constellation/db';

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }

  return { url, anonKey };
}

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>;
type SupabaseServerClient = ReturnType<typeof createServerClient<Database>>;

export function createSupabaseBrowserClient(): SupabaseBrowserClient {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient<Database>(url, anonKey);
}

interface CookieStore {
  get(name: string): { value: string } | undefined;
  set?(name: string, value: string, options?: Record<string, unknown>): void;
  delete?(name: string, options?: Record<string, unknown>): void;
}

export function createSupabaseServerClient(opts: {
  cookies: () => CookieStore;
  headers?: () => Headers;
}): SupabaseServerClient {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = opts.cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: Record<string, unknown>) {
        if (cookieStore.set) {
          cookieStore.set(name, value, options);
        }
      },
      remove(name: string, options?: Record<string, unknown>) {
        if (cookieStore.delete) {
          cookieStore.delete(name, options);
        }
      }
    }
  });
}
