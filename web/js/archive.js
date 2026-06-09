/* ── Living archive / chat room ── */

(function () {

  const PROMPTS = [
    "What are you carrying today that has no name?",
    "Describe the texture of a recent memory.",
    "What did you almost say, but didn't?",
    "Where in your body do you keep the unsaid things?",
    "Name something you are slowly becoming.",
    "What does your silence sound like right now?",
    "What would you tell the version of yourself from three years ago?",
    "What is something you have outgrown but still wear?",
    "Describe a room you will never return to.",
    "What are you in the middle of, right now?",
    "What have you been pretending not to notice?",
    "What word keeps returning to you lately?",
    "If your body were a landscape, what would it look like today?",
    "What are you learning to let be imperfect?",
    "Name the thing you want without apology.",
    "What stays with you from yesterday?",
    "What does care look like in your hands?",
    "Describe yourself as if you were a found object.",
    "What question are you living inside right now?",
    "What have you been postponing that matters?",
    "If grief were a fabric, what would yours feel like?",
    "What are you practicing being?",
    "What small thing holds enormous weight for you?",
    "Describe the particular quality of your loneliness.",
    "What are you building, slowly, without anyone watching?",
  ];

  const PROMPT_INTERVAL = 3 * 60 * 1000; // 3 minutes

  let currentPromptIndex = 0;
  let timerInterval = null;
  let secondsLeft = PROMPT_INTERVAL / 1000;

  /* ── DOM refs ── */
  const promptText   = document.getElementById('current-prompt-text');
  const promptTimer  = document.getElementById('prompt-timer');
  const feed         = document.getElementById('archive-feed');
  const composeInput = document.getElementById('compose-input');
  const sendBtn      = document.getElementById('send-btn');

  /* ── Prompt rotation ── */
  function loadPromptState() {
    try {
      const s = JSON.parse(localStorage.getItem('archivePromptState') || 'null');
      if (s && s.lastTs && s.index !== undefined) {
        const elapsed = Date.now() - s.lastTs;
        const remaining = PROMPT_INTERVAL - (elapsed % PROMPT_INTERVAL);
        currentPromptIndex = s.index + Math.floor(elapsed / PROMPT_INTERVAL);
        currentPromptIndex = currentPromptIndex % PROMPTS.length;
        secondsLeft = Math.round(remaining / 1000);
      }
    } catch {}
  }

  function savePromptState() {
    localStorage.setItem('archivePromptState', JSON.stringify({
      index: currentPromptIndex,
      lastTs: Date.now(),
    }));
  }

  function currentPrompt() {
    return PROMPTS[currentPromptIndex % PROMPTS.length];
  }

  function advancePrompt() {
    // Add the prompt itself to the feed
    const entry = {
      type: 'prompt',
      text: currentPrompt(),
      ts: Date.now(),
    };
    App.addArchiveEntry(entry);
    currentPromptIndex = (currentPromptIndex + 1) % PROMPTS.length;
    secondsLeft = PROMPT_INTERVAL / 1000;
    savePromptState();
    renderPromptCard();
    renderFeed();
  }

  function renderPromptCard() {
    promptText.textContent = currentPrompt();
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        advancePrompt();
      } else {
        renderTimerLabel();
      }
    }, 1000);
  }

  function renderTimerLabel() {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    promptTimer.textContent = `next prompt in ${m}:${s.toString().padStart(2,'0')}`;
  }

  /* ── Feed ── */
  function renderFeed() {
    const entries = App.getArchive();
    feed.innerHTML = '';

    if (!entries.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'text-align:center; padding: 40px 0; color:var(--muted); font-family:"IM Fell English",serif; font-style:italic; font-size:14px;';
      empty.textContent = 'The archive is empty. Begin.';
      feed.appendChild(empty);
      return;
    }

    // Reverse order — newest at bottom visually with column-reverse
    entries.forEach(entry => {
      const el = document.createElement('div');
      el.className = 'feed-item';

      if (entry.type === 'prompt') {
        el.innerHTML = `
          <div class="feed-prompt">
            <div class="fp-label">Prompt</div>
            <div class="fp-text">${escHtml(entry.text)}</div>
          </div>`;
      } else {
        const profile = App.getProfile();
        const name = entry.authorName || profile.name || 'Anonymous';
        el.innerHTML = `
          <div class="feed-response">
            <div class="fr-name">${escHtml(name)}</div>
            <div class="fr-text">${escHtml(entry.text)}</div>
            <div class="fr-time">${App.fmtTime(entry.ts)}</div>
          </div>`;
      }

      feed.appendChild(el);
    });

    // Scroll to bottom
    feed.scrollTop = feed.scrollHeight;
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Compose ── */
  function sendResponse() {
    const text = composeInput.value.trim();
    if (!text) return;

    const profile = App.getProfile();
    const entry = {
      type: 'response',
      text,
      authorName: profile.name || null,
      promptText: currentPrompt(),
      ts: Date.now(),
    };
    App.addArchiveEntry(entry);
    composeInput.value = '';
    composeInput.style.height = '';
    renderFeed();
  }

  sendBtn.addEventListener('click', sendResponse);
  composeInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendResponse();
    }
  });

  // Auto-resize textarea
  composeInput.addEventListener('input', () => {
    composeInput.style.height = 'auto';
    composeInput.style.height = Math.min(composeInput.scrollHeight, 120) + 'px';
  });

  /* ── Init ── */
  loadPromptState();
  renderPromptCard();
  renderTimerLabel();
  renderFeed();
  startTimer();

})();
