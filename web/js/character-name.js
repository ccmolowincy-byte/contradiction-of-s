/* ── Poetic name generator (Character Builder tab) ── */
(async function () {

  const PARTS = {
    adj1: [
      'Hollow', 'Tender', 'Bruised', 'Borrowed', 'Bitter', 'Velvet', 'Crooked',
      'Pale', 'Fervent', 'Sunken', 'Gentle', 'Frayed', 'Quiet', 'Wandering',
      'Aching', 'Soft', 'Strange', 'Slow', 'Weeping', 'Luminous',
      'Trembling', 'Threadbare', 'Unfinished', 'Folded', 'Unnamed',
    ],
    adj2: [
      'Paper', 'Linen', 'Ash', 'Bone', 'Silk', 'Ink', 'Salt', 'Wax',
      'Root', 'Glass', 'Smoke', 'Stone', 'Moss', 'Rust', 'Feather',
      'Thorn', 'Shadow', 'Dusk', 'Lace', 'Echo',
    ],
    noun: [
      'Mouth', 'Archive', 'Seam', 'Figure', 'Mirror', 'Wound', 'Thread',
      'Threshold', 'Skin', 'Room', 'Gesture', 'Tongue', 'Portrait',
      'Remnant', 'Witness', 'Hem', 'Trace', 'Body', 'Voice', 'Ruin',
      'Chronicle', 'Vessel', 'Silhouette', 'Fold', 'Margin',
    ],
    prep: [
      'of', 'beneath', 'within', 'without', 'before', 'after', 'against',
      'between', 'among', 'beyond', 'inside', 'outside', 'near', 'through',
    ],
    noun2: [
      'the Unsaid', 'Memory', 'the Body', 'Distance', 'Arrival',
      'the Cut', 'Dissolution', 'the Margin', 'Softness', 'the Archive',
      'Contradiction', 'What Remains', 'the Surface', 'Grief', 'Tenderness',
      'the Seam', 'Forgetting', 'Light', 'Hesitation', 'the Figure',
    ],
    verb: [
      'Carries', 'Holds', 'Unravels', 'Remembers', 'Forgets', 'Traces',
      'Returns', 'Waits', 'Folds', 'Opens', 'Closes', 'Spills', 'Remains',
      'Dissolves', 'Gathers', 'Whispers', 'Persists', 'Drifts', 'Aches',
    ],
  };

  const PATTERNS = [
    () => `${pick('adj1')} ${pick('noun')}`,
    () => `The ${pick('adj2')} ${pick('noun')}`,
    () => `${pick('adj1')} ${pick('adj2')} ${pick('noun')}`,
    () => `${pick('noun')} ${pick('prep')} ${pick('noun2')}`,
    () => `${pick('adj1')} ${pick('noun')}, ${pick('verb')}`,
    () => `She Who ${pick('verb')}`,
    () => `The One Who ${pick('verb')}`,
    () => `${pick('noun')} That ${pick('verb')}`,
    () => `${pick('adj1')} as ${pick('adj2')}`,
    () => `${pick('noun2')} ${pick('verb')}`,
    () => `${pick('adj2')} ${pick('noun')}, ${pick('adj1')}`,
    () => `Portrait of a ${pick('adj1')} ${pick('noun')}`,
  ];

  function pick(key) {
    const arr = PARTS[key];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generate() {
    const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    return pattern();
  }

  /* Wait for remote store before reading any persisted history. */
  await App.storeReady;

  /* ── DOM ── */
  const display  = document.getElementById('name-display');
  const genBtn   = document.getElementById('gen-btn');
  const saveBtn  = document.getElementById('save-current-btn');
  const histList = document.getElementById('name-history-list');
  const emptyMsg = document.getElementById('name-history-empty');

  if (!display) return; // safety if loaded on the wrong page

  let currentName = null;

  function showName(name) {
    currentName = name;
    display.textContent = name;
    display.style.opacity = '0';
    display.style.transform = 'translateY(6px)';
    requestAnimationFrame(() => {
      display.style.transition = 'opacity 0.25s, transform 0.25s';
      display.style.opacity = '1';
      display.style.transform = 'translateY(0)';
    });
    saveBtn.textContent = '★ Save this name';
    saveBtn.classList.remove('saved');
    saveBtn.disabled = false;
  }

  function renderHistory() {
    const hist = App.getNameHistory();
    histList.innerHTML = '';
    if (!hist.length) {
      emptyMsg.style.display = '';
      return;
    }
    emptyMsg.style.display = 'none';
    hist.forEach(item => {
      const row = document.createElement('div');
      row.className = 'name-history-item';

      const txt = document.createElement('div');
      txt.className = 'name-history-text';
      txt.textContent = item.text;
      if (item.saved) txt.style.color = 'var(--burgundy)';

      const btn = document.createElement('button');
      btn.className = 'name-save-btn' + (item.saved ? ' saved' : '');
      btn.textContent = item.saved ? '★ saved' : '☆ save';
      btn.addEventListener('click', () => {
        App.toggleNameSaved(item.text);
        renderHistory();
      });

      row.appendChild(txt);
      row.appendChild(btn);
      histList.appendChild(row);
    });
  }

  genBtn.addEventListener('click', () => {
    const name = generate();
    App.addNameToHistory(name);
    showName(name);
    renderHistory();
  });

  saveBtn.addEventListener('click', () => {
    if (!currentName) return;
    App.toggleNameSaved(currentName);
    saveBtn.textContent = '★ Saved';
    saveBtn.classList.add('saved');
    renderHistory();
  });

  // Initial render
  renderHistory();
  const hist = App.getNameHistory();
  if (hist.length) {
    showName(hist[0].text);
  } else {
    const first = generate();
    App.addNameToHistory(first);
    showName(first);
    renderHistory();
  }

})();
