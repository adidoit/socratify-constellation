import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn("Missing Supabase env vars for API tests. Skipping will occur.");
}

export type TestUser = {
  id: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
};

const adminClient = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

const anonClient = supabaseUrl && anonKey
  ? createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

export async function createTestUser(): Promise<TestUser | null> {
  if (!adminClient || !anonClient) return null;

  const email = `playwright+${Date.now()}@example.com`;
  const password = "StrongPass!123";

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    throw createError ?? new Error("Failed to create test user");
  }

  const { data: sessionData, error: signInError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError || !sessionData.session) {
    throw signInError ?? new Error("Failed to sign in test user");
  }

  const { session, user } = sessionData;
  return {
    id: user.id,
    email,
    password,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
}

export async function deleteTestUser(userId: string) {
  if (!adminClient) return;
  await adminClient.auth.admin.deleteUser(userId);
}

export function buildAuthCookies(baseURL: string, accessToken: string, refreshToken: string) {
  const url = new URL(baseURL);
  return [
    {
      name: "sb-access-token",
      value: accessToken,
      domain: url.hostname,
      path: "/",
      httpOnly: false,
      secure: url.protocol === "https:",
      sameSite: "Lax" as const,
    },
    {
      name: "sb-refresh-token",
      value: refreshToken,
      domain: url.hostname,
      path: "/",
      httpOnly: false,
      secure: url.protocol === "https:",
      sameSite: "Lax" as const,
    },
  ];
}
