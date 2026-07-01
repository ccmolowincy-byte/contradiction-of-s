-- ═══════════════════════════════════════════════════════════════════════════
-- Character Builder persistence schema
-- Project: oexbsffepplhhhzhyxpy (Contradiction of S)
--
-- Run this in the Supabase SQL Editor to enable cross-device / refresh-safe
-- persistence for anonymous Character Builder users.
--
-- Architecture:
--   • Each visitor gets an unguessable session_id stored in localStorage.
--   • The client sends it as the `x-cos-session` HTTP header.
--   • RLS policies isolate rows so users can only touch their own data.
--   • If these tables do not exist, the app falls back to localStorage only.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Sessions ───────────────────────────────────────────────────────────────
-- One row per anonymous user. `state` is a JSON blob containing the avatar
-- layers, portrait, identity, and name history.
create table if not exists public.character_sessions (
  session_id   text primary key,
  state        jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

comment on table public.character_sessions is
  'Anonymous character builder session state, keyed by client-supplied session_id.';

-- ── Custom designs ─────────────────────────────────────────────────────────
-- Assets drawn by users (face/top/bottom/body). src is a small PNG data URL.
create table if not exists public.character_designs (
  id           text primary key,
  session_id   text not null,
  category     text not null,
  label        text not null,
  src          text not null,
  is_public    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Add public flag if the table was created by an earlier migration.
alter table public.character_designs
  add column if not exists is_public boolean not null default false;

comment on table public.character_designs is
  'User-drawn character builder assets, isolated per anonymous session.';

-- ── Indexes ────────────────────────────────────────────────────────────────
create index if not exists idx_character_sessions_session_id
  on public.character_sessions(session_id);

create index if not exists idx_character_designs_session_id
  on public.character_designs(session_id);

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.character_sessions enable row level security;
alter table public.character_designs enable row level security;

-- Helper expression used by both policies: the session id supplied by the client.
-- PostgREST exposes incoming HTTP headers as `request.header.<lowercase-name>`.
-- If the header is missing the expression evaluates to '', so the match fails.

-- Sessions: users can only see/update/delete their own row.
create policy if not exists character_sessions_isolation
  on public.character_sessions
  for all
  using (
    coalesce(current_setting('request.header.x-cos-session', true), '') = session_id
  )
  with check (
    coalesce(current_setting('request.header.x-cos-session', true), '') = session_id
  );

-- Drop the older all-or-nothing isolation policy if it exists from a previous run.
drop policy if exists character_designs_isolation on public.character_designs;

-- SELECT: owners can always read their own designs; anyone can read public designs.
create policy if not exists character_designs_select
  on public.character_designs
  for select
  using (
    coalesce(current_setting('request.header.x-cos-session', true), '') = session_id
    or is_public = true
  );

-- INSERT/UPDATE/DELETE: only the owning session can mutate a design.
create policy if not exists character_designs_write
  on public.character_designs
  for all
  using (
    coalesce(current_setting('request.header.x-cos-session', true), '') = session_id
  )
  with check (
    coalesce(current_setting('request.header.x-cos-session', true), '') = session_id
  );
