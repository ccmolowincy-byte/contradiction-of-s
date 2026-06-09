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
    document.querySelectorAll('.nav-item').forEach(el => {
      const href = el.getAttribute('href') || '';
      el.classList.toggle('active', href.includes(page));
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
  const COLOURS = [
    'Burgundy', 'Crimson', 'Scarlet', 'Garnet', 'Carmine',
    'Rust',     'Brick',   'Cherry',  'Wine',    'Blood',
    'Ivory',    'Pearl',   'Bone',    'Chalk',   'Frost',
    'Linen',    'Marble',  'Porcelain',
    'Ash',      'Smoke',   'Mist',    'Dust',    'Slate',
    'Steel',    'Stone',   'Cloud',   'Fog',
    'Coal',     'Charcoal','Ink',     'Shadow',  'Obsidian',
    'Night',    'Void',    'Soot',
    'Moss',     'Sage',    'Jade',
    'Amber',    'Ochre',   'Copper',  'Bronze',
    'Indigo',   'Cobalt',  'Azure',   'Navy',
    'Forest',   'Willow',
    'Clay',     'Sand',
    'Silver',   'Raven',
  ];

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

  /* ── Body types ─────────────────────────────────────────────────────────── */
  const BODY_TYPES = [
    { id: 'flat',     label: 'Flat',     subtitle: 'Asymmetric · short', available: true  },
    { id: 'circular', label: 'Circular', subtitle: 'Symmetric · long',   available: true  },
    { id: 'oval',     label: 'Oval',     subtitle: 'Symmetric · long',   available: false },
  ];

  /* ── Assets manifest ─────────────────────────────────────────────────────
   * Keyed by body type. All new PNG assets have real alpha — no multiply.
   * Legacy JPG assets (raw: true) still need mix-blend-mode: multiply.
   * ──────────────────────────────────────────────────────────────────────── */

  const FLAT_ROOT = '../Avatar assets/Flat face asymmetrical short body/';
  const CIRC_ROOT = '../Avatar assets/Circular face symmetrical long body/';

  const ASSETS_BY_TYPE = {
    flat: {
      body: [
        { id: 'body-empty',   label: 'Blank',   src: FLAT_ROOT + 'Flat Empty Avatar to draw.png',   raw: false },
        { id: 'body-default', label: 'Default', src: FLAT_ROOT + 'Flat Default Avatar Base.JPG',     raw: true  },
      ],
      face: [
        { id: 'face-1', label: 'Face 1', src: FLAT_ROOT + 'Flat Face variations/face1.png', raw: false },
        { id: 'face-2', label: 'Face 2', src: FLAT_ROOT + 'Flat Face variations/face2.png', raw: false },
        { id: 'face-3', label: 'Face 3', src: FLAT_ROOT + 'Flat Face variations/face3.png', raw: false },
        { id: 'face-4', label: 'Face 4', src: FLAT_ROOT + 'Flat Face variations/face4.png', raw: false },
        { id: 'face-5', label: 'Face 5', src: FLAT_ROOT + 'Flat Face variations/face5.png', raw: false },
      ],
      'hair-top': [
        { id: 'hair-top-1', label: 'Bangs 1', src: FLAT_ROOT + 'Flat Hair (bangs, top layer)/Hair1.png', raw: false },
        { id: 'hair-top-2', label: 'Bangs 2', src: FLAT_ROOT + 'Flat Hair (bangs, top layer)/Hair2.png', raw: false },
        { id: 'hair-top-3', label: 'Bangs 3', src: FLAT_ROOT + 'Flat Hair (bangs, top layer)/Hair3.png', raw: false },
        { id: 'hair-top-4', label: 'Bangs 4', src: FLAT_ROOT + 'Flat Hair (bangs, top layer)/Hair4.png', raw: false },
        { id: 'hair-top-5', label: 'Bangs 5', src: FLAT_ROOT + 'Flat Hair (bangs, top layer)/Hair5.png', raw: false },
      ],
      'hair-bottom': [
        { id: 'hair-bot-1', label: 'Lower 1', src: FLAT_ROOT + 'Flat Hair (lower half hair, bottom layer)/Subject.png',  raw: false },
        { id: 'hair-bot-2', label: 'Lower 2', src: FLAT_ROOT + 'Flat Hair (lower half hair, bottom layer)/Subject2.png', raw: false },
        { id: 'hair-bot-3', label: 'Lower 3', src: FLAT_ROOT + 'Flat Hair (lower half hair, bottom layer)/Subject3.png', raw: false },
        { id: 'hair-bot-4', label: 'Lower 4', src: FLAT_ROOT + 'Flat Hair (lower half hair, bottom layer)/Subject4.png', raw: false },
        { id: 'hair-bot-5', label: 'Lower 5', src: FLAT_ROOT + 'Flat Hair (lower half hair, bottom layer)/Subject5.png', raw: false },
      ],
      tops: [
        { id: 'crop-top',    label: 'Crop top',    src: FLAT_ROOT + 'Flat Clothes/Flat Female Crop Top.png',   raw: false },
        { id: 'tshirt',      label: 'T-shirt',     src: FLAT_ROOT + 'Flat Clothes/Flat Female T shirt.png',    raw: false },
        { id: 'longsleeve',  label: 'Long sleeve', src: FLAT_ROOT + 'Flat Clothes/Flat Male Long sleeve.png',  raw: false },
        { id: 'shortsleeve', label: 'Short sleeve',src: FLAT_ROOT + 'Flat Clothes/Flat Male Short sleeve.png', raw: false },
      ],
      bottoms: [
        { id: 'lace-skirt',  label: 'Lace skirt',  src: FLAT_ROOT + 'Flat Clothes/Flat Female Lace Skirt.png',    raw: false },
        { id: 'pleat-skirt', label: 'Pleat skirt', src: FLAT_ROOT + 'Flat Clothes/Flat Female Pleated Skirt.png', raw: false },
        { id: 'shorts',      label: 'Shorts',      src: FLAT_ROOT + 'Flat Clothes/Flat Male Shorts.png',          raw: false },
        { id: 'pants',       label: 'Pants',       src: FLAT_ROOT + 'Flat Clothes/Flat Unisex pants.png',         raw: false },
      ],
    },

    circular: {
      body: [
        { id: 'circ-body-empty', label: 'Blank', src: CIRC_ROOT + 'Circular Empty Avatar to draw.png', raw: false },
      ],
      face: [
        { id: 'circ-face-1', label: 'Face 1', src: CIRC_ROOT + 'Circular face variations/face1.png', raw: false },
        { id: 'circ-face-2', label: 'Face 2', src: CIRC_ROOT + 'Circular face variations/face2.png', raw: false },
        { id: 'circ-face-3', label: 'Face 3', src: CIRC_ROOT + 'Circular face variations/face3.png', raw: false },
        { id: 'circ-face-4', label: 'Face 4', src: CIRC_ROOT + 'Circular face variations/face4.png', raw: false },
      ],
      'hair-top': [
        { id: 'circ-hair-top-1', label: 'Bangs 1', src: CIRC_ROOT + 'Circular Hair (bangs, top layer)/Subject1.png', raw: false },
      ],
      'hair-bottom': [
        { id: 'circ-hair-bot-1', label: 'Lower 1', src: CIRC_ROOT + 'Circular Hair (lower half hair, bottom layer)/Subject1.png', raw: false },
      ],
      tops: [
        { id: 'circ-crop-top',  label: 'Crop top',     src: CIRC_ROOT + 'Circular Clothes/Circular Female crop top.png',    raw: false },
        { id: 'circ-tight-top', label: 'Tight top',    src: CIRC_ROOT + 'Circular Clothes/Circular Female tight top.png',   raw: false },
        { id: 'circ-tshirt',    label: 'T-shirt',      src: CIRC_ROOT + 'Circular Clothes/Circular unisex T shirt.png',     raw: false },
        { id: 'circ-fitted',    label: 'Fitted shirt', src: CIRC_ROOT + 'Circular Clothes/Circular unisex fitted shirt.png',raw: false },
      ],
      bottoms: [
        { id: 'circ-tulle',  label: 'Tulle skirt', src: CIRC_ROOT + 'Circular Clothes/Circular Tulle Skirt.png',       raw: false },
        { id: 'circ-mini',   label: 'Miniskirt',   src: CIRC_ROOT + 'Circular Clothes/Circular female miniskirt.png',  raw: false },
        { id: 'circ-pants',  label: 'Long pants',  src: CIRC_ROOT + 'Circular Clothes/Circular male long pants.png',   raw: false },
      ],
    },

    oval: {
      /* Oval assets not yet available — placeholder keeps the structure ready */
    },
  };

  /* Convenience alias */
  const ASSETS = ASSETS_BY_TYPE.flat;

  return {
    getProfile, saveProfile,
    getAvatarState, saveAvatarState,
    getAvatarPortrait, saveAvatarPortrait,
    getAvatarIdentity, saveAvatarIdentity,
    getArchive, addArchiveEntry,
    highlightNav, fmtTime,
    COLOURS, SHAPES, COLOUR_THEMES,
    ASSETS,
    ASSETS_BY_TYPE,
    BODY_TYPES,
  };
})();

document.addEventListener('DOMContentLoaded', () => App.highlightNav());
