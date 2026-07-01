/* ── Character Builder remote persistence layer ───────────────────────────────
 *
 *  • Creates/maintains an anonymous session id in localStorage.
 *  • Loads remote avatar state + custom designs from Supabase on boot.
 *  • Debounce-syncs localStorage writes back to Supabase.
 *  • Falls back silently to localStorage if Supabase is unavailable.
 *
 *  Tables expected (see web/character-schema.sql):
 *    public.character_sessions (session_id, state, updated_at)
 *    public.character_designs  (id, session_id, category, label, src, created_at)
 * ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const SUPA_URL = 'https://oexbsffepplhhhzhyxpy.supabase.co';
  const SUPA_KEY = 'sb_publishable_GgYdLTverVrWPYq93O6pmA_NJ4olWQ5';

  const SESSION_KEY         = 'cos_session_id';
  const STATE_UPDATED_KEY   = 'cos_character_state_updated';
  const CUSTOM_ASSETS_KEY   = 'cos_character_custom_assets';
  const REMOTE_DISABLED_KEY = 'cos_character_remote_disabled';
  const STATE_SYNC_MS       = 1500;
  const CUSTOM_SYNC_MS      = 1500;
  const REMOTE_ENABLED      = false;

  /* ── Session id (anonymous, unguessable, per-browser) ───────────────────── */
  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'anon-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function getSessionId() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  const sessionId = getSessionId();
  let db = null;
  let syncTimer = null;
  let customTimer = null;
  let readyResolve = null;

  function disableRemote(reason) {
    db = null;
    try { localStorage.setItem(REMOTE_DISABLED_KEY, reason || 'unavailable'); } catch (_) {}
    App.store = { mode: 'local', sessionId, sync: () => {}, syncCustomAssets: () => {} };
  }

  function isMissingSchema(error) {
    return !!error && (error.code === 'PGRST205' || /character_(sessions|designs)/.test(error.message || ''));
  }

  /* If the Supabase library never loaded, stay local-only and leave the
   * default App.storeReady promise already resolved. */
  if (!REMOTE_ENABLED || localStorage.getItem(REMOTE_DISABLED_KEY) || typeof supabase === 'undefined' || !supabase.createClient) {
    App.store = { mode: 'local', sessionId, sync: () => {}, syncCustomAssets: () => {} };
    return;
  }

  try {
    db = supabase.createClient(SUPA_URL, SUPA_KEY, {
      global: { headers: { 'x-cos-session': sessionId } }
    });
  } catch (err) {
    console.warn('[character-store] Supabase init failed:', err);
    App.store = { mode: 'local', sessionId, sync: () => {}, syncCustomAssets: () => {} };
    return;
  }

  /* Replace the no-op ready promise with a real one. */
  App.storeReady = new Promise(function (resolve) { readyResolve = resolve; });

  /* ── Utilities ──────────────────────────────────────────────────────────── */
  function isoNow() { return new Date().toISOString(); }

  function localStateUpdatedAt() {
    return localStorage.getItem(STATE_UPDATED_KEY) || '1970-01-01T00:00:00.000Z';
  }

  function setLocalStateUpdated(at) {
    localStorage.setItem(STATE_UPDATED_KEY, at || isoNow());
  }

  function parseLocal(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || 'null');
      return v !== null ? v : fallback;
    } catch { return fallback; }
  }

  /* ── Load remote state (only if newer than local) ───────────────────────── */
  async function loadRemoteState() {
    try {
      const { data, error } = await db
        .from('character_sessions')
        .select('state, updated_at')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        /* PGRST116 == no rows, which just means this is a new session. */
        if (isMissingSchema(error)) { disableRemote('missing-schema'); return; }
        if (error.code !== 'PGRST116') {
          console.warn('[character-store] loadRemoteState:', error);
        }
        return;
      }
      if (!data || !data.state) return;

      const remoteUpdated = data.updated_at;
      if (remoteUpdated && remoteUpdated <= localStateUpdatedAt()) return;

      const s = data.state;
      if (s.avatarState)           localStorage.setItem('avatarState', JSON.stringify(s.avatarState));
      if (s.avatarPortrait)        localStorage.setItem('avatarPortrait', s.avatarPortrait);
      if (s.avatarPortraitTransparent) localStorage.setItem('avatarPortraitTransparent', s.avatarPortraitTransparent);
      if (s.avatarIdentity)        localStorage.setItem('avatarIdentity', JSON.stringify(s.avatarIdentity));
      if (Array.isArray(s.nameHistory)) localStorage.setItem('nameHistory', JSON.stringify(s.nameHistory));
      if (remoteUpdated) setLocalStateUpdated(remoteUpdated);
    } catch (err) {
      console.warn('[character-store] loadRemoteState failed:', err);
    }
  }

  /* ── Load remote custom designs and merge with local (local additions kept) ─ */
  async function loadRemoteDesigns() {
    try {
      const { data, error } = await db
        .from('character_designs')
        .select('*')
        .or('session_id.eq.' + sessionId + ',is_public.eq.true')
        .order('created_at', { ascending: true });

      if (error) {
        if (isMissingSchema(error)) { disableRemote('missing-schema'); return; }
        console.warn('[character-store] loadRemoteDesigns:', error);
        return;
      }

      const existing = parseLocal(CUSTOM_ASSETS_KEY, {});

      (data || []).forEach(function (row) {
        if (!existing[row.category]) existing[row.category] = [];
        const list = existing[row.category];
        const idx = list.findIndex(function (a) { return a.id === row.id; });
        const isOwner = row.session_id === sessionId;
        const asset = {
          id: row.id,
          label: row.label,
          src: row.src,
          thumb: row.src,
          created: row.created_at,
          isCustom: true,
          raw: false,
          isPublic: !!row.is_public,
          isShared: !isOwner && row.is_public,
        };
        if (idx >= 0) list[idx] = asset;
        else list.push(asset);
      });

      localStorage.setItem(CUSTOM_ASSETS_KEY, JSON.stringify(existing));
    } catch (err) {
      console.warn('[character-store] loadRemoteDesigns failed:', err);
    }
  }

  /* ── Sync state to Supabase ─────────────────────────────────────────────── */
  async function syncState() {
    if (!db) return;
    try {
      const state = {
        avatarState: App.getAvatarState(),
        avatarPortrait: App.getAvatarPortrait(),
        avatarPortraitTransparent: App.getAvatarPortraitTransparent(),
        avatarIdentity: App.getAvatarIdentity(),
        nameHistory: App.getNameHistory(),
      };
      const now = isoNow();
      const { error } = await db
        .from('character_sessions')
        .upsert(
          { session_id: sessionId, state: state, updated_at: now },
          { onConflict: 'session_id' }
        );
      if (error) {
        if (isMissingSchema(error)) { disableRemote('missing-schema'); return; }
        console.warn('[character-store] syncState error:', error);
      } else {
        setLocalStateUpdated(now);
      }
    } catch (err) {
      console.warn('[character-store] syncState failed:', err);
    }
  }

  /* ── Sync custom designs to Supabase (replace remote with current local set) ─ */
  async function syncCustomAssets() {
    if (!db) return;
    try {
      const all = App.getCustomAssets();
      const rows = [];
      Object.keys(all).forEach(function (cat) {
        (all[cat] || []).forEach(function (a) {
          /* Skip designs belonging to other users; they are read-only locally. */
          if (a.isShared) return;
          rows.push({
            id: a.id,
            session_id: sessionId,
            category: cat,
            label: a.label || a.id,
            src: a.src,
            is_public: !!a.isPublic,
            created_at: a.created || isoNow(),
          });
        });
      });

      /* Remove remote rows that are no longer present locally. */
      const { data: remoteRows, error: fetchErr } = await db
        .from('character_designs')
        .select('id')
        .eq('session_id', sessionId);
      if (fetchErr) {
        if (isMissingSchema(fetchErr)) { disableRemote('missing-schema'); return; }
        throw fetchErr;
      }

      const localIds = new Set(rows.map(function (r) { return r.id; }));
      const toDelete = (remoteRows || [])
        .filter(function (r) { return !localIds.has(r.id); })
        .map(function (r) { return r.id; });

      if (toDelete.length) {
        const { error: delErr } = await db.from('character_designs').delete().in('id', toDelete);
        if (delErr) console.warn('[character-store] delete designs error:', delErr);
      }

      if (rows.length) {
        const { error } = await db.from('character_designs').upsert(rows, { onConflict: 'id' });
        if (error) console.warn('[character-store] upsert designs error:', error);
      }
    } catch (err) {
      console.warn('[character-store] syncCustomAssets failed:', err);
    }
  }

  /* ── Debounced public triggers ──────────────────────────────────────────── */
  function scheduleStateSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncState, STATE_SYNC_MS);
  }

  function scheduleCustomSync() {
    clearTimeout(customTimer);
    customTimer = setTimeout(syncCustomAssets, CUSTOM_SYNC_MS);
  }

  /* ── Patch App helpers so local writes also schedule a remote sync ──────── */
  function patch(name, after) {
    if (typeof App[name] !== 'function') return;
    const orig = App[name];
    App[name] = function () {
      const result = orig.apply(this, arguments);
      after();
      return result;
    };
  }

  patch('saveAvatarState', scheduleStateSync);
  patch('saveAvatarPortrait', scheduleStateSync);
  patch('saveAvatarPortraitTransparent', scheduleStateSync);
  patch('saveAvatarIdentity', scheduleStateSync);
  patch('addNameToHistory', scheduleStateSync);
  patch('toggleNameSaved', scheduleStateSync);
  patch('saveCustomAsset', scheduleCustomSync);
  patch('deleteCustomAsset', scheduleCustomSync);

  App.store = {
    mode: 'supabase',
    sessionId: sessionId,
    db: db,
    sync: scheduleStateSync,
    syncCustomAssets: scheduleCustomSync,
  };

  /* Flush pending syncs when the page is hidden/closed. */
  window.addEventListener('beforeunload', function () {
    clearTimeout(syncTimer);
    clearTimeout(customTimer);
    syncState();
    syncCustomAssets();
  });

  /* ── Bootstrap ──────────────────────────────────────────────────────────── */
  (async function bootstrap() {
    await Promise.all([loadRemoteState(), loadRemoteDesigns()]);
    readyResolve();
  })();
})();
