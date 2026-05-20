// Field Decision mini-game — scenario every ~90s, player picks A or B.
// Each choice has a typed outcome (rate boost vs click boost) and a building
// that biases the success probability. The higher your count of that building,
// the better your odds (15% floor, 85% ceiling at 35 owned).
// Failure always pays a consolation: 60s of current production added instantly.
// Rare Cascade (5%): both bonuses fire together for 20s.
const DecisionUI = (() => {

  const RATE_MULT      = 2.5;   // rate multiplier on rate-kind success
  const RATE_DURATION  = 45000; // ms
  const CLICK_MULT     = 3;     // click boost multiplier on click-kind success
  const CLICK_DURATION = 45000; // ms
  const CASCADE_DURATION = 20000;
  const MIN_INTERVAL   = 75000;
  const MAX_INTERVAL   = 120000;

  let nextAt  = 0;
  let pending = false;
  let usedIndices = [];
  let _typewriterTimer = null;

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

  function successChance(buildingId, state) {
    const owned = (state.buildings && state.buildings[buildingId]) || 0;
    return Math.min(0.85, 0.15 + owned / 50);
  }

  function setIdle() {
    const panel     = document.getElementById('decision-panel');
    const sitEl     = document.getElementById('decision-situation');
    const choicesEl = document.getElementById('decision-choices');
    const resultEl  = document.getElementById('decision-result');
    if (!panel) return;

    clearInterval(_typewriterTimer);
    panel.classList.add('decision-idle');
    sitEl.innerHTML = '<span class="decision-idle-placeholder">AWAITING FIELD DECISION<span class="idle-cursor">_</span></span>';
    choicesEl.classList.add('hidden');
    resultEl.className = 'decision-result hidden';
    resultEl.textContent = '';
  }

  function typewrite(el, text, onDone) {
    clearInterval(_typewriterTimer);
    el.textContent = '';
    let i = 0;
    _typewriterTimer = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(_typewriterTimer);
        if (onDone) onDone();
      }
    }, 18);
  }

  function getDecisionDuration(state) {
    // B3: Counter-narrative — decision buffs last 60s instead of 45s
    return (state.metaTreePurchased || []).includes('tree_b3') ? 60000 : RATE_DURATION;
  }

  function applyRateBoost(state, duration) {
    state.decisionMult       = RATE_MULT;
    state.decisionMultExpiry = Date.now() + duration;
  }

  function applyClickBoost(state, duration) {
    const newExpiry = Date.now() + duration;
    if (!state.clickBoostExpiry || Date.now() > state.clickBoostExpiry || CLICK_MULT > (state.clickBoostMult || 1)) {
      state.clickBoostMult   = CLICK_MULT;
      state.clickBoostExpiry = newExpiry;
    }
  }

  function showDecision(state) {
    pending = true;
    const scenario  = pickScenario();
    const panel     = document.getElementById('decision-panel');
    const sitEl     = document.getElementById('decision-situation');
    const choicesEl = document.getElementById('decision-choices');
    const resultEl  = document.getElementById('decision-result');
    const btnA      = document.getElementById('decision-a');
    const btnB      = document.getElementById('decision-b');

    if (!panel) return;

    panel.classList.remove('decision-idle');
    resultEl.className = 'decision-result hidden';
    resultEl.textContent = '';
    choicesEl.classList.add('hidden');
    btnA.classList.remove('btn-reveal');
    btnB.classList.remove('btn-reveal');

    void panel.offsetWidth;
    panel.classList.add('decision-enter');
    setTimeout(() => panel.classList.remove('decision-enter'), 500);

    typewrite(sitEl, scenario.situation, () => {
      btnA.textContent = scenario.a;
      btnB.textContent = scenario.b;
      choicesEl.classList.remove('hidden');
      btnA.classList.add('btn-reveal');
      setTimeout(() => btnB.classList.add('btn-reveal'), 90);
    });

    function resolve(kind, buildingId) {
      btnA.onclick = null;
      btnB.onclick = null;
      choicesEl.classList.add('hidden');

      const cascade = Math.random() < 0.05;
      const success = cascade || Math.random() < successChance(buildingId, state);

      const dur = getDecisionDuration(state);
      if (cascade) {
        applyRateBoost(state, CASCADE_DURATION);
        applyClickBoost(state, CASCADE_DURATION);
        NewsUI.push(state, 'Cascade — everything aligned. ×2.5 rate + ×3 click, 20s.');
      } else if (success) {
        const secs = Math.round(dur / 1000);
        if (kind === 'rate') {
          applyRateBoost(state, dur);
          NewsUI.push(state, `The call paid off. ×2.5 rate — ${secs} seconds.`);
        } else {
          applyClickBoost(state, dur);
          NewsUI.push(state, `Bold move. ×3 click power — ${secs} seconds.`);
        }
      } else {
        const consolation = (state.rate || 0) * 60;
        state.resistance  = (state.resistance || 0) + consolation;
        NewsUI.push(state, "Didn't hold — but the movement pushed on. +" + (HUD ? HUD.fmt(Math.floor(consolation)) : '?') + ' resistance.');
      }

      setTimeout(() => {
        setIdle();
        scheduleNext();
      }, 1200);
    }

    btnA.onclick = () => resolve(scenario.aKind, scenario.aBuildingId);
    btnB.onclick = () => resolve(scenario.bKind, scenario.bBuildingId);
  }

  function check(state, now) {
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
    setIdle();
    scheduleNext(performance.now());
  }

  return { check, init };
})();
