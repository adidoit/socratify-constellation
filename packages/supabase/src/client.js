import { createBrowserClient, createServerClient } from '@supabase/ssr';
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
export function createSupabaseBrowserClient() {
    const { url, anonKey } = getSupabaseConfig();
    return createBrowserClient(url, anonKey);
}
export function createSupabaseServerClient(opts) {
    const { url, anonKey } = getSupabaseConfig();
    const cookieStore = opts.cookies();
    return createServerClient(url, anonKey, {
        cookies: {
            get(name) {
                return cookieStore.get(name)?.value;
            },
            set(name, value, options) {
                if (cookieStore.set) {
                    cookieStore.set(name, value, options);
                }
            },
            remove(name, options) {
                if (cookieStore.delete) {
                    cookieStore.delete(name, options);
                }
            }
        }
    });
}
