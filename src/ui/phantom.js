// Phantom Node — random screen position, 4s window, ×5 click boost for 20s on intercept.
const PhantomUI = (() => {

  const BOOST_MULT     = 5;
  const BOOST_DURATION = 20000;
  const LIFETIME       = 4000;
  const MIN_INTERVAL   = 75000;
  const MAX_INTERVAL   = 135000;

  let nextAt  = 0;
  let pending = false;
  let autoRemove = null;

  function scheduleNext(now) {
    nextAt  = (now || performance.now()) + MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
    pending = false;
  }

  function spawn(state) {
    pending = true;

    const label = PHANTOM_MESSAGES[Math.floor(Math.random() * PHANTOM_MESSAGES.length)];

    const node = document.createElement('div');
    node.className = 'phantom-node';
    node.innerHTML = `<span class="phantom-label">${label}</span><div class="phantom-bar"></div>`;

    const nodeW  = 120;
    const nodeH  = 52;
    const margin = 90;
    const x = margin + Math.random() * (window.innerWidth  - margin * 2 - nodeW);
    const y = margin + Math.random() * (window.innerHeight - margin * 2 - nodeH);
    node.style.left = Math.max(margin, x) + 'px';
    node.style.top  = Math.max(margin, y) + 'px';

    document.body.appendChild(node);

    // Trigger countdown bar shrink on next frame
    requestAnimationFrame(() => {
      const bar = node.querySelector('.phantom-bar');
      if (bar) bar.style.width = '0%';
    });

    function intercept() {
      clearTimeout(autoRemove);
      node.removeEventListener('click', intercept);
      node.classList.add('phantom-captured');
      setTimeout(() => node.remove(), 250);

      state.clickBoostMult    = BOOST_MULT;
      state.clickBoostExpiry  = Date.now() + BOOST_DURATION;
      HUD.toast('Signal intercepted — ×5 click for 20s', 'milestone');
      scheduleNext();
    }

    node.addEventListener('click', intercept);

    autoRemove = setTimeout(() => {
      node.classList.add('phantom-missed');
      setTimeout(() => node.remove(), 300);
      scheduleNext();
    }, LIFETIME);
  }

  function check(state, now) {
    // Expire boost
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
