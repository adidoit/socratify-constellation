import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { Database } from '@constellation/db';
type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>;
type SupabaseServerClient = ReturnType<typeof createServerClient<Database>>;
export declare function createSupabaseBrowserClient(): SupabaseBrowserClient;
interface CookieStore {
    get(name: string): {
        value: string;
    } | undefined;
    set?(name: string, value: string, options?: Record<string, unknown>): void;
    delete?(name: string, options?: Record<string, unknown>): void;
}
export declare function createSupabaseServerClient(opts: {
    cookies: () => CookieStore;
    headers?: () => Headers;
}): SupabaseServerClient;
export {};
//# sourceMappingURL=client.d.ts.map