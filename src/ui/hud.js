// Counter, progress bar, particles, tooltips, milestones, save indicator.
const HUD = (() => {

  // ===== Number formatting (en-US) =====
  const SUFFIXES = ['', '', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

  function fmt(n) {
    if (n < 0) return '0';
    if (n < 1000) return Math.floor(n).toString();
    if (n < 1e6)  return Math.floor(n).toLocaleString('en-US');
    let tier = Math.floor(Math.log10(n) / 3);
    if (tier >= SUFFIXES.length) tier = SUFFIXES.length - 1;
    const scaled = n / Math.pow(10, tier * 3);
    const decimals = scaled < 10 ? 2 : scaled < 100 ? 1 : 0;
    return scaled.toFixed(decimals) + SUFFIXES[tier];
  }

  function fmtCost(n) { return fmt(n); }

  function fmtRate(n) {
    if (n === 0) return '+0/s';
    if (n < 1)   return '+' + n.toFixed(2) + '/s';
    return '+' + fmt(n) + '/s';
  }

  // ===== Counter =====
  let lastCounter = 0;

  function updateCounter(state) {
    const el = document.getElementById('counter');
    if (!el) return;
    const v = Math.floor(state.resistance);
    el.textContent = fmt(v);

    const magThreshold = Math.max(1, Math.pow(10, Math.floor(Math.log10(Math.max(v, 1))) - 1));
    if (v > lastCounter && (v - lastCounter) >= magThreshold) {
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 80);
    }
    lastCounter = v;

    const rate = document.getElementById('rate');
    const badge = document.getElementById('decision-mult-badge');
    const multActive = state.decisionMultExpiry && Date.now() < state.decisionMultExpiry;
    if (rate) {
      const displayRate = multActive ? state.rate * (state.decisionMult || 1) : state.rate;
      rate.textContent = fmtRate(displayRate);
      rate.classList.toggle('has-production', state.rate > 0);
      rate.classList.toggle('rate-boosted', !!multActive);
    }
    if (badge) {
      badge.classList.toggle('hidden', !multActive);
    }

    const acts = document.getElementById('acts');
    if (acts) acts.textContent = state.totalClicks.toLocaleString('en-US');

    const convLine = document.getElementById('conviction-line');
    const convVal  = document.getElementById('conviction-value');
    const achCount = (state.achievements || []).length;
    if (achCount > 0) {
      if (convLine) convLine.classList.remove('hidden');
      if (convVal)  convVal.textContent = '+' + (achCount * 2) + '%';
    }
  }

  // ===== Progress =====
  const WIN_TARGET = 1e9;

  function updateProgress(state) {
    const v = Math.min(state.resistance / WIN_TARGET, 1);
    const fill = document.getElementById('progress-fill');
    const pct = document.getElementById('progress-percent');
    const sub = document.getElementById('progress-sub');
    if (fill) fill.style.width = (v * 100).toFixed(2) + '%';
    if (pct)  pct.textContent  = (v * 100).toFixed(v < 0.1 ? 3 : 1) + '%';
    if (sub)  sub.textContent  = fmt(Math.floor(state.resistance)) + ' / ' + fmt(WIN_TARGET) + ' Resistance';
  }

  // ===== Milestone Ticker =====
  let _typewriterTimer = null;

  function setMilestoneText(text) {
    const el = document.getElementById('milestone-text');
    if (!el) return;
    clearInterval(_typewriterTimer);
    el.textContent = '';
    let i = 0;
    _typewriterTimer = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) clearInterval(_typewriterTimer);
    }, 28);
  }

  function refreshMilestone(state) {
    if (!Array.isArray(MILESTONES)) return;
    let active = null;
    for (const m of MILESTONES) {
      if (state.maxResistance >= m.at) active = m;
    }
    const text = active ? active.text : 'Gather the first voices.';
    const el = document.getElementById('milestone-text');
    if (el && el.textContent !== text) setMilestoneText(text);
  }

  // ===== Click switch hint =====
  function updateSwitchHint(state) {
    const el    = document.getElementById('switch-hint');
    const badge = document.getElementById('click-boost-badge');
    const boostActive = state.clickBoostExpiry && Date.now() < state.clickBoostExpiry;

    if (el) {
      const effective = state.clickPower * (boostActive ? (state.clickBoostMult || 1) : 1);
      el.textContent = effective > 1 ? `Click for +${fmt(effective)}` : 'Click for +1';
      el.classList.toggle('hint-boosted', !!boostActive);
    }
    if (badge) badge.classList.toggle('hidden', !boostActive);
  }

  // ===== Particle on click =====
  function spawnParticle(x, y, value) {
    const wrap = document.querySelector('.switch-wrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const p = document.createElement('div');
    p.className = 'float-particle';
    p.textContent = '+' + fmt(value);
    p.style.left = (x - rect.left) + 'px';
    p.style.top  = (y - rect.top) + 'px';
    wrap.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }

  // ===== Tooltip =====
  const tipEl = () => document.getElementById('tooltip');

  function showTooltip(html, x, y) {
    const t = tipEl();
    if (!t) return;
    t.innerHTML = html;
    t.classList.remove('hidden');
    const rect = t.getBoundingClientRect();
    let nx = x + 14;
    let ny = y + 14;
    if (nx + rect.width  > window.innerWidth  - 8) nx = x - rect.width  - 14;
    if (ny + rect.height > window.innerHeight - 8) ny = y - rect.height - 14;
    t.style.left = nx + 'px';
    t.style.top  = ny + 'px';
  }

  function hideTooltip() {
    const t = tipEl();
    if (t) t.classList.add('hidden');
  }

  // ===== Save indicator =====
  let saveTimer = null;
  function flashSave() {
    const el = document.getElementById('save-indicator');
    if (!el) return;
    el.classList.add('saving');
    const text = el.querySelector('.save-text');
    if (text) text.textContent = 'Saving…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      el.classList.remove('saving');
      if (text) text.textContent = 'Saved';
    }, 700);
  }

  // ===== Upgrades count =====
  function updateUpgradesCount(state) {
    const el = document.getElementById('upgrades-count');
    if (!el) return;
    const total = UPGRADES.length;
    el.textContent = `${state.upgrades.length} / ${total}`;
  }

  // ===== Counter glitch =====
  function glitchCounter() {
    const el = document.getElementById('counter');
    if (!el) return;
    el.classList.add('glitching');
    setTimeout(() => el.classList.remove('glitching'), 450);
  }

  // ===== Toast notifications =====
  function toast(text, type = 'unlock') {
    pushEventLog(text, type);
  }

  // ===== Event Log (persistent list below decision panel) =====
  const MAX_LOG_ENTRIES = 3;

  function pushEventLog(text, type) {
    const list = document.getElementById('event-log-list');
    if (!list) return;

    const empty = list.querySelector('.event-log-empty');
    if (empty) empty.remove();

    const now = new Date();
    const hh  = String(now.getHours()).padStart(2, '0');
    const mm  = String(now.getMinutes()).padStart(2, '0');
    const ss  = String(now.getSeconds()).padStart(2, '0');

    const entry = document.createElement('div');
    entry.className = `event-entry event-entry-${type}`;
    entry.innerHTML = `<span class="event-time">${hh}:${mm}:${ss}</span><span class="event-text">${text}</span>`;
    list.prepend(entry);

    const all = list.querySelectorAll('.event-entry');
    if (all.length > MAX_LOG_ENTRIES) {
      all[all.length - 1].remove();
    }

    setTimeout(() => {
      if (!entry.isConnected) return;
      entry.style.overflow = 'hidden';
      const h = entry.getBoundingClientRect().height;
      entry.style.maxHeight = h + 'px';
      entry.offsetHeight;
      entry.style.transition = 'opacity 0.4s ease, transform 0.4s ease, max-height 0.35s ease 0.35s, padding-top 0.35s ease 0.35s, padding-bottom 0.35s ease 0.35s';
      entry.style.opacity = '0';
      entry.style.transform = 'translateX(20px)';
      entry.style.maxHeight = '0';
      entry.style.paddingTop = '0';
      entry.style.paddingBottom = '0';
      setTimeout(() => {
        entry.remove();
        if (!list.querySelector('.event-entry') && !list.querySelector('.event-log-empty')) {
          const emptyEl = document.createElement('div');
          emptyEl.className = 'event-log-empty';
          emptyEl.textContent = 'No events yet.';
          list.appendChild(emptyEl);
        }
      }, 780);
    }, 60000);
  }

  // ===== Wave indicator =====
  function updateWave(state) {
    const el = document.getElementById('wave-pill');
    if (!el) return;
    if ((state.prestige || 0) > 0) {
      el.textContent = `WAVE ${state.prestige + 1}`;
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  // ===== Achievements panel =====
  function updateAchievements(state) {
    const panel = document.getElementById('achievements-panel');
    if (!panel || typeof ACHIEVEMENTS === 'undefined') return;

    panel.innerHTML = ACHIEVEMENTS.map(a => {
      const earned = (state.achievements || []).includes(a.id);
      return `<div class="ach-cell ${earned ? 'earned' : 'locked'}">
        <div class="ach-header">
          <div class="ach-icon">${earned ? a.icon : '▓'}</div>
          <div class="ach-name">${earned ? a.name : '▓▓▓▓▓▓'}</div>
        </div>
        <div class="ach-desc">${earned ? a.desc : '???'}</div>
      </div>`;
    }).join('');
  }

  // ===== Stats panel =====
  function renderStats(state) {
    const panel = document.getElementById('stats-panel');
    if (!panel) return;

    const totalBuildings = Object.values(state.buildings || {}).reduce((a, b) => a + b, 0);
    const playMs   = state.totalPlaytime || 0;
    const playSecs = Math.floor(playMs / 1000);
    const playMins = Math.floor(playSecs / 60);
    const playHrs  = Math.floor(playMins / 60);
    const playtime = playHrs > 0
      ? `${playHrs}h ${playMins % 60}m`
      : playMins > 0
        ? `${playMins}m ${playSecs % 60}s`
        : `${playSecs}s`;

    const rows = [
      ['Peak Resistance',  fmt(Math.floor(state.maxResistance || 0))],
      ['Rate',                 fmtRate(state.rate || 0)],
      ['Total Clicks',         (state.totalClicks || 0).toLocaleString('en-US')],
      ['Operations Deployed',  totalBuildings.toLocaleString('en-US')],
      ['Breakthroughs',    (state.upgrades || []).length],
      ['Achievements',     (state.achievements || []).length + ' / ' + (typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS.length : '?')],
      ['Wave',             state.prestige || 0],
      ['Playtime',         playtime],
    ];

    panel.innerHTML = rows.map(([label, value]) =>
      `<div class="stat-row"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>`
    ).join('');
  }

  return {
    fmt, fmtCost, fmtRate,
    glitchCounter,
    toast,
    updateWave,
    updateAchievements, renderStats,
    updateCounter, updateProgress, updateSwitchHint,
    refreshMilestone,
    spawnParticle,
    showTooltip, hideTooltip,
    flashSave,
    updateUpgradesCount
  };
})();
