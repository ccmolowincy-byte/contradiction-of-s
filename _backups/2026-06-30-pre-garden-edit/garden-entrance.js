const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function initGardenEntrance(options = {}) {
  const params = new URLSearchParams(window.location.search);
  const traceId = params.get('trace');
  const shouldPlantTrace = UUID_RE.test(traceId || '') && params.get('plant') !== '0';
  const pulse = typeof options.pulse === 'function' ? options.pulse : function () {};

  let trace = null;
  let planted = false;
  let garden = null;
  let overlay = null;
  let star = null;
  let seed = null;

  injectStyles();

  function shouldSkipRealtime(row) {
    return !!(row && shouldPlantTrace && row.id === traceId);
  }

  async function prepare(db) {
    if (!shouldPlantTrace) return false;
    try {
      const { data, error } = await db.from('pain_traces')
        .select('*').eq('id', traceId).single();
      if (error) throw error;
      trace = data;
      return true;
    } catch (err) {
      console.warn('planted trace load failed', err);
      pulse('your trace is saved; the garden will find it soon');
      return false;
    }
  }

  function mount(gardenInstance) {
    garden = gardenInstance;
    if (!trace || !garden || overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'garden-entrance';
    overlay.className = 'garden-entrance active';
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML = [
      '<div class="garden-entrance-copy">',
      '  <div class="garden-entrance-label">your body is ready to enter</div>',
      '  <div class="garden-entrance-title">Tap the garden to plant it</div>',
      '  <div class="garden-entrance-sub">A falling star will seed your movement where you touch.</div>',
      '</div>'
    ].join('');

    star = document.createElement('img');
    star.className = 'garden-entrance-star';
    star.src = 'assets/stars/star1.png';
    star.alt = '';

    seed = document.createElement('div');
    seed.className = 'garden-entrance-seed';

    document.body.appendChild(overlay);
    document.body.appendChild(star);
    document.body.appendChild(seed);

    overlay.addEventListener('pointerdown', onPlant, { passive: false });
  }

  function onPlant(event) {
    event.preventDefault();
    beginPlanting(event.clientX, event.clientY);
  }

  function beginPlanting(clientX, clientY) {
    if (!trace || !garden || planted) return;
    planted = true;
    overlay.classList.add('planted');

    const x = Math.max(22, Math.min(window.innerWidth - 22, clientX));
    const y = Math.max(42, Math.min(window.innerHeight - 42, clientY));
    const startX = Math.max(20, Math.min(window.innerWidth - 20, x - window.innerWidth * 0.34));
    const startY = -54;

    star.classList.remove('seeded', 'fall');
    star.style.transition = 'none';
    star.style.transform = `translate3d(${startX}px,${startY}px,0) rotate(-34deg) scale(0.82)`;
    star.style.opacity = '1';
    star.getBoundingClientRect();
    star.style.transition = '';
    star.classList.add('fall');
    star.style.transform = `translate3d(${x - 17}px,${y - 17}px,0) rotate(122deg) scale(1.08)`;

    setTimeout(() => {
      star.classList.add('seeded');
      seed.classList.remove('bloom');
      seed.style.setProperty('--seed-x', `${x - 9}px`);
      seed.style.setProperty('--seed-y', `${y - 9}px`);
      seed.style.transform = `translate3d(${x - 9}px,${y - 9}px,0) scale(0.2)`;
      seed.getBoundingClientRect();
      seed.classList.add('bloom');
      garden.plantTrace(trace, { x: x / window.innerWidth, y: y / window.innerHeight });
      pulse('your body just entered the garden');
      history.replaceState(null, '', 'garden.html?trace=' + traceId);
    }, 1050);

    setTimeout(destroy, 7000);
  }

  function destroy() {
    if (overlay) overlay.remove();
    if (star) star.remove();
    if (seed) seed.remove();
    overlay = star = seed = null;
  }

  return {
    traceId,
    shouldPlantTrace,
    shouldSkipRealtime,
    prepare,
    mount,
    destroy,
  };
}

function injectStyles() {
  if (document.getElementById('garden-entrance-style')) return;
  const style = document.createElement('style');
  style.id = 'garden-entrance-style';
  style.textContent = `
    .garden-entrance {
      position: fixed; inset: 0; z-index: 30;
      display: grid; place-items: center;
      pointer-events: auto; cursor: crosshair;
      background: radial-gradient(circle at 50% 58%, rgba(215,56,76,0.13), rgba(6,4,3,0.12) 34%, rgba(6,4,3,0.52));
      -webkit-tap-highlight-color: transparent;
    }
    .garden-entrance.planted { pointer-events: none; background: transparent; }
    .garden-entrance-copy {
      width: min(360px, calc(100vw - 48px));
      text-align: center;
      transform: translateY(-8vh);
      transition: opacity 0.35s ease, transform 0.35s ease;
    }
    .garden-entrance.planted .garden-entrance-copy { opacity: 0; transform: translateY(-11vh); }
    .garden-entrance-label {
      font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
      color: rgba(240,234,224,0.54); margin-bottom: 10px;
    }
    .garden-entrance-title {
      font-family: 'IM Fell English', Georgia, serif; font-style: italic;
      font-size: 23px; color: rgba(244,239,230,0.94); line-height: 1.25;
    }
    .garden-entrance-sub {
      margin-top: 12px; font-size: 11px; line-height: 1.5;
      color: rgba(240,234,224,0.56);
    }
    .garden-entrance-star {
      position: fixed; left: 0; top: 0; width: 34px; height: 34px;
      opacity: 0; pointer-events: none; z-index: 31;
      filter: drop-shadow(0 0 12px rgba(215,56,76,0.62)) drop-shadow(0 0 28px rgba(232,190,112,0.38));
      transform: translate3d(-80px,-80px,0) rotate(0deg) scale(0.85);
    }
    .garden-entrance-star.fall {
      opacity: 1;
      transition: transform 1.05s cubic-bezier(.16,.72,.18,1), opacity 0.18s ease;
    }
    .garden-entrance-star.seeded {
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    .garden-entrance-seed {
      position: fixed; left: 0; top: 0; width: 18px; height: 18px;
      border-radius: 999px; opacity: 0; pointer-events: none; z-index: 31;
      background: radial-gradient(circle, rgba(248,220,165,0.94), rgba(215,56,76,0.42) 38%, rgba(215,56,76,0) 72%);
      transform: translate3d(-80px,-80px,0) scale(0.2);
    }
    .garden-entrance-seed.bloom { animation: garden-entrance-seed-bloom 1.15s ease-out forwards; }
    @keyframes garden-entrance-seed-bloom {
      0% { opacity: 0; transform: translate3d(var(--seed-x), var(--seed-y), 0) scale(0.2); }
      18% { opacity: 1; }
      100% { opacity: 0; transform: translate3d(var(--seed-x), var(--seed-y), 0) scale(9); }
    }
  `;
  document.head.appendChild(style);
}
