// Field Decision mini-game — scenario appears every ~90s, player picks A or B,
// 50/50 random outcome: success = ×2 rate for 30s, failure = nothing.
const DecisionUI = (() => {

  const MULT_VALUE    = 2;
  const MULT_DURATION = 30000;
  const MIN_INTERVAL  = 75000;
  const MAX_INTERVAL  = 120000;

  let nextAt  = 0;
  let pending = false;
  let usedIndices = [];

  function pickScenario() {
    if (usedIndices.length >= DECISIONS.length) usedIndices = [];
    let idx;
    do { idx = Math.floor(Math.random() * DECISIONS.length); }
    while (usedIndices.includes(idx));
    usedIndices.push(idx);
    return DECISIONS[idx];
  }

  function scheduleNext(now) {
    nextAt  = (now || performance.now()) + MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
    pending = false;
  }

  function showDecision(state) {
    pending = true;
    const scenario = pickScenario();

    const panel    = document.getElementById('decision-panel');
    const sitEl    = document.getElementById('decision-situation');
    const choicesEl = document.getElementById('decision-choices');
    const resultEl = document.getElementById('decision-result');
    const btnA     = document.getElementById('decision-a');
    const btnB     = document.getElementById('decision-b');

    if (!panel) return;

    sitEl.textContent = scenario.situation;
    btnA.textContent  = scenario.a;
    btnB.textContent  = scenario.b;

    resultEl.className = 'decision-result hidden';
    resultEl.textContent = '';
    choicesEl.classList.remove('hidden');

    panel.classList.remove('hidden');
    void panel.offsetWidth;
    panel.classList.add('decision-enter');
    setTimeout(() => panel.classList.remove('decision-enter'), 500);

    function resolve() {
      btnA.onclick = null;
      btnB.onclick = null;
      choicesEl.classList.add('hidden');

      const success = Math.random() < 0.5;

      if (success) {
        state.decisionMult        = MULT_VALUE;
        state.decisionMultExpiry  = Date.now() + MULT_DURATION;
        resultEl.textContent = 'Operation successful. ×2 production secured for 30 seconds.';
        resultEl.className   = 'decision-result decision-success';
        HUD.toast('Field op success — ×2 rate for 30s', 'milestone');
      } else {
        resultEl.textContent = 'Operation failed. No effect on production.';
        resultEl.className   = 'decision-result decision-failure';
      }

      setTimeout(() => {
        panel.classList.add('hidden');
        scheduleNext();
      }, success ? 3500 : 2500);
    }

    btnA.onclick = resolve;
    btnB.onclick = resolve;
  }

  function check(state, now) {
    // Expire active multiplier
    if (state.decisionMultExpiry && Date.now() > state.decisionMultExpiry) {
      state.decisionMult       = 1;
      state.decisionMultExpiry = 0;
    }

    if (state.rate <= 0 || pending) return;

    if (nextAt === 0) {
      scheduleNext(now);
      return;
    }

    if (now >= nextAt) showDecision(state);
  }

  function init(state) {
    scheduleNext(performance.now());
  }

  return { check, init };
})();
