// Main game controller — minimal Cookie-Clicker-style loop.
const Game = (() => {

  const SAVE_KEY     = 'killswitch_v5';
  const SAVE_KEY_OLD = 'killswitch_v4';
  const WIN_TARGET   = 1e9;

  // Endless ladder — passive rewards unlocked at each threshold (once ever).
  const CHECKPOINTS = [
    { at: 1e14, id: 'treaty',    name: 'The Treaty',    desc: '+1 Dossier cap' },
    { at: 1e16, id: 'audit',     name: 'The Audit',     desc: '+1 Archive slot' },
    { at: 1e18, id: 'shutdown',  name: 'The Shutdown',  desc: 'Defector yield ×2 this wave' },
    { at: 1e21, id: 'reckoning', name: 'The Reckoning', desc: 'Workshop backfire halved' },
    { at: 1e24, id: 'rewrite',   name: 'The Rewrite',   desc: 'AI Capability cap −25%' },
    { at: 1e27, id: 'peace',     name: 'The Peace',     desc: 'Greenhouse growth ×2' },
    { at: 1e30, id: 'frontier',  name: 'The Frontier',  desc: 'Embers system unlocked' },
  ];

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
      clickBoostExpiry:   0,
      defectorsSpent:     0,
      metaTreePurchased:  [],
      clearedCheckpoints: []
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_KEY_OLD);
      if (!raw) return null;
      const s = JSON.parse(raw);
      let offlineDt = 0;
      if (s.savedAt) {
        // B6: Generational Turn — offline cap 4h→16h, efficiency 50%→90%
        const hasGenerational = (s.metaTreePurchased || []).includes('tree_b6');
        const offlineCap = hasGenerational ? 16 * 3600 : 4 * 3600;
        const offlineEff = hasGenerational ? 0.9 : 0.5;
        offlineDt = Math.min((Date.now() - s.savedAt) / 1000, offlineCap);
        if (offlineDt > 5) {
          const r = computeRate(s);
          s.resistance += r * offlineDt * offlineEff;
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
      s.defectorsSpent      = s.defectorsSpent      || 0;
      s.metaTreePurchased   = s.metaTreePurchased   || [];
      s.clearedCheckpoints  = s.clearedCheckpoints  || [];
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
      if ((u.kind === 'building' || u.kind === 'milestone') && u.buildingId === id && state.upgrades.includes(u.id)) {
        mult *= u.rateMult;
      }
      if (u.kind === 'synergy' && state.upgrades.includes(u.id)) {
        if (u.synA === id) mult *= (1 + (state.buildings[u.synB] || 0) * 0.0005);
        else if (u.synB === id) mult *= (1 + (state.buildings[u.synA] || 0) * 0.0005);
      }
    });
    return b.baseRate * mult * (state.prestigeMult || 1);
  }

  function getConvictionMult(s) {
    const count = (s.achievements || []).length;
    const rate = (s.metaTreePurchased || []).includes('tree_b5') ? 0.03 : 0.02;
    return 1 + count * rate;
  }

  // Defectors earned this wave — floor(cbrt(maxResistance / 1e6))
  function getDefectorsEarned(s) {
    return Math.floor(Math.cbrt((s.maxResistance || 0) / 1e6));
  }

  function getDefectorsAvailable(s) {
    return Math.max(0, getDefectorsEarned(s) - (s.defectorsSpent || 0));
  }

  function grantMilestones(s) {
    // B4: Mass Conversion — milestones trigger 25 owned earlier
    const massBump = (s.metaTreePurchased || []).includes('tree_b4') ? 25 : 0;
    UPGRADES.forEach(u => {
      if (u.kind !== 'milestone') return;
      if (s.upgrades.includes(u.id)) return;
      const owned = (s.buildings && s.buildings[u.buildingId]) || 0;
      if (owned >= Math.max(1, u.unlockOwned - massBump)) {
        s.upgrades.push(u.id);
        HUD.toast(`${u.name} — ${u.effect}`, 'milestone');
      }
    });
  }

  function computeRate(s) {
    let total = 0;
    BUILDINGS.forEach(b => {
      const owned = s.buildings[b.id] || 0;
      if (owned === 0) return;
      let mult = 1;
      UPGRADES.forEach(u => {
        if ((u.kind === 'building' || u.kind === 'milestone') && u.buildingId === b.id && s.upgrades.includes(u.id)) {
          mult *= u.rateMult;
        }
        if (u.kind === 'synergy' && s.upgrades.includes(u.id)) {
          // B2: Trusted Voices — synergy bonuses 50% more effective
          const synergyBoost = (s.metaTreePurchased || []).includes('tree_b2') ? 1.5 : 1;
          if (u.synA === b.id) mult *= (1 + (s.buildings[u.synB] || 0) * 0.0005 * synergyBoost);
          else if (u.synB === b.id) mult *= (1 + (s.buildings[u.synA] || 0) * 0.0005 * synergyBoost);
        }
      });
      total += b.baseRate * mult * owned;
    });
    // B1: Viral Loops — +10% global production
    const viralMult = (s.metaTreePurchased || []).includes('tree_b1') ? 1.1 : 1;
    const unspent = getDefectorsAvailable(s);
    const softPowerMult = (s.metaTreePurchased || []).includes('tree_c6') ? 0.02 : 0.01;
    const defectorBonus = 1 + Math.min(5.0, unspent * softPowerMult);
    return total * (s.prestigeMult || 1) * getConvictionMult(s) * defectorBonus * viralMult;
  }

  function recomputeClickPower() {
    let power = 1;
    state.upgrades.forEach(id => {
      const u = UPGRADES.find(x => x.id === id);
      if (u && u.kind === 'click') power += u.clickPower;
    });
    // A1: Sleeper Cells — +50% click power
    if ((state.metaTreePurchased || []).includes('tree_a1')) power *= 1.5;
    // A5: Glass Datacenters — +1 click per total building owned
    if ((state.metaTreePurchased || []).includes('tree_a5')) {
      const totalBuildings = Object.values(state.buildings || {}).reduce((a, b) => a + b, 0);
      power += Math.floor(Math.sqrt(totalBuildings));
    }
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
    // A3: Burn Notice — 6s window instead of 3.5s
    const windowMs = (state && (state.metaTreePurchased || []).includes('tree_a3')) ? 6000 : 3500;
    _criticalTimer = setTimeout(deactivateCritical, windowMs);
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
    const critMult = (state.metaTreePurchased || []).includes('tree_a2') ? 8 : 5;
    const power = isCritical
      ? state.clickPower * critMult * clickBoost
      : state.clickPower * clickBoost;

    if (isCritical) {
      deactivateCritical();
      // A2: Day-zero Disclosure — crits deal ×8 instead of ×5
      const critMult = (state.metaTreePurchased || []).includes('tree_a2') ? 8 : 5;
      HUD.toast(`Critical hit — ×${critMult}`, 'milestone');
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
    grantMilestones(state);
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

    // Defectors earned this wave (before reset)
    const earned = getDefectorsEarned(state);

    const carry = {
      prestige:           state.prestige,
      prestigeMult:       state.prestigeMult,
      totalClicks:        state.totalClicks,
      totalPlaytime:      state.totalPlaytime,
      achievements:       state.achievements,
      victoryReached:     true,
      clearedCheckpoints: state.clearedCheckpoints,
      // defectors: reset each wave (tree resets); earned not carried forward
    };

    state = Object.assign(newState(), carry);

    // Diplomatic Pouch: start with 1M resistance
    if ((carry.metaTreePurchased || []).includes('tree_c1')) {
      state.resistance = 1e6;
      state.maxResistance = 1e6;
    }

    // Sympathetic Insider: start with 10 of each of the first 5 buildings
    if ((carry.metaTreePurchased || []).includes('tree_c2')) {
      ['activist','pamphlet','demo','blog','ngo'].forEach(id => {
        state.buildings[id] = (state.buildings[id] || 0) + 10;
      });
    }

    state.rate = computeRate(state);
    recomputeClickPower();
    victoryShown = false;

    BuildingsUI.resetTracking();
    NewsUI.init(state);

    document.getElementById('victory-overlay').classList.add('hidden');
    HUD.updateWave(state);
    HUD.updateAchievements(state);
    if (typeof MetaTreeUI !== 'undefined') MetaTreeUI.refresh(state);
    save();
  }

  // ===== CHECKPOINTS =====
  function checkCheckpoints() {
    if (!state) return;
    const cleared = state.clearedCheckpoints || [];
    CHECKPOINTS.forEach(cp => {
      if (cleared.includes(cp.id)) return;
      if (state.resistance < cp.at) return;
      state.clearedCheckpoints = [...cleared, cp.id];
      HUD.toast(`${cp.name} reached — ${cp.desc}`, 'milestone');
    });
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

    checkCheckpoints();
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
    if (hint) {
      hint.classList.remove('hidden');
      hint.textContent = `The moratorium passed — but AI labs found loopholes within months. Start again stronger: prestige multiplier +${(state.prestige || 0) + 1}×0.5 and your Defectors carry over.`;
    }
    if (typeof MetaTreeUI !== 'undefined') MetaTreeUI.refresh(state);
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
    grantMilestones(state);
    state.rate = computeRate(state);
    recomputeClickPower();

    BuildingsUI.renderBuildingsOnce();
    BuildingsUI.initBuyMultButtons();
    NewsUI.init(state);
    DecisionUI.init(state);
    PhantomUI.init(state);
    MetaTreeUI.init(state);
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
        if (btn.dataset.tab === 'stats')     HUD.renderStats(state);
        if (btn.dataset.tab === 'strategy')  MetaTreeUI.refresh(state);
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

  function buyMetaNode(nodeId) {
    if (!state || !META_TREE) return;
    const node = META_TREE.find(n => n.id === nodeId);
    if (!node) return;
    if ((state.metaTreePurchased || []).includes(nodeId)) return;
    if (getDefectorsAvailable(state) < node.cost) return;
    // Capstone requires all 5 prior nodes in the same path
    if (node.isCapstone) {
      const pathNodes = META_TREE.filter(n => n.path === node.path && !n.isCapstone);
      if (!pathNodes.every(n => (state.metaTreePurchased || []).includes(n.id))) return;
    }
    state.defectorsSpent = (state.defectorsSpent || 0) + node.cost;
    state.metaTreePurchased = [...(state.metaTreePurchased || []), nodeId];
    state.rate = computeRate(state);
    recomputeClickPower();
    HUD.toast(`Strategy: ${node.name}`, 'milestone');
    if (typeof MetaTreeUI !== 'undefined') MetaTreeUI.refresh(state);
  }

  return {
    init,
    buyBuilding, buyUpgrade, buyMetaNode,
    getBuildingRate,
    getDefectorsEarned, getDefectorsAvailable,
    getState: () => state
  };
})();

window.addEventListener('DOMContentLoaded', Game.init);
