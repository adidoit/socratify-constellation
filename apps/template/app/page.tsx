import { getSupabaseServerClient } from '../lib/supabaseServer';
import { APP_SLUG } from '../config/app';

export const dynamic = 'force-dynamic';

export default async function TemplateDashboardPage() {
  const supabase = getSupabaseServerClient();

  const { data: app, error: appError } = await supabase
    .from('apps')
    .select('id, slug')
    .eq('slug', APP_SLUG)
    .single<{ id: string; slug: string }>();

  if (appError || !app) {
    return (
      <main>
        <h1>Constellation App Template</h1>
        <p>
          App config not found for slug <code>{APP_SLUG}</code>. Ensure an entry exists in the
          <code>apps</code> table and update <code>APP_SLUG</code> in <code>config/app.ts</code>.
        </p>
      </main>
    );
  }

  const appId = app.id;

  const { data: subscriptions, error: subsError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('app_id', appId);

  return (
    <main>
      <h1>Constellation App Template</h1>
      <p>
        This page shows how to resolve the current app via <code>APP_SLUG</code> and query shared
        tables (here, <code>subscriptions</code>).
      </p>
      {subsError ? (
        <p>Failed to load subscriptions.</p>
      ) : (
        <pre>{JSON.stringify(subscriptions, null, 2)}</pre>
      )}
    </main>
  );
}
