import type { Page } from '@playwright/test';
import { getMagicLinkFor } from '../getMagicLink';

export type LoginWithMagicLinkOptions = {
  email?: string;
  redirectTo?: string;
  waitForPathContains?: string;
  supabaseUrl?: string;
  baseUrl?: string;
};

function parseJwtPayload(token: string) {
  const payload = token.split('.')[1];
  const decoded = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  return JSON.parse(decoded);
}

function getSupabaseStorageKey(url?: string) {
  if (!url) return null;
  const host = new URL(url).hostname;
  const ref = host.split('.')[0];
  if (!ref) return null;
  return `sb-${ref}-auth-token`;
}

function parseSetCookieHeader(header: string): { name: string; value: string; path?: string; domain?: string } | null {
  const [nv, ...attrs] = header.split(';').map((s) => s.trim());
  const [name, ...valParts] = nv.split('=');
  if (!name || valParts.length === 0) return null;
  const value = valParts.join('=');
  const parsed: { name: string; value: string; path?: string; domain?: string } = { name, value };
  for (const attr of attrs) {
    const [k, v] = attr.split('=');
    if (!k || !v) continue;
    const key = k.toLowerCase();
    if (key === 'path') parsed.path = v;
    if (key === 'domain') parsed.domain = v;
  }
  return parsed;
}

/**
 * Generates a magic link for the given email, navigates to it, and hydrates Supabase
 * localStorage with the returned session (hash tokens) so the app sees an authenticated user.
 */
export async function loginWithMagicLink(
  page: Page,
  { email, redirectTo, waitForPathContains, supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL, baseUrl }: LoginWithMagicLinkOptions
): Promise<string> {
  const magicLink = await getMagicLinkFor(email, redirectTo);
  await page.goto(magicLink);

  // Supabase magic links redirect with tokens in the URL hash.
  const hash = await page.evaluate(() => window.location.hash);
  if (hash && hash.includes('access_token')) {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expires_at_str = params.get('expires_at');
    if (access_token && refresh_token) {
      const storageKey = getSupabaseStorageKey(supabaseUrl);
      const now = Math.floor(Date.now() / 1000);
      const expires_at = expires_at_str ? Number(expires_at_str) : now + 3600;
      const expires_in = Math.max(expires_at - now, 1);
      const payload = parseJwtPayload(access_token);
      const session = {
        access_token,
        refresh_token,
        expires_in,
        expires_at,
        token_type: 'bearer',
        user: {
          id: payload.sub,
          app_metadata: payload.app_metadata ?? {},
          user_metadata: payload.user_metadata ?? {},
          aud: payload.aud ?? 'authenticated',
          role: payload.role ?? 'authenticated',
          email: payload.email ?? email ?? null,
          phone: payload.phone ?? '',
          created_at: payload.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          identities: [],
          factors: payload.factors ?? [],
        },
      };

      if (storageKey) {
        const storageValue = JSON.stringify({ currentSession: session, expiresAt: expires_at });
        const appOrigin = baseUrl || redirectTo || "http://127.0.0.1:3000";

        await page.goto(appOrigin);

        await page.context().addCookies([
          {
            name: storageKey,
            value: `base64-${Buffer.from(storageValue).toString("base64url")}`,
            domain: new URL(appOrigin).hostname,
            path: "/",
            sameSite: "Lax",
            httpOnly: false,
          },
          {
            name: "sb-access-token",
            value: access_token,
            domain: new URL(appOrigin).hostname,
            path: "/",
            sameSite: "Lax",
            httpOnly: false,
          },
          {
            name: "sb-refresh-token",
            value: refresh_token,
            domain: new URL(appOrigin).hostname,
            path: "/",
            sameSite: "Lax",
            httpOnly: false,
          },
        ]);

        // Mirror in localStorage for client-side Supabase.
        await page.evaluate(
          ({ storageKey, storageValue }) => {
            localStorage.setItem(storageKey, storageValue);
          },
          { storageKey, storageValue }
        );
      }

      // Reload the app so Supabase picks up the stored session.
      await page.goto(redirectTo || '/');
      return magicLink;
    }
  }

  if (waitForPathContains) {
    await page.waitForURL(`**${waitForPathContains}**`, { timeout: 30_000 });
  }

  return magicLink;
}
