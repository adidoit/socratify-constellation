import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { Database } from '@constellation/db';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!anonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
}

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(url, anonKey);
}

export function createSupabaseServerClient(opts: {
  cookies: () => {
    get(name: string): { value: string } | undefined;
    set?: (name: string, value: string, options?: { path?: string }) => void;
    delete?: (name: string, options?: { path?: string }) => void;
  };
  headers?: () => Headers;
}) {
  const cookieStore = opts.cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: { path?: string }) {
        if (cookieStore.set) {
          cookieStore.set(name, value, options);
        }
      },
      remove(name: string, options?: { path?: string }) {
        if (cookieStore.delete) {
          cookieStore.delete(name, options);
        }
      }
    }
  });
}
