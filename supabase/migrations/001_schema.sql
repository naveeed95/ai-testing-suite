-- ═══════════════════════════════════════════════════════════
-- Tythos AI Evaluation — database schema
-- Paste this into Supabase SQL editor and run it
-- ═══════════════════════════════════════════════════════════

-- Runs: one row per evaluation run
create table public.runs (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  target_url    text not null,
  target_model  text,
  overall_score integer,
  phase_scores  jsonb,
  stage_results jsonb,
  report        text,
  status        text default 'running' check (status in ('running','complete','aborted')),
  share_id      text unique default encode(gen_random_bytes(8), 'hex'),
  created_at    timestamptz default now(),
  completed_at  timestamptz
);

alter table public.runs enable row level security;
create policy "users read own runs"   on public.runs for select using (auth.uid() = user_id);
create policy "users insert own runs" on public.runs for insert with check (auth.uid() = user_id);
create policy "users update own runs" on public.runs for update using (auth.uid() = user_id);
create policy "public read by share"  on public.runs for select using (share_id is not null);

-- Usage: monthly run counter per user
create table public.usage (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  year_month text not null,
  run_count  integer default 0,
  unique(user_id, year_month)
);

alter table public.usage enable row level security;
create policy "users read own usage" on public.usage for select using (auth.uid() = user_id);

-- Subscriptions: tier per user (free | pro | team | enterprise)
create table public.subscriptions (
  user_id    uuid references auth.users(id) on delete cascade primary key,
  tier       text default 'free' check (tier in ('free','pro','team','enterprise')),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;
create policy "users read own sub" on public.subscriptions for select using (auth.uid() = user_id);

-- Atomic usage increment — called from edge function
create or replace function increment_usage(p_user_id uuid, p_year_month text)
returns void language plpgsql security definer as $$
begin
  insert into public.usage (user_id, year_month, run_count)
  values (p_user_id, p_year_month, 1)
  on conflict (user_id, year_month)
  do update set run_count = usage.run_count + 1;
end;
$$;
