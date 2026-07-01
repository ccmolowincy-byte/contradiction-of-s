-- ═══════════════════════════════════════════════════════════════════════════
-- Open Forum / Community Stories schema
-- Project: oexbsffepplhhhzhyxpy (Contradiction of S)
--
-- Run this in the Supabase SQL Editor to enable the anonymous floating forum.
--
-- Architecture:
--   • No authentication: the public `anon` role may read and insert.
--   • sticker_data stores the client-generated paper sticker object (JSONB).
--   • svg_texture stores a transparent, stringified SVG of the text block.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Community stories ───────────────────────────────────────────────────────
create table if not exists public.community_stories (
  id           uuid primary key default gen_random_uuid(),
  content      text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  nickname     text check (nickname is null or char_length(nickname) <= 120),
  sticker_data jsonb,
  svg_texture  text,
  created_at   timestamptz not null default now()
);

comment on table public.community_stories is
  'Anonymous community stories for the floating open forum.';

comment on column public.community_stories.sticker_data is
  'Client-generated paper sticker object (id, prompt, image data URL, created timestamp).';

comment on column public.community_stories.svg_texture is
  'Transparent SVG string of the text block, generated client-side for later shader use.';

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Allow completely anonymous reads and inserts. No login or session is required.
alter table public.community_stories enable row level security;

-- PostgreSQL does not support `CREATE POLICY IF NOT EXISTS`, so drop first.
drop policy if exists community_stories_anon_select on public.community_stories;
drop policy if exists community_stories_anon_insert on public.community_stories;

create policy community_stories_anon_select
  on public.community_stories
  for select
  to anon, authenticated
  using (true);

create policy community_stories_anon_insert
  on public.community_stories
  for insert
  to anon, authenticated
  with check (
    content is not null
    and char_length(content) > 0
  );
