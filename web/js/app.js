/* ── Shared utilities and localStorage helpers ── */

const App = (() => {

  /* ── Profile ── */
  function getProfile() {
    try { return JSON.parse(localStorage.getItem('profile') || '{}'); } catch { return {}; }
  }
  function saveProfile(data) { localStorage.setItem('profile', JSON.stringify(data)); }

  /* ── Avatar state ── */
  function getAvatarState() {
    try { return JSON.parse(localStorage.getItem('avatarState') || 'null'); } catch { return null; }
  }
  function saveAvatarState(state) { localStorage.setItem('avatarState', JSON.stringify(state)); }

  /* ── Avatar portrait (flattened composite image) ── */
  function getAvatarPortrait() {
    return localStorage.getItem('avatarPortrait') || null;
  }
  function saveAvatarPortrait(dataURL) {
    localStorage.setItem('avatarPortrait', dataURL);
  }

  /* ── Avatar portrait — transparent PNG for AR overlay ── */
  function getAvatarPortraitTransparent() {
    return localStorage.getItem('avatarPortraitTransparent') || null;
  }
  function saveAvatarPortraitTransparent(dataURL) {
    localStorage.setItem('avatarPortraitTransparent', dataURL);
  }

  /* ── Avatar identity (Colour of Condition + Shape of Condition) ── */
  function getAvatarIdentity() {
    try { return JSON.parse(localStorage.getItem('avatarIdentity') || 'null'); } catch { return null; }
  }
  function saveAvatarIdentity(colour, shape) {
    localStorage.setItem('avatarIdentity', JSON.stringify({ colour, shape }));
  }

  /* ── Archive ── */
  function getArchive() {
    try { return JSON.parse(localStorage.getItem('archive') || '[]'); } catch { return []; }
  }
  function addArchiveEntry(entry) {
    const a = getArchive();
    a.push(entry);
    localStorage.setItem('archive', JSON.stringify(a));
    return a;
  }

  /* ── Nav highlighting ── */
  function highlightNav() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-dot, .nav-item').forEach(el => {
      const href = el.getAttribute('href') || '';
      const file = href.split('/').pop() || 'index.html';
      el.classList.toggle('active', file === page || (page === '' && file === 'index.html'));
    });
  }

  /* ── Format timestamp ── */
  function fmtTime(ts) {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  /* ── Colour library — 52 entries from Colour Library.txt.docx ─────────────
   * Rule: only individual entries; no headings, categories, or metadata.
   * ──────────────────────────────────────────────────────────────────────── */
  const COLOURS = ['Red'];

  /* ── Shape library — 49 entries from Shape Library.txt.docx ──────────────
   * Same rule: only individual entries.
   * ──────────────────────────────────────────────────────────────────────── */
  const SHAPES = [
    'Circle',   'Oval',     'Triangle', 'Square',   'Rectangle',
    'Prism',    'Cube',     'Sphere',   'Pyramid',  'Diamond',
    'Arc',      'Curve',    'Spiral',   'Loop',     'Zigzag',
    'Wave',     'Coil',     'Bend',     'Fold',     'Twist',
    'Shard',    'Fragment', 'Crack',    'Split',    'Fracture', 'Tear',
    'Root',     'Branch',   'Vine',     'Thorn',    'Bloom',
    'Shell',    'Feather',  'Petal',
    'Orbit',    'Ring',     'Crescent', 'Star',     'Horizon',  'Thread',
    'Polygon',  'Cone',     'Cylinder', 'Helix',
    'Cross',    'Grid',     'Lattice',  'Tunnel',   'Portal',
  ];

  /* ── Colour themes — maps each colour name to [--burgundy, --red] ─────────
   * --burgundy = primary accent used for buttons, borders, highlights
   * --red      = secondary accent (slightly lighter variant)
   * ──────────────────────────────────────────────────────────────────────── */
  const COLOUR_THEMES = {
    Red:        ['#B31A1A', '#D63A3A'],
    Burgundy:   ['#5C1A1A', '#8B2525'],
    Crimson:    ['#8B1515', '#B02020'],
    Scarlet:    ['#A01010', '#C02020'],
    Garnet:     ['#6B1C2E', '#9B253E'],
    Carmine:    ['#7D0A2A', '#A01540'],
    Rust:       ['#8B4513', '#A5551F'],
    Brick:      ['#8B3A32', '#A54848'],
    Cherry:     ['#8B1A42', '#B02258'],
    Wine:       ['#722F37', '#9B3F49'],
    Blood:      ['#6B0000', '#9B1010'],
    Ivory:      ['#8A7050', '#A08868'],
    Pearl:      ['#9A8070', '#B09882'],
    Bone:       ['#9A8060', '#B09878'],
    Chalk:      ['#8A7870', '#A09085'],
    Frost:      ['#5A80A0', '#6A98B8'],
    Linen:      ['#8A7050', '#A08868'],
    Marble:     ['#7888A0', '#88A0B8'],
    Porcelain:  ['#7888A0', '#88A0B8'],
    Ash:        ['#6B6B6B', '#888888'],
    Smoke:      ['#787878', '#929292'],
    Mist:       ['#7A9098', '#8AAAB2'],
    Dust:       ['#8A7870', '#A09085'],
    Slate:      ['#5A6A7A', '#6A7A8A'],
    Steel:      ['#526070', '#627282'],
    Stone:      ['#6A6860', '#807E78'],
    Cloud:      ['#7888A0', '#88A0B8'],
    Fog:        ['#7A9098', '#8AAAB2'],
    Coal:       ['#2C2C2C', '#484848'],
    Charcoal:   ['#383838', '#525252'],
    Ink:        ['#1C1C30', '#303050'],
    Shadow:     ['#3A3040', '#504060'],
    Obsidian:   ['#1A1A24', '#303040'],
    Night:      ['#1A1A30', '#2E2E50'],
    Void:       ['#101018', '#282830'],
    Soot:       ['#2C2820', '#48403A'],
    Moss:       ['#4A6A3A', '#608050'],
    Sage:       ['#607A58', '#789068'],
    Jade:       ['#3A7A5A', '#4A9070'],
    Amber:      ['#9A6A1A', '#B88025'],
    Ochre:      ['#8A6A18', '#A88025'],
    Copper:     ['#9A5A30', '#B87045'],
    Bronze:     ['#8A5A28', '#A87038'],
    Indigo:     ['#3A3A8A', '#5050A8'],
    Cobalt:     ['#2A4A9A', '#4060B0'],
    Azure:      ['#3A6A9A', '#4A80B5'],
    Navy:       ['#1A2A6A', '#2A3A80'],
    Forest:     ['#2A5A3A', '#3A7050'],
    Willow:     ['#5A7A40', '#709060'],
    Clay:       ['#8A5840', '#A07058'],
    Sand:       ['#A88A60', '#C0A078'],
    Silver:     ['#707888', '#8890A0'],
    Raven:      ['#2A2830', '#403E48'],
  };

  /* ── Body types ───────────────────────────────────────────────────────────
   * Only the "flat" style is fully asset-backed in this build; circular/oval
   * are kept as placeholders so saved states from older versions degrade
   * gracefully to the supported type. */
  const BODY_TYPES = [
    { id: 'flat',     label: 'Flat',     subtitle: 'Asymmetric · short', available: true  },
    { id: 'circular', label: 'Circular', subtitle: 'Symmetric · long',   available: false },
    { id: 'oval',     label: 'Oval',     subtitle: 'Symmetric · long',   available: false },
  ];

  /* ── Assets manifest ─────────────────────────────────────────────────────
   * Source files live in Character builder assets/ and are copied into
   * web/assets/character/ at build time. All PNGs have real alpha.
   *
   * TO ADD A NEW CUTOUT (Wincy): drop `<name>.png` + `<name>-thumb.png` into
   * web/assets/character/, then add one line to the matching category array
   * below — e.g. tops:
   *   { id: 'top-vest-1', label: 'Vest', src: CHAR_ROOT + 'top-vest-1.png',
   *     thumb: CHAR_ROOT + 'top-vest-1-thumb.png', raw: false },
   * The tray, layer system and pool handoff pick it up automatically.
   *
   * BLANK "DRAW-ON" CUTOUTS: add a near-empty paper silhouette the same way
   * (e.g. id 'body-blank', 'top-blank'); the visitor selects it, then uses the
   * Draw tool to mark their own. Use raw:false for clean PNGs (raw:true only
   * for pencil-on-paper scans that should multiply-blend onto the figure).
   * ──────────────────────────────────────────────────────────────────────── */

  const CHAR_ROOT = 'assets/character/';

  const ASSETS_BY_TYPE = {
    flat: {
      body: [
        { id: 'body-skeleton', label: 'Skeleton', src: CHAR_ROOT + 'body-skeleton.png', thumb: CHAR_ROOT + 'body-skeleton-thumb.png', raw: false },
      ],
      face: [
        { id: 'face-1', label: 'Face 1', src: CHAR_ROOT + 'face-1.png', thumb: CHAR_ROOT + 'face-1-thumb.png', raw: false },
        { id: 'face-2', label: 'Face 2', src: CHAR_ROOT + 'face-2.png', thumb: CHAR_ROOT + 'face-2-thumb.png', raw: false },
      ],
      'hair-top': [
        { id: 'hair-1', label: 'Hair 1', src: CHAR_ROOT + 'hair-1.png', thumb: CHAR_ROOT + 'hair-1-thumb.png', raw: false },
      ],
      'hair-bottom': [],
      tops: [
        { id: 'top-tshirt-1', label: 'T-shirt 1', src: CHAR_ROOT + 'top-tshirt-1.png', thumb: CHAR_ROOT + 'top-tshirt-1-thumb.png', raw: false },
        { id: 'top-tshirt-2', label: 'T-shirt 2', src: CHAR_ROOT + 'top-tshirt-2.png', thumb: CHAR_ROOT + 'top-tshirt-2-thumb.png', raw: false },
        { id: 'top-tank-1',   label: 'Tank top',  src: CHAR_ROOT + 'top-tank-1.png',   thumb: CHAR_ROOT + 'top-tank-1-thumb.png',   raw: false },
        { id: 'top-dress-1',  label: 'Dress',     src: CHAR_ROOT + 'top-dress-1.png',  thumb: CHAR_ROOT + 'top-dress-1-thumb.png',  raw: false },
      ],
      bottoms: [
        { id: 'bottom-skirt-1', label: 'Skirt 1', src: CHAR_ROOT + 'bottom-skirt-1.png', thumb: CHAR_ROOT + 'bottom-skirt-1-thumb.png', raw: false },
        { id: 'bottom-skirt-2', label: 'Skirt 2', src: CHAR_ROOT + 'bottom-skirt-2.png', thumb: CHAR_ROOT + 'bottom-skirt-2-thumb.png', raw: false },
        { id: 'bottom-skirt-3', label: 'Skirt 3', src: CHAR_ROOT + 'bottom-skirt-3.png', thumb: CHAR_ROOT + 'bottom-skirt-3-thumb.png', raw: false },
        { id: 'bottom-pants-1', label: 'Pants',   src: CHAR_ROOT + 'bottom-pants-1.png', thumb: CHAR_ROOT + 'bottom-pants-1-thumb.png', raw: false },
      ],
    },

    circular: {
      /* No circular-specific assets yet — falls back to flat in the builder. */
      body: [], face: [], 'hair-top': [], 'hair-bottom': [], tops: [], bottoms: []
    },

    oval: {
      body: [], face: [], 'hair-top': [], 'hair-bottom': [], tops: [], bottoms: []
    },
  };

  /* Convenience alias */
  const ASSETS = ASSETS_BY_TYPE.flat;

  /* ── Custom drawn assets ──────────────────────────────────────────────────
   * Users can draw their own body/face/top/bottom in the Character Builder.
   * Stored by category as { id, label, src, thumb, created }.
   * ──────────────────────────────────────────────────────────────────────── */
  const CUSTOM_ASSETS_KEY = 'cos_character_custom_assets';

  function getCustomAssets() {
    try {
      const v = JSON.parse(localStorage.getItem(CUSTOM_ASSETS_KEY) || '{}');
      return typeof v === 'object' && v !== null ? v : {};
    } catch { return {}; }
  }

  function getCustomAssetsByCat(cat) {
    const all = getCustomAssets();
    return Array.isArray(all[cat]) ? all[cat] : [];
  }

  function saveCustomAsset(cat, asset) {
    const all = getCustomAssets();
    if (!Array.isArray(all[cat])) all[cat] = [];
    all[cat].push(asset);
    localStorage.setItem(CUSTOM_ASSETS_KEY, JSON.stringify(all));
  }

  function deleteCustomAsset(cat, id) {
    const all = getCustomAssets();
    if (!Array.isArray(all[cat])) return;
    all[cat] = all[cat].filter(a => a.id !== id);
    localStorage.setItem(CUSTOM_ASSETS_KEY, JSON.stringify(all));
  }

  /* Return default + custom assets for a given body type and category. */
  function getAssetsFor(bodyType, cat) {
    const defaults = (ASSETS_BY_TYPE[bodyType] || ASSETS_BY_TYPE.flat)[cat] || [];
    const customs = getCustomAssetsByCat(cat).map(a => ({ ...a, isCustom: true }));
    return defaults.concat(customs);
  }

  /* ── Name history (poetic names generator) ──
     Stored as an array of { text, saved }, most-recent-first.
     name.js relies on getNameHistory / addNameToHistory / toggleNameSaved. */
  const NAME_HISTORY_KEY = 'nameHistory';
  const NAME_HISTORY_MAX = 50;

  function getNameHistory() {
    try {
      const v = JSON.parse(localStorage.getItem(NAME_HISTORY_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch { return []; }
  }
  function saveNameHistory(list) {
    localStorage.setItem(NAME_HISTORY_KEY, JSON.stringify(list.slice(0, NAME_HISTORY_MAX)));
  }
  function addNameToHistory(text) {
    if (!text) return;
    const hist = getNameHistory();
    // De-dupe: drop any prior identical entry, then prepend (preserve saved state).
    const prior = hist.find(item => item.text === text);
    const next = hist.filter(item => item.text !== text);
    next.unshift({ text, saved: prior ? !!prior.saved : false });
    saveNameHistory(next);
  }
  function toggleNameSaved(text) {
    const hist = getNameHistory();
    const item = hist.find(i => i.text === text);
    if (item) { item.saved = !item.saved; saveNameHistory(hist); }
  }

  /* ── Remote-sync hooks (populated by character-store.js when present) ── */
  const store = { sync: () => {}, syncCustomAssets: () => {} };

  return {
    getProfile, saveProfile,
    getAvatarState, saveAvatarState,
    getAvatarPortrait, saveAvatarPortrait,
    getAvatarPortraitTransparent, saveAvatarPortraitTransparent,
    getAvatarIdentity, saveAvatarIdentity,
    getArchive, addArchiveEntry,
    getNameHistory, addNameToHistory, toggleNameSaved,
    highlightNav, fmtTime,
    COLOURS, SHAPES, COLOUR_THEMES,
    ASSETS,
    ASSETS_BY_TYPE,
    BODY_TYPES,
    getCustomAssets, getCustomAssetsByCat, saveCustomAsset, deleteCustomAsset, getAssetsFor,
    store,
    storeReady: Promise.resolve(),
  };
})();

document.addEventListener('DOMContentLoaded', () => App.highlightNav());
