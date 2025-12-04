-- Issue Tree product tables, migrated into the shared Supabase project.

create table if not exists public.issue_trees (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  tree_json jsonb not null,
  is_example boolean not null default false,
  source text,
  forked_from_id text references public.issue_trees(id) on delete set null,
  challenge_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.issue_tree_assessments (
  id text primary key default gen_random_uuid()::text,
  issue_tree_id text not null references public.issue_trees(id) on delete cascade,
  assessment_json jsonb not null,
  overall_score integer,
  created_at timestamptz not null default now()
);

create table if not exists public.tree_revisions (
  id text primary key default gen_random_uuid()::text,
  issue_tree_id text not null references public.issue_trees(id) on delete cascade,
  tree_json jsonb not null,
  label text,
  created_at timestamptz not null default now()
);

create index if not exists idx_issue_trees_user_created on public.issue_trees(user_id, created_at);
create index if not exists idx_issue_trees_challenge on public.issue_trees(challenge_id);
create index if not exists idx_assessments_tree_created on public.issue_tree_assessments(issue_tree_id, created_at);
create index if not exists idx_revisions_tree_created on public.tree_revisions(issue_tree_id, created_at);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists issue_trees_updated_at on public.issue_trees;
create trigger issue_trees_updated_at
  before update on public.issue_trees
  for each row
  execute function public.update_updated_at_column();

alter table public.issue_trees enable row level security;
alter table public.issue_tree_assessments enable row level security;
alter table public.tree_revisions enable row level security;

-- Anyone can read any issue tree (for sharing)
create policy "issue_trees_select_all" on public.issue_trees
  for select using (true);

-- Authenticated users can insert their own trees
create policy "issue_trees_insert_own" on public.issue_trees
  for insert with check (auth.uid() = user_id or user_id is null);

-- Users can update their own trees
create policy "issue_trees_update_own" on public.issue_trees
  for update using (auth.uid() = user_id or user_id is null);

-- Users can delete their own trees
create policy "issue_trees_delete_own" on public.issue_trees
  for delete using (auth.uid() = user_id);

-- Anyone can read assessments
create policy "assessments_select_all" on public.issue_tree_assessments
  for select using (true);

-- Users can insert assessments for their own trees
create policy "assessments_insert_own" on public.issue_tree_assessments
  for insert with check (
    exists (
      select 1 from public.issue_trees
      where id = issue_tree_id and (user_id = auth.uid() or user_id is null)
    )
  );

-- Anyone can read revisions
create policy "revisions_select_all" on public.tree_revisions
  for select using (true);

-- Users can insert revisions for their own trees
create policy "revisions_insert_own" on public.tree_revisions
  for insert with check (
    exists (
      select 1 from public.issue_trees
      where id = issue_tree_id and (user_id = auth.uid() or user_id is null)
    )
  );
