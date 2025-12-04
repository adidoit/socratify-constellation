import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@constellation/supabase';

export async function createClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient({
    cookies: () => ({
      get: (name: string) => cookieStore.get(name),
      set: (name: string, value: string, options?: Record<string, unknown>) => {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Server Component - cookies are read-only
        }
      },
      delete: (name: string) => {
        try {
          cookieStore.delete(name);
        } catch {
          // Server Component - cookies are read-only
        }
      },
    }),
  });
}
