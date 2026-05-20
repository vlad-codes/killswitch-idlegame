// Main game controller — minimal Cookie-Clicker-style loop.
const Game = (() => {

  const SAVE_KEY     = 'killswitch_v4';
  const SAVE_KEY_OLD = 'killswitch_v3';
  const WIN_TARGET   = 1e9;

  let state = null;
  let lastTick = 0;
  let lastSave = 0;
  let lastAchievementCheck = 0;
  let victoryShown = false;
  let _criticalActive = false;
  let _criticalTimer = null;

  // ===== STATE =====
  function newState() {
    return {
      resistance:    0,
      maxResistance: 0,
      clicks:        0,
      totalClicks:   0,
      totalPlaytime: 0,
      clickPower:    1,
      rate:          0,
      buildings:     {},
      upgrades:      [],
      achievements:  [],
      firedNews:     [],
      newsLog:       [],
      prestige:      0,
      prestigeMult:  1,
      victoryReached: false,
      hadLongOffline: false,
      startedAt:     Date.now(),
      savedAt:       Date.now(),
      decisionMult:       1,
      decisionMultExpiry: 0,
      clickBoostMult:     1,
      clickBoostExpiry:   0
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_KEY_OLD);
      if (!raw) return null;
      const s = JSON.parse(raw);
      let offlineDt = 0;
      if (s.savedAt) {
        offlineDt = Math.min((Date.now() - s.savedAt) / 1000, 4 * 3600);
        if (offlineDt > 5) {
          const r = computeRate(s);
          s.resistance += r * offlineDt * 0.5;
          s.maxResistance = Math.max(s.maxResistance || 0, s.resistance);
        }
      }
      // Backfill missing fields from older saves
      s.maxResistance  = s.maxResistance  || s.resistance || 0;
      s.totalClicks    = s.totalClicks    || s.clicks     || 0;
      s.totalPlaytime  = s.totalPlaytime  || 0;
      s.startedAt      = s.startedAt      || Date.now();
      s.achievements   = s.achievements   || [];
      s.firedNews      = s.firedNews      || [];
      s.newsLog        = s.newsLog        || [];
      s.prestige       = s.prestige       || 0;
      s.prestigeMult   = s.prestigeMult   || 1;
      s.victoryReached      = s.victoryReached      || false;
      s.hadLongOffline      = s.hadLongOffline      || (offlineDt >= 7200);
      s.decisionMult        = s.decisionMult        || 1;
      s.decisionMultExpiry  = s.decisionMultExpiry  || 0;
      s.clickBoostMult      = s.clickBoostMult      || 1;
      s.clickBoostExpiry    = s.clickBoostExpiry    || 0;
      return s;
    } catch (e) {
      return null;
    }
  }

  function save() {
    if (!state) return;
    state.savedAt = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      HUD.flashSave();
    } catch (e) {}
  }

  // ===== DERIVED =====
  function getBuildingRate(id) {
    const b = BUILDINGS.find(x => x.id === id);
    if (!b) return 0;
    let mult = 1;
    UPGRADES.forEach(u => {
      if (u.kind === 'building' && u.buildingId === id && state.upgrades.includes(u.id)) {
        mult *= u.rateMult;
      }
    });
    return b.baseRate * mult * (state.prestigeMult || 1);
  }

  function computeRate(s) {
    let total = 0;
    BUILDINGS.forEach(b => {
      const owned = s.buildings[b.id] || 0;
      if (owned === 0) return;
      let mult = 1;
      UPGRADES.forEach(u => {
        if (u.kind === 'building' && u.buildingId === b.id && s.upgrades.includes(u.id)) {
          mult *= u.rateMult;
        }
      });
      total += b.baseRate * mult * owned;
    });
    return total * (s.prestigeMult || 1);
  }

  function recomputeClickPower() {
    let power = 1;
    state.upgrades.forEach(id => {
      const u = UPGRADES.find(x => x.id === id);
      if (u && u.kind === 'click') power += u.clickPower;
    });
    state.clickPower = power;
  }

  // ===== CRITICAL MOMENT =====
  function scheduleCritical() {
    setTimeout(() => {
      if (state && state.rate > 0) activateCritical();
      else scheduleCritical();
    }, 35000 + Math.random() * 35000);
  }

  function activateCritical() {
    _criticalActive = true;
    document.querySelector('.switch-core')?.classList.add('critical');
    _criticalTimer = setTimeout(deactivateCritical, 3500);
  }

  function deactivateCritical() {
    clearTimeout(_criticalTimer);
    _criticalActive = false;
    document.querySelector('.switch-core')?.classList.remove('critical');
    scheduleCritical();
  }

  // ===== ACTIONS =====
  function clickSwitch(event) {
    const isCritical = _criticalActive;
    const clickBoost = (state.clickBoostExpiry && Date.now() < state.clickBoostExpiry)
      ? (state.clickBoostMult || 1) : 1;
    const power = isCritical
      ? state.clickPower * 5 * clickBoost
      : state.clickPower * clickBoost;

    if (isCritical) {
      deactivateCritical();
      HUD.toast(`Critical hit — ×5`, 'milestone');
    }

    state.resistance += power;
    if (state.resistance > state.maxResistance) state.maxResistance = state.resistance;
    state.clicks += 1;
    state.totalClicks += 1;
    HUD.spawnParticle(event.clientX, event.clientY, power);
  }

  function buyBuilding(id, multiplier = 1) {
    const b = BUILDINGS.find(x => x.id === id);
    if (!b) return;
    const owned = state.buildings[id] || 0;

    let n;
    if (multiplier === 'max') {
      n = buildingMaxAffordable(b, owned, state.resistance);
      if (n < 1) return;
    } else {
      n = multiplier;
      const cost = buildingBulkCost(b, owned, n);
      if (state.resistance < cost) {
        const single = buildingCost(b, owned);
        if (state.resistance >= single && n > 1) {
          n = 1;
        } else {
          return;
        }
      }
    }

    const totalCost = buildingBulkCost(b, owned, n);
    if (state.resistance < totalCost) return;

    state.resistance -= totalCost;
    state.buildings[id] = owned + n;
    state.rate = computeRate(state);
  }

  function buyUpgrade(id) {
    const u = UPGRADES.find(x => x.id === id);
    if (!u) return;
    if (state.upgrades.includes(id)) return;
    if (state.resistance < u.cost) return;

    state.resistance -= u.cost;
    state.upgrades.push(id);

    if (u.kind === 'click') recomputeClickPower();
    state.rate = computeRate(state);
  }

  // ===== ACHIEVEMENTS =====
  function checkAchievements(now) {
    if (now - lastAchievementCheck < 2000) return;
    lastAchievementCheck = now;
    let earned = false;
    ACHIEVEMENTS.forEach(a => {
      if (!state.achievements.includes(a.id) && a.check(state)) {
        state.achievements.push(a.id);
        HUD.toast(`Achievement unlocked: ${a.name}`, 'achievement');
        earned = true;
      }
    });
    if (earned) HUD.updateAchievements(state);
  }

  // ===== PRESTIGE =====
  function doPrestige() {
    if (_criticalActive) {
      clearTimeout(_criticalTimer);
      _criticalActive = false;
      document.querySelector('.switch-core')?.classList.remove('critical');
    }
    state.prestige = (state.prestige || 0) + 1;
    state.prestigeMult = 1 + state.prestige * 0.5;

    const carry = {
      prestige:       state.prestige,
      prestigeMult:   state.prestigeMult,
      totalClicks:    state.totalClicks,
      totalPlaytime:  state.totalPlaytime,
      achievements:   state.achievements,
      victoryReached: true,
    };

    state = Object.assign(newState(), carry);
    state.rate = computeRate(state);
    recomputeClickPower();
    victoryShown = false;

    BuildingsUI.resetTracking();
    NewsUI.init(state);

    document.getElementById('victory-overlay').classList.add('hidden');
    HUD.updateWave(state);
    HUD.updateAchievements(state);
    save();
  }

  // ===== MAIN LOOP =====
  function tick(now) {
    const dt = Math.min((now - lastTick) / 1000, 1);
    lastTick = now;

    if (state.rate > 0) {
      const dMult = (state.decisionMultExpiry && Date.now() < state.decisionMultExpiry) ? (state.decisionMult || 1) : 1;
      state.resistance += state.rate * dMult * dt;
      if (state.resistance > state.maxResistance) state.maxResistance = state.resistance;
    }

    state.totalPlaytime = (state.totalPlaytime || 0) + dt * 1000;

    if (!victoryShown && state.resistance >= WIN_TARGET) {
      showVictory();
    }

    checkAchievements(now);
    NewsUI.check(state, now);
    DecisionUI.check(state, now);
    PhantomUI.check(state, now);

    HUD.updateCounter(state);
    HUD.updateProgress(state);
    HUD.updateSwitchHint(state);
    HUD.refreshMilestone(state);
    HUD.updateUpgradesCount(state);
    HUD.updateWave(state);
    BuildingsUI.refreshBuildings(state);
    BuildingsUI.refreshUpgrades(state);

    if (now - lastSave > 8000) {
      save();
      lastSave = now;
    }

    requestAnimationFrame(tick);
  }

  // ===== VICTORY =====
  function showVictory() {
    victoryShown = true;
    state.victoryReached = true;
    const overlay = document.getElementById('victory-overlay');
    if (!overlay) return;
    const mins = Math.floor((Date.now() - state.startedAt) / 60000);
    const totalBuildings = Object.values(state.buildings).reduce((a, b) => a + b, 0);
    document.getElementById('victory-stats').innerHTML = `
      Resistance:    ${HUD.fmt(Math.floor(state.resistance))}<br>
      Rate:          ${HUD.fmt(state.rate)}/s<br>
      Movement:      ${totalBuildings} structures<br>
      Breakthroughs: ${state.upgrades.length}<br>
      Clicks:        ${state.totalClicks.toLocaleString('en-US')}<br>
      Playtime:      ${mins} min
    `;
    overlay.classList.remove('hidden');
    const btn = document.getElementById('second-wave-btn');
    if (btn) btn.classList.remove('hidden');
    const hint = document.getElementById('second-wave-hint');
    if (hint) hint.classList.remove('hidden');
  }

  // ===== INTRO =====
  const INTRO_KEY = 'killswitch_intro_seen';

  function showIntroIfFirstVisit() {
    const seen = localStorage.getItem(INTRO_KEY);
    if (seen) return;
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');

    const closeIntro = () => {
      localStorage.setItem(INTRO_KEY, '1');
      overlay.classList.add('hidden');
      const switchEl = document.getElementById('kill-switch');
      if (switchEl) {
        const rect = switchEl.getBoundingClientRect();
        clickSwitch({
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2
        });
      }
    };

    const startBtn = document.getElementById('intro-start');
    if (startBtn) startBtn.addEventListener('click', closeIntro);
  }

  // ===== INIT =====
  function init() {
    state = loadState() || newState();
    state.rate = computeRate(state);
    recomputeClickPower();

    BuildingsUI.renderBuildingsOnce();
    BuildingsUI.initBuyMultButtons();
    NewsUI.init(state);
    DecisionUI.init(state);
    PhantomUI.init(state);
    HUD.updateAchievements(state);
    HUD.updateWave(state);
    showIntroIfFirstVisit();

    const switchEl = document.getElementById('kill-switch');
    if (switchEl) switchEl.addEventListener('click', clickSwitch);

    document.getElementById('reset-btn').addEventListener('click', () => {
      document.getElementById('reset-overlay').classList.remove('hidden');
    });
    document.getElementById('reset-cancel').addEventListener('click', () => {
      document.getElementById('reset-overlay').classList.add('hidden');
    });
    document.getElementById('reset-confirm').addEventListener('click', () => {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SAVE_KEY_OLD);
      localStorage.removeItem(INTRO_KEY);
      location.reload();
    });

    document.getElementById('victory-continue').addEventListener('click', () => {
      document.getElementById('victory-overlay').classList.add('hidden');
    });
    document.getElementById('second-wave-btn').addEventListener('click', doPrestige);

    document.querySelectorAll('.col-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.col-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
        if (btn.dataset.tab === 'stats') HUD.renderStats(state);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === '1') BuildingsUI.setBuyMult(1);
      if (e.key === '2') BuildingsUI.setBuyMult(10);
      if (e.key === '3') BuildingsUI.setBuyMult(100);
      if (e.key === '4') BuildingsUI.setBuyMult('max');
    });

    window.addEventListener('beforeunload', save);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) save();
    });

    lastTick = performance.now();
    requestAnimationFrame(tick);

    (function scheduleGlitch() {
      setTimeout(() => {
        HUD.glitchCounter();
        scheduleGlitch();
      }, 8000 + Math.random() * 9000);
    })();

    scheduleCritical();
  }

  return {
    init,
    buyBuilding, buyUpgrade,
    getBuildingRate,
    getState: () => state
  };
})();

window.addEventListener('DOMContentLoaded', Game.init);
