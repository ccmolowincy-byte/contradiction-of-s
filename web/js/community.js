/* ── Open forum: floating community stories ─────────────────────────────────
 * Reads and writes anonymous stories to Supabase `public.community_stories`.
 * Each submission carries an optional client-generated paper sticker and a
 * transparent SVG texture of the text block.
 * ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const SUPA_URL = 'https://oexbsffepplhhhzhyxpy.supabase.co';
  const SUPA_KEY = 'sb_publishable_GgYdLTverVrWPYq93O6pmA_NJ4olWQ5';
  const STICKERS_KEY = 'cos_stickers';
  const TEXT_MAX = 2000;
  const SVG_W = 480;
  const SVG_PADDING = 28;
  const SVG_LINE_H = 34;
  const SVG_FONT_SIZE = 22;

  const GROUND_TEXTURES = [
    'swim/textures/ground/ground_alien_pavement.png',
    'swim/textures/ground/ground_alien_pavement_soil.png',
    'swim/textures/ground/ground_forest.png',
    'swim/textures/ground/ground_meadow.png',
    'swim/textures/ground/ground_moondust_beach.png',
    'swim/textures/ground/ground_sakura.png',
    'swim/textures/ground/ground_sanctuary_rock.png',
    'swim/textures/ground/ground_sanctuary_rock_soil.png',
    'swim/textures/ground/ground_sanctuary_rock_soil_granular.png',
    'swim/textures/ground/ground_shore.png',
    'swim/textures/ground/ground_starfall_plain.png',
    'swim/textures/ground/ground_starfall_plain_soil.png',
    'swim/textures/ground/ground_wheat.png'
  ];

  let db = null;
  /** @type {PaperSticker|null} */
  let selectedSticker = null;

  const els = {
    form: document.getElementById('community-form'),
    textarea: document.getElementById('story-text'),
    nickname: document.getElementById('story-nickname'),
    counter: document.getElementById('story-counter'),
    stickerPicker: document.getElementById('sticker-picker'),
    stickerEmpty: document.getElementById('sticker-empty'),
    submitBtn: document.getElementById('story-submit'),
    feed: document.getElementById('community-feed'),
    empty: document.getElementById('community-empty'),
    status: document.getElementById('community-status'),
  };

  /* ── Bootstrap ───────────────────────────────────────────────────────────── */
  function init() {
    if (!els.form || !els.feed) return;

    try {
      if (typeof supabase !== 'undefined' && supabase.createClient) {
        db = supabase.createClient(SUPA_URL, SUPA_KEY);
      }
    } catch (err) {
      console.warn('[community] Supabase init failed:', err);
    }

    renderStickerPicker();
    bindForm();
    fetchStories();
  }

  /* ── Utility: safely load saved paper stickers from localStorage ─────────── */
  function getSavedStickers() {
    try {
      const raw = localStorage.getItem(STICKERS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  /* ── Utility: deterministic visual seed from a string ────────────────────── */
  function hashSeed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function seededChoice(seed, values) {
    return values[seed % values.length];
  }

  /* ── Utility: escape HTML for safe DOM insertion ─────────────────────────── */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── Utility: friendly date ──────────────────────────────────────────────── */
  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  /**
   * @param {StoryEntry} story
   * @param {number} index
   * @returns {HTMLElement}
   */
  function buildCard(story, index) {
    const seed = hashSeed(String(story.id));
    const rotations = [-1.2, -0.6, 0, 0.6, 1.2];
    const margins = ['0 0 18px 0', '0 0 26px 8px', '0 0 14px -4px', '0 0 30px 0', '0 0 20px 6px'];
    const rotation = seededChoice(seed, rotations);
    const margin = seededChoice(seed + 1, margins);

    const card = document.createElement('article');
    card.className = 'float-card';
    card.style.setProperty('--fc-rotate', rotation + 'deg');
    card.style.setProperty('--fc-margin', margin);
    card.style.setProperty('--stagger', String(index >= 0 ? index : 0));

    if (story.sticker_data && story.sticker_data.image) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'float-sticker';
      imgWrap.style.setProperty('--sticker-bg', "url('" + seededChoice(seed + 2, GROUND_TEXTURES) + "')");
      const img = document.createElement('img');
      img.src = story.sticker_data.image;
      img.alt = story.sticker_data.prompt || '';
      img.loading = 'lazy';
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);
    }

    const body = document.createElement('div');
    body.className = 'float-body';

    const text = document.createElement('p');
    text.className = 'float-text';
    text.textContent = story.content;
    body.appendChild(text);

    const meta = document.createElement('div');
    meta.className = 'float-meta';

    const author = document.createElement('span');
    author.className = 'float-author';
    author.textContent = story.nickname ? story.nickname : 'anonymous';
    meta.appendChild(author);

    const date = document.createElement('span');
    date.className = 'float-date';
    date.textContent = fmtDate(story.created_at);
    meta.appendChild(date);

    body.appendChild(meta);
    card.appendChild(body);

    return card;
  }

  /* ── Sticker picker: choose a client-generated sticker to attach ─────────── */
  function renderStickerPicker() {
    const stickers = getSavedStickers();
    if (!els.stickerPicker) return;

    els.stickerPicker.innerHTML = '';

    if (stickers.length === 0) {
      if (els.stickerEmpty) els.stickerEmpty.classList.add('visible');
      return;
    }
    if (els.stickerEmpty) els.stickerEmpty.classList.remove('visible');

    stickers.slice().reverse().forEach(function (s) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sp-thumb';
      btn.setAttribute('aria-label', 'Attach sticker: ' + (s.prompt || 'sticker'));

      const img = document.createElement('img');
      img.src = s.image;
      img.alt = s.prompt || '';
      img.loading = 'lazy';
      btn.appendChild(img);

      btn.addEventListener('click', function () {
        selectedSticker = selectedSticker && selectedSticker.id === s.id ? null : s;
        updatePickerSelection();
      });

      els.stickerPicker.appendChild(btn);
    });
  }

  function updatePickerSelection() {
    if (!els.stickerPicker) return;
    const thumbs = els.stickerPicker.querySelectorAll('.sp-thumb');
    const stickers = getSavedStickers().slice().reverse();
    thumbs.forEach(function (thumb, i) {
      const s = stickers[i];
      thumb.classList.toggle('selected', !!selectedSticker && selectedSticker.id === s.id);
    });
  }

  /* ── SVG text texture generator (transparent background) ───────────────────
   *
   * // floating forum text
   *
   * Wraps the story into a fixed-width SVG with transparent background so it
   * can be used as a shader texture elsewhere in the project later.
   * ──────────────────────────────────────────────────────────────────────── */
  function generateSvgTexture(text, nickname) {
    // floating forum text
    const ctx = document.createElement('canvas').getContext('2d');
    const maxW = SVG_W - (SVG_PADDING * 2);
    const font = SVG_FONT_SIZE + 'px "IM Fell English", Georgia, serif';
    const smallFont = '13px "IM Fell English", Georgia, serif';

    function measure(wrappedText) {
      ctx.font = font;
      let max = 0;
      wrappedText.forEach(function (line) {
        max = Math.max(max, ctx.measureText(line).width);
      });
      return max;
    }

    function wrapWords(words) {
      const lines = [];
      let line = '';
      ctx.font = font;
      words.forEach(function (word) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width <= maxW) {
          line = test;
        } else {
          if (line) lines.push(line);
          line = word;
        }
      });
      if (line) lines.push(line);
      return lines.length ? lines : [''];
    }

    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    const bodyLines = wrapWords(words);
    const bodyWidth = Math.ceil(measure(bodyLines));

    const sigLines = nickname
      ? wrapWords(['— ' + nickname.trim()])
      : [];

    const sigWidth = sigLines.length ? Math.ceil(measure(sigLines)) : 0;
    const contentWidth = Math.max(bodyWidth, sigWidth);
    const width = Math.max(SVG_W, contentWidth + (SVG_PADDING * 2));
    const height = SVG_PADDING * 2 + (bodyLines.length * SVG_LINE_H) + (sigLines.length ? (SVG_LINE_H * 0.8) : 0);

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('xmlns', ns);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.style.fontFamily = '"IM Fell English", Georgia, serif';

    bodyLines.forEach(function (line, i) {
      const tspan = document.createElementNS(ns, 'tspan');
      tspan.setAttribute('x', String(SVG_PADDING));
      tspan.setAttribute('y', String(SVG_PADDING + ((i + 1) * SVG_LINE_H) - 6));
      tspan.setAttribute('fill', '#1C0E0A');
      tspan.setAttribute('font-size', String(SVG_FONT_SIZE));
      tspan.textContent = line;
      const textEl = document.createElementNS(ns, 'text');
      textEl.appendChild(tspan);
      svg.appendChild(textEl);
    });

    sigLines.forEach(function (line, i) {
      const tspan = document.createElementNS(ns, 'tspan');
      tspan.setAttribute('x', String(width - SVG_PADDING));
      tspan.setAttribute('y', String(SVG_PADDING + ((bodyLines.length + i + 1) * SVG_LINE_H) - 6));
      tspan.setAttribute('fill', '#5C1A1A');
      tspan.setAttribute('font-size', '13');
      tspan.setAttribute('font-style', 'italic');
      tspan.setAttribute('text-anchor', 'end');
      tspan.textContent = line;
      const textEl = document.createElementNS(ns, 'text');
      textEl.appendChild(tspan);
      svg.appendChild(textEl);
    });

    return new XMLSerializer().serializeToString(svg);
  }

  /* ── Form handling ───────────────────────────────────────────────────────── */
  function bindForm() {
    if (!els.textarea) return;

    els.textarea.addEventListener('input', function () {
      const len = els.textarea.value.length;
      if (els.counter) els.counter.textContent = len + ' / ' + TEXT_MAX;
      if (len > TEXT_MAX) {
        els.textarea.value = els.textarea.value.slice(0, TEXT_MAX);
        if (els.counter) els.counter.textContent = TEXT_MAX + ' / ' + TEXT_MAX;
      }
    });

    els.form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitStory();
    });
  }

  function setSubmitting(isSubmitting) {
    if (!els.submitBtn) return;
    els.submitBtn.disabled = isSubmitting;
    els.submitBtn.textContent = isSubmitting ? 'Floating…' : 'Float into the forum';
  }

  function showStatus(msg, isError, persist) {
    if (!els.status) return;
    els.status.textContent = msg;
    els.status.className = 'community-status' + (isError ? ' is-error' : ' is-success');
    els.status.classList.add('visible');
    if (!persist) {
      setTimeout(function () { els.status.classList.remove('visible'); }, 6000);
    }
  }

  function supabaseErrorMessage(err) {
    const code = err && err.code;
    const msg = err && err.message;
    if (code === 'PGRST205' || (msg && /could not find the table/i.test(msg))) {
      return 'Forum database is not ready. Run community-schema.sql in Supabase first.';
    }
    if (code === 'PGRST301' || code === '42501') {
      return 'Permission denied. Check the RLS policies in community-schema.sql.';
    }
    if (code === '23514') {
      return 'Story is empty or too long.';
    }
    if (msg) return 'Forum error: ' + msg;
    return 'Could not reach the forum. Please try again.';
  }

  async function submitStory() {
    const content = (els.textarea.value || '').trim();
    if (!content) {
      showStatus('Please write something before floating it.', true);
      return;
    }
    if (content.length > TEXT_MAX) {
      showStatus('Your story is too long.', true);
      return;
    }

    setSubmitting(true);

    const nickname = (els.nickname ? els.nickname.value : '').trim() || null;
    const svgTexture = generateSvgTexture(content, nickname);

    /** @type {StoryEntry} */
    const entry = {
      content: content,
      nickname: nickname,
      sticker_data: selectedSticker || null,
      svg_texture: svgTexture,
    };

    if (db) {
      try {
        const { data, error } = await db
          .from('community_stories')
          .insert(entry)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          prependStory(data, true);
          resetForm();
          showStatus('Your story is floating in the forum.', false);
        }
      } catch (err) {
        console.warn('[community] Submit failed:', err);
        showStatus(supabaseErrorMessage(err), true);
      }
    } else {
      // Fallback if Supabase is unavailable: show locally for this session only.
      const localStory = {
        id: 'local-' + Date.now(),
        content: content,
        nickname: nickname,
        sticker_data: selectedSticker || null,
        svg_texture: svgTexture,
        created_at: new Date().toISOString(),
      };
      prependStory(localStory, true);
      resetForm();
      showStatus('Saved locally — the forum is offline.', true);
    }

    setSubmitting(false);
  }

  function resetForm() {
    if (els.textarea) els.textarea.value = '';
    if (els.nickname) els.nickname.value = '';
    if (els.counter) els.counter.textContent = '0 / ' + TEXT_MAX;
    selectedSticker = null;
    updatePickerSelection();
  }

  /* ── Fetch historical stories ────────────────────────────────────────────── */
  async function fetchStories() {
    if (db) {
      try {
        const { data, error } = await db
          .from('community_stories')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) throw error;
        renderFeed(data || []);
        return;
      } catch (err) {
        console.warn('[community] Fetch failed:', err);
        showStatus(supabaseErrorMessage(err), true, true);
      }
    }
    renderFeed([]);
  }

  function renderFeed(stories) {
    if (!els.feed) return;
    els.feed.innerHTML = '';

    if (!stories.length) {
      if (els.empty) els.empty.classList.add('visible');
      return;
    }
    if (els.empty) els.empty.classList.remove('visible');

    stories.forEach(function (story, i) {
      appendStory(story, i);
    });
  }

  function prependStory(story, animate) {
    if (els.empty) els.empty.classList.remove('visible');
    const card = buildCard(story, animate ? -1 : 0);
    els.feed.insertBefore(card, els.feed.firstChild);
  }

  function appendStory(story, index) {
    const card = buildCard(story, index);
    els.feed.appendChild(card);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
