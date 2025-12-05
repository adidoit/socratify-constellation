import { getSupabaseAdminClient } from './supabaseAdmin';

const DEFAULT_TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL || 'testuser@example.com';

export type MagicLinkOptions = {
  email?: string;
  redirectTo?: string;
};

/**
 * Ensures a test user exists and is email-confirmed.
 * Idempotent: ignores "already registered" errors.
 */
export async function ensureTestUser(email: string = DEFAULT_TEST_EMAIL): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    const isAlready =
      msg.includes('already registered') || msg.includes('already been registered') || msg.includes('duplicate');
    if (!isAlready) {
      throw new Error(`Supabase createUser failed: ${error.message}`);
    }
  }

  return email;
}

/**
 * Generates a Supabase magic-link action URL for the given user.
 */
export async function getMagicLinkFor(
  email: string = DEFAULT_TEST_EMAIL,
  redirectTo?: string
): Promise<string> {
  const supabase = getSupabaseAdminClient();
  await ensureTestUser(email);

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: redirectTo ? { redirectTo } : undefined,
  });

  const actionLink = data?.properties?.action_link;

  if (error || !actionLink) {
    throw new Error(`Failed to generate magic link: ${error?.message ?? 'no action_link returned'}`);
  }

  return actionLink;
}

export { DEFAULT_TEST_EMAIL };
