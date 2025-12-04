-- Initial schema for the socratify-constellation Supabase project.

create extension if not exists "pgcrypto" with schema public;

create table public.apps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  domain text not null unique,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.user_apps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, app_id)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  plan text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table public.issue_tree_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.phonescreen_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.user_apps enable row level security;

create policy "Users can view their memberships"
on public.user_apps
for select
using (user_id = auth.uid());

create policy "Users can manage their memberships"
on public.user_apps
for all
using (user_id = auth.uid());

alter table public.subscriptions enable row level security;

create policy "Users can see their subscriptions"
on public.subscriptions
for select
using (user_id = auth.uid());

create policy "Users can manage their subscriptions"
on public.subscriptions
for all
using (user_id = auth.uid());

alter table public.issue_tree_cases enable row level security;

create policy "User owns issue tree cases"
on public.issue_tree_cases
for all
using (user_id = auth.uid());

alter table public.phonescreen_questions enable row level security;

create policy "User owns phonescreen questions"
on public.phonescreen_questions
for all
using (user_id = auth.uid());
