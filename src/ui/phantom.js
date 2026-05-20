// Phantom Node — three types, each with distinct rewards and risk.
//   Blue  (70%): ×5 click power for 20s, 4s window  [default]
//   Gold  (20%): instant resistance = 90s production, 2s window [alertness reward]
//   Red   (10%): ×15 click power for 30s but MISSING it costs 30s of production; 4s window
const PhantomUI = (() => {

  const LIFETIME_BLUE  = 4000;
  const LIFETIME_GOLD  = 2000; // tighter window — rewards alertness
  const LIFETIME_RED   = 4000;
  const MIN_INTERVAL   = 75000;
  const MAX_INTERVAL   = 135000;

  let nextAt  = 0;
  let pending = false;
  let autoRemove = null;

  function scheduleNext(now) {
    nextAt  = (now || performance.now()) + MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
    pending = false;
  }

  function pickType() {
    const r = Math.random();
    if (r < 0.70) return 'blue';
    if (r < 0.90) return 'gold';
    return 'red';
  }

  function spawn(state) {
    pending = true;

    const type  = pickType();
    const label = PHANTOM_MESSAGES[Math.floor(Math.random() * PHANTOM_MESSAGES.length)];

    const node = document.createElement('div');
    node.className = `phantom-node phantom-${type}`;
    node.innerHTML = `<span class="phantom-label">${label}</span><div class="phantom-bar"></div>`;

    const nodeW  = 120;
    const nodeH  = 52;
    const margin = 90;
    const x = margin + Math.random() * (window.innerWidth  - margin * 2 - nodeW);
    const y = margin + Math.random() * (window.innerHeight - margin * 2 - nodeH);
    node.style.left = Math.max(margin, x) + 'px';
    node.style.top  = Math.max(margin, y) + 'px';

    document.body.appendChild(node);

    const lifetime = type === 'gold' ? LIFETIME_GOLD : (type === 'red' ? LIFETIME_RED : 4000);

    requestAnimationFrame(() => {
      const bar = node.querySelector('.phantom-bar');
      if (bar) {
        bar.style.transitionDuration = (lifetime / 1000) + 's';
        bar.style.width = '0%';
      }
    });

    function intercept() {
      clearTimeout(autoRemove);
      node.removeEventListener('click', intercept);
      node.classList.add('phantom-captured');
      setTimeout(() => node.remove(), 250);

      // A4: Bricked Servers — all phantoms also grant +60s production on capture
      const brickedBonus = (state.metaTreePurchased || []).includes('tree_a4')
        ? (state.rate || 0) * 60 : 0;
      if (brickedBonus > 0) state.resistance = (state.resistance || 0) + brickedBonus;

      if (type === 'blue') {
        state.clickBoostMult   = 5;
        state.clickBoostExpiry = Date.now() + 20000;
        const extra = brickedBonus > 0 ? ` +${HUD.fmt(Math.floor(brickedBonus))} R` : '';
        HUD.toast('Signal intercepted — ×5 click for 20s' + extra, 'milestone');
      } else if (type === 'gold') {
        const bonus = (state.rate || 0) * 90;
        state.resistance = (state.resistance || 0) + bonus;
        HUD.toast('Intel cache — +' + HUD.fmt(Math.floor(bonus)) + ' resistance', 'milestone');
      } else {
        state.clickBoostMult   = 15;
        state.clickBoostExpiry = Date.now() + 30000;
        const extra = brickedBonus > 0 ? ` +${HUD.fmt(Math.floor(brickedBonus))} R` : '';
        HUD.toast('Counter-intel — ×15 click for 30s' + extra, 'milestone');
      }

      scheduleNext();
    }

    node.addEventListener('click', intercept);

    autoRemove = setTimeout(() => {
      node.classList.add('phantom-missed');
      setTimeout(() => node.remove(), 300);

      if (type === 'red') {
        const penalty = (state.rate || 0) * 30;
        state.resistance = Math.max(0, (state.resistance || 0) - penalty);
        HUD.toast('Counter-intel missed — −' + HUD.fmt(Math.floor(penalty)) + ' resistance', 'achievement');
      }

      scheduleNext();
    }, lifetime);
  }

  function check(state, now) {
    if (state.clickBoostExpiry && Date.now() > state.clickBoostExpiry) {
      state.clickBoostMult   = 1;
      state.clickBoostExpiry = 0;
    }

    if (state.rate <= 0 || pending) return;

    if (nextAt === 0) {
      scheduleNext(now);
      return;
    }

    if (now >= nextAt) spawn(state);
  }

  function init(state) {
    scheduleNext(performance.now());
  }

  return { check, init };
})();
