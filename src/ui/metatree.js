// Movement Strategy panel — Defector-funded meta-tree UI.
// Three paths: Sabotage (A), Propaganda (B), Diplomacy (C).
// Shown as a new center tab; hidden until first prestige.
const MetaTreeUI = (() => {

  const PATH_LABELS = { a: 'Sabotage', b: 'Propaganda', c: 'Diplomacy' };
  const PATH_ICONS  = { a: '⚡', b: '📢', c: '🕊️' };

  function render(state) {
    const panel = document.getElementById('strategy-panel');
    if (!panel) return;

    const prestige = state.prestige || 0;
    if (prestige === 0) {
      panel.innerHTML = `
        <div class="strategy-locked">
          <div class="strategy-locked-icon">🔒</div>
          <div class="strategy-locked-title">Movement Strategy</div>
          <div class="strategy-locked-body">Complete Wave 1 (reach 1T resistance) to unlock the Defector tree.</div>
        </div>`;
      return;
    }

    const earned    = Game.getDefectorsEarned(state);
    const available = Game.getDefectorsAvailable(state);
    const purchased = state.metaTreePurchased || [];

    const paths = ['a', 'b', 'c'];

    panel.innerHTML = `
      <div class="strategy-header">
        <div class="strategy-currency">
          <span class="strategy-currency-icon">🧩</span>
          <span class="strategy-currency-label">Defectors</span>
          <span class="strategy-currency-value">${available} available</span>
          <span class="strategy-currency-total">${earned} earned this wave</span>
        </div>
        <div class="strategy-passive">+${Math.min(500, available)}% production from unspent Defectors</div>
      </div>
      <div class="strategy-paths">
        ${paths.map(p => renderPath(p, state, purchased, available)).join('')}
      </div>
    `;

    panel.querySelectorAll('.meta-node[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        Game.buyMetaNode(el.dataset.id);
      });
      el.addEventListener('mousemove', (e) => onNodeHover(e, el.dataset.id, state));
      el.addEventListener('mouseleave', HUD.hideTooltip);
    });
  }

  function renderPath(path, state, purchased, available) {
    const nodes = META_TREE.filter(n => n.path === path);
    const capstone = nodes.find(n => n.isCapstone);
    const regular  = nodes.filter(n => !n.isCapstone);

    const allRegularDone = regular.every(n => purchased.includes(n.id));

    return `
      <div class="meta-path meta-path-${path}">
        <div class="meta-path-header">
          <span class="meta-path-icon">${PATH_ICONS[path]}</span>
          <span class="meta-path-name">${PATH_LABELS[path]}</span>
        </div>
        <div class="meta-path-nodes">
          ${regular.map(n => renderNode(n, purchased, available, false)).join('')}
        </div>
        ${capstone ? renderNode(capstone, purchased, available, !allRegularDone) : ''}
      </div>`;
  }

  function renderNode(node, purchased, available, capstoneBlocked) {
    const bought     = purchased.includes(node.id);
    const canAfford  = available >= node.cost && !bought && !capstoneBlocked;
    const blocked    = !bought && capstoneBlocked;

    let cls = 'meta-node';
    if (bought)    cls += ' meta-node-bought';
    else if (blocked) cls += ' meta-node-blocked';
    else if (canAfford) cls += ' meta-node-affordable';

    return `
      <div class="${cls}" data-id="${node.id}">
        <div class="meta-node-icon">${node.icon}</div>
        <div class="meta-node-name">${node.name}</div>
        <div class="meta-node-cost">${bought ? '✓' : (blocked ? '🔒' : node.cost + ' D')}</div>
        ${node.isCapstone ? '<div class="meta-node-capstone-badge">CAPSTONE</div>' : ''}
      </div>`;
  }

  function onNodeHover(e, nodeId, state) {
    const node = META_TREE.find(n => n.id === nodeId);
    if (!node) return;
    const purchased = state.metaTreePurchased || [];
    const available = Game.getDefectorsAvailable(state);
    const bought    = purchased.includes(node.id);
    const canAfford = available >= node.cost;

    const capstoneBlocked = node.isCapstone && !META_TREE
      .filter(n => n.path === node.path && !n.isCapstone)
      .every(n => purchased.includes(n.id));

    let status;
    if (bought) {
      status = `<div class="tt-active">✓ Active this wave</div>`;
    } else if (capstoneBlocked) {
      status = `<div class="tt-meta">🔒 Complete all 5 ${PATH_LABELS[node.path]} nodes first</div>`;
    } else {
      status = `<div class="tt-section tt-buy ${canAfford ? 'can-afford' : 'cannot-afford'}" style="margin-top:0;padding-top:0;border-top:none;">
        <span class="tt-label">Cost</span>
        <div class="tt-buy-row"><span class="tt-price">${node.cost} Defectors</span></div>
      </div>`;
    }

    const html = `
      <span class="tt-title">${node.icon} ${node.name}</span>
      <div class="tt-desc">${node.desc}</div>
      <div class="tt-effect">↑ ${node.effect}</div>
      ${status}
    `;
    HUD.showTooltip(html, e.clientX, e.clientY);
  }

  function refresh(state) {
    render(state);
  }

  function init(state) {
    render(state);
  }

  return { init, refresh };
})();
