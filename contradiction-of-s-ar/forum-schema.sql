-- ════════════════════════════════════════════════════════════
-- Forum schema — migrate forum into main project (oexbsffepplhhhzhyxpy)
-- Run in Supabase SQL editor, or via Supabase MCP once connected.
-- ════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Tables ──────────────────────────────────────────────────
create table if not exists public.sessions (
  id           uuid primary key default gen_random_uuid(),
  display_name text not null,
  avatar_base  integer,
  avatar_data  text,
  avatar_color text,
  created_at   timestamptz not null default now()
);

create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  content    text not null,
  tags       text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.hearts (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, session_id)
);

-- ── View: posts joined with author + heart count ────────────
create or replace view public.posts_with_details as
select
  p.id,
  p.session_id,
  p.content,
  p.tags,
  p.created_at,
  s.display_name,
  s.avatar_data,
  s.avatar_color,
  coalesce(h.heart_count, 0) as heart_count
from public.posts p
join public.sessions s on s.id = p.session_id
left join (
  select post_id, count(*)::int as heart_count
  from public.hearts group by post_id
) h on h.post_id = p.id
order by p.created_at desc;

-- ── Row Level Security (anon read + insert; matches old project) ──
alter table public.sessions enable row level security;
alter table public.posts    enable row level security;
alter table public.replies  enable row level security;
alter table public.hearts   enable row level security;

create policy "anon read sessions"   on public.sessions for select using (true);
create policy "anon insert sessions" on public.sessions for insert with check (true);

create policy "anon read posts"   on public.posts for select using (true);
create policy "anon insert posts" on public.posts for insert with check (true);

create policy "anon read replies"   on public.replies for select using (true);
create policy "anon insert replies" on public.replies for insert with check (true);

create policy "anon read hearts"   on public.hearts for select using (true);
create policy "anon insert hearts" on public.hearts for insert with check (true);
create policy "anon delete hearts" on public.hearts for delete using (true);

-- ── Realtime (forum.html subscribes to INSERT on posts) ─────
alter publication supabase_realtime add table public.posts;
