# Contradiction of S — Production Architecture Overhaul

**Status:** Proposal (no DB or code changes applied yet)
**Date:** 2026-06-27
**Goal:** Make both builds (`web/`, `contradiction-of-s-ar/`) production-ready and safe for a **public, unattended exhibition**, where strangers can contribute to a shared archive.
**Decision on lockdown:** **Full — edge-function-only writes.** `anon` loses all write access; the browser never decides what enters the archive.

---

## 1. Ground truth (verified against the live Supabase project)

Inspected directly via MCP, not inferred from code:

- **One table, `public.pain_traces`** (33 rows). Columns: `id uuid`, `strokes jsonb`, `prompt text`, `visual_params jsonb default '{}'`, `created_at timestamptz`, `skeletons jsonb`.
- **All 33 rows originate from `gesture.js`** (every row has `skeletons`). **Zero rows from `draw.html`.**
- **The forum does not exist.** `contradiction-of-s-ar/forum.html` reads/writes `sessions`, `posts`, `replies`, `hearts`, `posts_with_details`. None of these tables/views exist in the database. `forum-schema.sql` was authored but **never applied**. The entire community feature is dead.
- **RLS is enabled but effectively open:**
  - `anon insert` — `INSERT` with `WITH CHECK (true)`
  - `anon select` — `SELECT` with `USING (true)`
  - No UPDATE/DELETE policy (rows can't be mutated/deleted — the one safe part).
  - Supabase's own security linter flags `rls_policy_always_true` on the insert policy.
- **The publishable key is copy-pasted into 6+ files:** `web/js/gesture.js`, `web/js/draw.js`, `web/ar.html`, `web/projection.html`, `web/trace-export.html`, `contradiction-of-s-ar/forum.html`.

### 1a. The drawing path has never worked
`draw.js` inserts `{ strokes, prompt, palette_colour, stroke_count }`. `palette_colour` and `stroke_count` **are not columns** on `pain_traces`, so PostgREST rejects every insert (PGRST204). `draw.js` then calls `done()` regardless, showing *"Contributed to the archive."* The drawing capture path has **never once persisted a trace** and reports false success to every user. (The audit's **C6** understates this — it is a dead feature presented as working, not merely a save-reporting edge case.)

---

## 2. Root causes (why patching C1–C10 isn't enough)

The bug audit is an excellent **bug list** but a **patch list**, not an architecture. The data/security defects share three roots:

1. **No client↔DB contract.** Two capture paths invent two incompatible payload shapes; the DB silently arbitrates by erroring. No canonical schema is agreed anywhere.
2. **No trust boundary.** The browser *is* the backend: it holds the key, builds the payload, and writes straight to the table. Validation, size caps, rate-limiting, and moderation have nowhere to live.
3. **Config sprawl.** URL + key duplicated across 6 files; rotation means 6 edits and one missed file breaks a page.

**Principle of the overhaul: the browser captures and renders; it never decides what enters the archive.**

---

## 3. Target architecture

```
┌─────────────┐     POST (JSON)      ┌──────────────────────┐   service_role   ┌────────────┐
│  Browser    │ ───────────────────► │  Supabase Edge Funcs │ ───────────────► │ Postgres   │
│ (capture +  │                      │  validate · cap ·    │                  │  + RLS     │
│  render)    │ ◄─── realtime/read ──│  rate-limit · insert │                  │  + CHECKs  │
└─────────────┘    (anon, views)     └──────────────────────┘                  └────────────┘
```

- **Writes:** browser → Edge Function (service_role) → table. `anon` cannot write.
- **Reads:** browser → curated public **views** via `anon` SELECT, plus realtime INSERT subscriptions (read-only realtime stays).

---

## 4. Schema & data contract (one migration)

Canonical, both capture paths conform:

```
pain_traces (extended)
  id            uuid pk default gen_random_uuid()
  kind          text not null check (kind in ('gesture','drawing'))
  strokes       jsonb not null
  skeletons     jsonb                       -- gesture only
  prompt        text
  palette_colour text                        -- finally a real column
  visual_params jsonb not null default '{}'
  client_id     uuid                         -- idempotency / rate-limit key
  status        text not null default 'visible' check (status in ('visible','hidden'))
  flag_count    int  not null default 0
  created_at    timestamptz not null default now()
```

**DB-level invariants (defense in depth, independent of function correctness):**
- `check (pg_column_size(strokes) <= 65536)`
- `check (jsonb_array_length(strokes) <= 500)` (tune to real data; current max strokes ≈ 3.5 KB)
- `check (skeletons is null or jsonb_typeof(skeletons) = 'array')`

**Public read view:**
```sql
create view pain_traces_public as
  select id, kind, strokes, skeletons, prompt, palette_colour, visual_params, created_at
  from pain_traces where status = 'visible';
```
Clients (`ar.html`, `projection.html`, `trace-export.html`, `archive-cloud.js`) read this view, not the base table. No client/IP metadata exposed; hidden rows never reach the kiosk.

**Forum:** apply `forum-schema.sql` for real, plus `status`/`flag_count` columns and the lockdown below.

---

## 5. Edge Functions (the trust boundary)

The **only** writers to the database.

| Function | Validates / enforces |
|----------|----------------------|
| `submit-trace` | `kind` ∈ {gesture,drawing}; stroke array length & byte caps; reject NaN/Inf coords; strip unknown fields; per-`client_id`/IP rate limit; insert via service_role; return row |
| `submit-post` | session exists; content length; tag whitelist; rate limit |
| `submit-reply` | post exists; content length; rate limit |
| `toggle-heart` | one heart per (post, session); idempotent |
| `report-content` | increment `flag_count`; auto-set `status='hidden'` past threshold |

Client change: `db.from('pain_traces').insert(...)` → `fetch(FUNCTIONS_URL + '/submit-trace', { method:'POST', body: JSON.stringify(payload) })`. Success UI fires **only on 2xx** — which makes the C6 false-success bug structurally impossible for both capture paths.

---

## 6. RLS lockdown (full)

- `pain_traces`, `sessions`, `posts`, `replies`, `hearts`: **revoke all `anon` INSERT/UPDATE/DELETE.**
- `anon` keeps **SELECT only on the public views** (`pain_traces_public`, `posts_with_details`).
- Service_role (Edge Functions) bypasses RLS for writes.
- Realtime read subscriptions (garden, projection, forum live) unaffected.

Result: possession of the publishable key grants read-only access to curated, moderated data — not write access to the archive.

---

## 7. Config centralization

Single `web/js/config.js` (and a shared copy for the AR build):
```js
window.COS_CONFIG = {
  SUPABASE_URL:  'https://oexbsffepplhhhzhyxpy.supabase.co',
  ANON_KEY:      '…',            // read-only after lockdown
  FUNCTIONS_URL: 'https://oexbsffepplhhhzhyxpy.functions.supabase.co',
};
```
Delete the 6 inline copies. Rotation = 1 edit.

---

## 8. Robustness featureset (real behavior, no boilerplate)

- **Offline-safe submit queue:** failed `submit-trace` POSTs persist to IndexedDB and retry on reconnect, keyed by `client_id` (idempotency) so flaky exhibition wifi never loses or double-inserts a contribution.
- **Honest state machine:** capture UI has explicit `saving → saved | error(retry)` states driven by the function response.
- **Kiosk moderation:** flag-based auto-hide, plus a one-line admin SQL snippet to hide a row instantly mid-exhibition.

---

## 9. Relationship to the bug audit

| Audit item | Disposition under overhaul |
|------------|----------------------------|
| C6 (draw false success) | **Subsumed** — fixed structurally by edge-function 2xx gating |
| C8 (unvalidated client writes) | **Subsumed** — replaced by RLS lockdown + functions |
| m11/m12 (colour map / schema drift) | **Subsumed** — one canonical schema |
| Forum tables missing (*audit gap*) | **New** — apply schema + lockdown |
| C1 smart quotes, C2 landscape nav, C4 avatar assets, C5 name helpers, M1 swipe-lock, M3/M9 teardown/leaks, M4 pinch, M5 camera, M12 sticker eraser, a11y | **Unchanged** — still required client-side fixes, done as a separate pass |
| C3 `targets.mind`, C10 `aframe-extras` | **Unchanged** — standalone AR, still required |

---

## 10. Sequencing

1. **Phase 1 — Backend overhaul:** schema migration + CHECK constraints + public views + Edge Functions + RLS lockdown + `config.js`; rewire `gesture.js`/`draw.js` to `submit-trace`. Unblocks honest saves, a working drawing path, a real forum, and a spam-proof archive.
2. **Phase 2 — Critical client bugs:** C1→C5 (smart quotes, landscape nav, avatar assets, name helpers, camera fallback).
3. **Phase 3 — Polish:** leaks/teardown (M3/M9), swipe-lock (M1), pinch (M4), sticker eraser (M12), a11y, AR `targets.mind` + `aframe-extras`.

---

## 11. Open questions before Phase 1

- Confirm real stroke/skeleton size limits from production data before setting CHECK caps.
- Decide rate-limit thresholds (per-minute submissions per client/IP) appropriate to expected exhibition footfall.
- Decide whether `draw.html` and the forum are both in scope for opening night, or whether either can ship in Phase 2.
