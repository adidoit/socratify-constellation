import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getServerAuth() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  if (accessToken) {
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    return { userId: user?.id ?? null, user };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { userId: user?.id ?? null, user };
}
