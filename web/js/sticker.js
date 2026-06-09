/* ── Sticker Making ─────────────────────────────────────────────────────────
 * Square drawing canvas + rotating prompts + save to localStorage.
 *
 * TO EDIT PROMPTS: update the PROMPTS array below.
 * TO EDIT COLOURS: update the COLOURS array below.
 * ──────────────────────────────────────────────────────────────────────────── */
(function () {

  /* ── Prompts — edit freely ────────────────────────────────────────────── */
  const PROMPTS = [
    'Draw something others cannot see.',
    'Draw a symbol for support.',
    'Draw a shape for discomfort.',
    'Draw something your body remembers.',
    'Draw a mark for recovery.',
    'Draw a symbol for rest.',
    'Draw something you wish people understood.',
    'Draw a fragment of protection.',
    'Draw something that helps you continue.',
    'Draw a symbol for adaptation.',
  ];

  /* ── Palette ──────────────────────────────────────────────────────────── */
  const COLOURS = [
    { hex: '#5c1a1a', name: 'Burgundy'  },
    { hex: '#b83232', name: 'Red'       },
    { hex: '#c87941', name: 'Terracotta'},
    { hex: '#4a6741', name: 'Sage'      },
    { hex: '#2c4a6e', name: 'Blue'      },
    { hex: '#7a5c8a', name: 'Plum'      },
    { hex: '#2a2a2a', name: 'Ink'       },
  ];

  /* ── Brush sizes ──────────────────────────────────────────────────────── */
  const SIZES = [
    { r: 2,  label: 'Thin'   },
    { r: 5,  label: 'Medium' },
    { r: 10, label: 'Thick'  },
  ];

  /* ── DOM refs ─────────────────────────────────────────────────────────── */
  const canvas     = document.getElementById('sticker-canvas');
  const ctx        = canvas.getContext('2d');
  const promptEl   = document.getElementById('sticker-prompt-text');
  const nextBtn    = document.getElementById('prompt-next-btn');
  const penBtn     = document.getElementById('s-tool-pen');
  const eraseBtn   = document.getElementById('s-tool-erase');
  const undoBtn    = document.getElementById('s-tool-undo');
  const saveBtn    = document.getElementById('sticker-save-btn');
  const clearBtn   = document.getElementById('sticker-clear-btn');
  const savedMsg   = document.getElementById('sticker-saved-msg');
  const colorsWrap = document.getElementById('sticker-colors');
  const sizesWrap  = document.getElementById('sticker-sizes');

  /* ── State ────────────────────────────────────────────────────────────── */
  let promptIdx = Math.floor(Math.random() * PROMPTS.length);
  let tool      = 'pen';
  let color     = COLOURS[0].hex;
  let brushR    = SIZES[1].r;
  let drawing   = false;
  let lastX = 0, lastY = 0;
  const undoStack = [];   // ImageData snapshots (max 30)

  /* ── Canvas sizing ────────────────────────────────────────────────────── */
  function canvasSize() {
    return Math.min(window.innerWidth - 32, 480);
  }

  function initCanvas() {
    const size = canvasSize();
    canvas.width  = size;
    canvas.height = size;
    fillBg();
  }

  function fillBg() {
    ctx.fillStyle = '#faf6ef';   // warm off-white, paper feel
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /* ── Prompts ──────────────────────────────────────────────────────────── */
  function showPrompt() {
    promptEl.textContent = PROMPTS[promptIdx];
  }

  nextBtn.addEventListener('click', () => {
    promptIdx = (promptIdx + 1) % PROMPTS.length;
    showPrompt();
  });

  /* ── Colour swatches ──────────────────────────────────────────────────── */
  function buildColors() {
    COLOURS.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.className = 's-color-dot' + (i === 0 ? ' active' : '');
      btn.style.background = c.hex;
      btn.title = c.name;
      btn.setAttribute('aria-label', c.name);
      btn.addEventListener('click', () => {
        color = c.hex;
        // Switch to pen when a colour is picked
        tool = 'pen';
        penBtn.classList.add('active');
        eraseBtn.classList.remove('active');
        document.querySelectorAll('.s-color-dot').forEach(d => d.classList.remove('active'));
        btn.classList.add('active');
      });
      colorsWrap.appendChild(btn);
    });
  }

  /* ── Brush sizes ──────────────────────────────────────────────────────── */
  function buildSizes() {
    SIZES.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className = 's-size-btn' + (i === 1 ? ' active' : '');
      const d = s.r * 2 + 4;   // visual diameter slightly bigger than draw radius
      btn.style.cssText = `width:${d}px;height:${d}px;`;
      btn.title = s.label;
      btn.setAttribute('aria-label', s.label + ' brush');
      btn.addEventListener('click', () => {
        brushR = s.r;
        document.querySelectorAll('.s-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      sizesWrap.appendChild(btn);
    });
  }

  /* ── Tool buttons ─────────────────────────────────────────────────────── */
  penBtn.addEventListener('click', () => {
    tool = 'pen';
    penBtn.classList.add('active');
    eraseBtn.classList.remove('active');
  });

  eraseBtn.addEventListener('click', () => {
    tool = 'erase';
    eraseBtn.classList.add('active');
    penBtn.classList.remove('active');
  });

  /* ── Undo ─────────────────────────────────────────────────────────────── */
  function pushUndo() {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.length > 30) undoStack.shift();
  }

  undoBtn.addEventListener('click', () => {
    if (!undoStack.length) return;
    ctx.putImageData(undoStack.pop(), 0, 0);
  });

  /* ── Clear canvas ─────────────────────────────────────────────────────── */
  clearBtn.addEventListener('click', () => {
    pushUndo();
    fillBg();
  });

  /* ── Drawing helpers ──────────────────────────────────────────────────── */
  function getXY(e) {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width  / r.width;
    const sy = canvas.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return [
      (src.clientX - r.left) * sx,
      (src.clientY - r.top)  * sy,
    ];
  }

  function dot(x, y) {
    ctx.beginPath();
    ctx.fillStyle = tool === 'erase' ? '#faf6ef' : color;
    ctx.arc(x, y, brushR, 0, Math.PI * 2);
    ctx.fill();
  }

  function line(x1, y1, x2, y2) {
    const dist  = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.ceil(dist / (brushR * 0.6)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      dot(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    }
  }

  /* ── Pointer events (mouse + touch) ──────────────────────────────────── */
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    pushUndo();
    drawing = true;
    [lastX, lastY] = getXY(e);
    dot(lastX, lastY);
    canvas.setPointerCapture(e.pointerId);
  }, { passive: false });

  canvas.addEventListener('pointermove', e => {
    e.preventDefault();
    if (!drawing) return;
    const [x, y] = getXY(e);
    line(lastX, lastY, x, y);
    [lastX, lastY] = [x, y];
  }, { passive: false });

  canvas.addEventListener('pointerup',    e => { e.preventDefault(); drawing = false; }, { passive: false });
  canvas.addEventListener('pointerleave', e => { e.preventDefault(); drawing = false; }, { passive: false });

  /* ── Save to localStorage ─────────────────────────────────────────────── */
  saveBtn.addEventListener('click', () => {
    try {
      const stickers = JSON.parse(localStorage.getItem('cos_stickers') || '[]');
      stickers.push({
        id:      Date.now(),
        prompt:  PROMPTS[promptIdx],
        image:   canvas.toDataURL('image/png'),
        created: new Date().toISOString(),
      });
      localStorage.setItem('cos_stickers', JSON.stringify(stickers));
    } catch (err) {
      console.warn('Could not save sticker:', err);
    }

    saveBtn.textContent = 'Saved ✓';
    saveBtn.classList.add('saved');
    savedMsg.classList.add('visible');

    setTimeout(() => {
      saveBtn.textContent = 'Save Sticker';
      saveBtn.classList.remove('saved');
      savedMsg.classList.remove('visible');
    }, 2500);
  });

  /* ── Init ─────────────────────────────────────────────────────────────── */
  initCanvas();
  showPrompt();
  buildColors();
  buildSizes();

})();
