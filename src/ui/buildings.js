// Renders the buildings list, upgrades grid, buy multiplier, next-unlock preview.
const BuildingsUI = (() => {

  // ===== BUY MULTIPLIER =====
  let buyMult = 1;
  const VALID_MULTS = [1, 10, 100, 'max'];

  // ===== UNLOCK TRACKING (for toast notifications) =====
  let _knownBuildings = null; // null = not yet initialized
  let _upgradesInitialized = false;

  function resetTracking() {
    _knownBuildings = null;
    _upgradesInitialized = false;
  }

  function setBuyMult(v) {
    buyMult = v;
    document.querySelectorAll('.bm-btn').forEach(btn => {
      btn.classList.toggle('active', String(btn.dataset.mult) === String(v));
    });
  }

  function getBuyMult() { return buyMult; }

  function initBuyMultButtons() {
    document.querySelectorAll('.bm-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = btn.dataset.mult;
        setBuyMult(m === 'max' ? 'max' : parseInt(m, 10));
      });
    });
  }

  // ===== BUILDINGS =====
  function renderBuildingsOnce() {
    const list = document.getElementById('buildings-list');
    if (!list || list.childElementCount) return;
    list.innerHTML = BUILDINGS.map(buildingMarkup).join('');

    list.querySelectorAll('.building').forEach(el => {
      const id = el.dataset.id;
      el.addEventListener('click', () => Game.buyBuilding(id, buyMult));
      el.addEventListener('mousemove', (e) => onBuildingHover(e, id));
      el.addEventListener('mouseleave', HUD.hideTooltip);
    });
  }

  function buildingMarkup(b) {
    return `
      <div class="building locked" data-id="${b.id}">
        <div class="b-icon">${b.icon}</div>
        <div class="b-body">
          <div class="b-top">
            <span class="b-name">${b.name}</span>
            <span class="b-price">${HUD.fmtCost(b.baseCost)} <span class="b-unit">R</span></span>
          </div>
          <div class="b-bot">
            <span class="b-gain"><span class="b-arrow">→</span> ${HUD.fmtRate(b.baseRate)}</span>
            <span class="b-owned">0 owned</span>
          </div>
        </div>
      </div>`;
  }

  // First two buildings always visible. Later ones unlock once previous owned ≥ 1
  // or max Resistance ever held ≥ 50% of base cost.
  function isBuildingVisible(b, idx, state) {
    if (idx <= 1) return true;
    const prev = BUILDINGS[idx - 1];
    const prevOwned = state.buildings[prev.id] || 0;
    if (prevOwned >= 1) return true;
    if (state.maxResistance >= b.baseCost * 0.5) return true;
    return false;
  }

  function buyAmount(b, owned, available) {
    if (buyMult === 'max') {
      return Math.max(0, buildingMaxAffordable(b, owned, available));
    }
    return buyMult;
  }

  function refreshBuildings(state) {
    // Initialize known set on first call — no toasts for already-visible buildings
    if (_knownBuildings === null) {
      _knownBuildings = new Set();
      BUILDINGS.forEach((b, idx) => {
        if (isBuildingVisible(b, idx, state)) _knownBuildings.add(b.id);
      });
    }

    BUILDINGS.forEach((b, idx) => {
      const card = document.querySelector(`.building[data-id="${b.id}"]`);
      if (!card) return;

      const visible = isBuildingVisible(b, idx, state);
      if (!visible) {
        card.classList.add('locked');
        card.classList.remove('affordable', 'unaffordable');
        return;
      }
      card.classList.remove('locked');

      if (!_knownBuildings.has(b.id)) {
        _knownBuildings.add(b.id);
        HUD.toast(`New operation available: ${b.name}`, 'unlock');
      }

      const owned = state.buildings[b.id] || 0;
      const n = Math.max(1, buyAmount(b, owned, state.resistance));
      const totalCost = buildingBulkCost(b, owned, n);
      const canAfford = state.resistance >= totalCost && n >= 1;
      const displayCost = (buyMult === 'max' && n === 0)
        ? buildingCost(b, owned)
        : totalCost;
      const displayN = (buyMult === 'max' && n === 0) ? 1 : n;

      card.classList.toggle('affordable', canAfford);
      card.classList.toggle('unaffordable', !canAfford);

      // Top row: name + price
      const priceEl = card.querySelector('.b-price');
      const multSuffix = displayN > 1 ? `<span class="b-mult">×${displayN}</span>` : '';
      priceEl.innerHTML = `${HUD.fmtCost(displayCost)} <span class="b-unit">R</span>${multSuffix}`;
      priceEl.classList.toggle('can-afford', canAfford);
      priceEl.classList.toggle('cannot-afford', !canAfford);

      // Bottom row: what you GAIN by buying + owned count
      const perUnitRate = Game.getBuildingRate(b.id);
      const gainPerBuy = perUnitRate * displayN;
      const gainEl = card.querySelector('.b-gain');
      const ownedEl = card.querySelector('.b-owned');
      gainEl.innerHTML = '<span class="b-arrow">→</span> ' + HUD.fmtRate(gainPerBuy);
      ownedEl.textContent = owned + ' owned';
      ownedEl.classList.toggle('has-some', owned > 0);
    });

    refreshNextUnlock(state);
  }

  function refreshNextUnlock(state) {
    const el = document.getElementById('next-unlock');
    if (!el) return;
    const idx = BUILDINGS.findIndex((b, i) => !isBuildingVisible(b, i, state));
    if (idx === -1) {
      el.classList.add('hidden');
      return;
    }
    const next = BUILDINGS[idx];
    const need = Math.ceil(next.baseCost * 0.5);
    el.classList.remove('hidden');
    el.innerHTML = `
      <div class="next-unlock-icon">${next.icon}</div>
      <div class="next-unlock-text">
        <span class="next-unlock-title">Up next</span>
        <div class="next-unlock-body">At <strong>${HUD.fmt(need)} R</strong>, <strong>${next.name}</strong> unlocks.</div>
      </div>
    `;
  }

  function onBuildingHover(e, id) {
    const b = BUILDINGS.find(x => x.id === id);
    if (!b) return;
    const state = Game.getState();
    const owned = state.buildings[id] || 0;
    const n = Math.max(1, buyAmount(b, owned, state.resistance));
    const totalCost = buildingBulkCost(b, owned, n);
    const canAfford = state.resistance >= totalCost && n >= 1;
    const perUnitRate = Game.getBuildingRate(id);
    const currentTotal = perUnitRate * owned;
    const gainPerBuy = perUnitRate * n;
    const totalRate = state.rate;
    const sharePct = totalRate > 0 ? (currentTotal / totalRate) * 100 : 0;

    const currentBlock = owned > 0
      ? `<div class="tt-section">
           <span class="tt-label">Owned</span>
           <div>${owned}× active · generating <strong>+${HUD.fmt(currentTotal)}/s</strong></div>
           <div class="tt-meta">${sharePct.toFixed(1)}% of total resistance</div>
         </div>`
      : `<div class="tt-section">
           <span class="tt-label">Owned</span>
           <div class="tt-meta">None yet. Produces ${HUD.fmt(perUnitRate)}/s each.</div>
         </div>`;

    const buyBlock = `
      <div class="tt-section tt-buy ${canAfford ? 'can-afford' : 'cannot-afford'}">
        <span class="tt-label">Buy ${n > 1 ? `(${n}×)` : ''}</span>
        <div class="tt-buy-row">
          <span class="tt-price">${HUD.fmtCost(totalCost)} R</span>
          <span class="tt-gain">→ +${HUD.fmt(gainPerBuy)}/s</span>
        </div>
      </div>`;

    const html = `
      <span class="tt-title">${b.icon} ${b.name}</span>
      <div class="tt-desc">${b.flavor}</div>
      ${currentBlock}
      ${buyBlock}
    `;
    HUD.showTooltip(html, e.clientX, e.clientY);
  }

  // ===== UPGRADES =====
  function isUpgradeVisible(u, state) {
    if (state.upgrades.includes(u.id)) return true;
    if (u.kind === 'building') {
      return (state.buildings[u.buildingId] || 0) >= u.unlockOwned;
    }
    if (u.kind === 'click') {
      return state.totalClicks >= u.unlockClicks;
    }
    return false;
  }

  function refreshUpgrades(state) {
    const grid = document.getElementById('upgrades-grid');
    const empty = document.getElementById('upgrades-empty');
    if (!grid) return;

    let anyVisible = false;

    UPGRADES.forEach(u => {
      const visible = isUpgradeVisible(u, state);
      const id = 'upg-' + u.id;
      let cell = document.getElementById(id);

      if (!visible) {
        if (cell) cell.remove();
        return;
      }

      anyVisible = true;
      const bought = state.upgrades.includes(u.id);
      const canAfford = !bought && state.resistance >= u.cost;

      if (!cell) {
        if (_upgradesInitialized && !bought) {
          HUD.toast(`Breakthrough unlocked: ${u.name}`, 'unlock');
        }
        cell = document.createElement('div');
        cell.id = id;
        cell.className = 'upgrade-cell';
        cell.textContent = u.icon;
        cell.dataset.id = u.id;
        cell.addEventListener('click', () => Game.buyUpgrade(u.id));
        cell.addEventListener('mousemove', (e) => onUpgradeHover(e, u.id));
        cell.addEventListener('mouseleave', HUD.hideTooltip);
        grid.appendChild(cell);
      }

      cell.classList.toggle('affordable', canAfford);
      cell.classList.toggle('bought', bought);
    });

    empty.classList.toggle('hidden', anyVisible);
    grid.classList.toggle('hidden', !anyVisible);
    _upgradesInitialized = true;
  }

  function onUpgradeHover(e, id) {
    const u = UPGRADES.find(x => x.id === id);
    if (!u) return;
    const state = Game.getState();
    const bought = state.upgrades.includes(u.id);
    const canAfford = state.resistance >= u.cost;

    const html = `
      <span class="tt-title">${u.icon} ${u.name}</span>
      <div class="tt-desc">${u.desc}</div>
      ${u.effect ? `<div class="tt-effect">↑ ${u.effect}</div>` : ''}
      ${bought
        ? `<div class="tt-active">✓ Active</div>`
        : `<div class="tt-section tt-buy ${canAfford ? 'can-afford' : 'cannot-afford'}" style="margin-top:0;padding-top:0;border-top:none;">
             <span class="tt-label">Cost</span>
             <div class="tt-buy-row">
               <span class="tt-price">${HUD.fmtCost(u.cost)} R</span>
             </div>
           </div>`}
    `;
    HUD.showTooltip(html, e.clientX, e.clientY);
  }

  return {
    renderBuildingsOnce, refreshBuildings,
    refreshUpgrades,
    initBuyMultButtons, setBuyMult, getBuyMult,
    resetTracking
  };
})();
