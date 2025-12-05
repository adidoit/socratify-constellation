import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@constellation/supabase';

export async function createClient() {
  const cookieStore = await cookies();

  const supabase = createSupabaseServerClient({
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

  // Hydrate a session from test cookies if present
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  return supabase;
}
