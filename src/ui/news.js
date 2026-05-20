// Manages the Field Reports news panel — triggered and random headlines.
const NewsUI = (() => {

  const MAX_LOG = 5;
  let lastRandom = 0;
  let nextRandomDelay = 0;

  function randomDelay() {
    return 60000 + Math.random() * 60000; // 60–120 seconds
  }

  function elapsedLabel(state) {
    const ms = Date.now() - (state.startedAt || Date.now());
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function push(state, text) {
    state.newsLog = state.newsLog || [];
    state.newsLog.push({ text, t: elapsedLabel(state) });
    if (state.newsLog.length > MAX_LOG) state.newsLog.shift();
    renderLog(state.newsLog, true);
  }

  function renderLog(log, animateLast) {
    const el = document.getElementById('news-log');
    if (!el) return;

    if (!log || log.length === 0) {
      el.innerHTML = '<div class="news-empty">No reports yet. Start the movement.</div>';
      return;
    }

    el.innerHTML = log.map((item, i) => {
      const isNew = animateLast && i === log.length - 1;
      return `<div class="news-item${isNew ? ' news-enter' : ''}">
        <span class="news-time">${item.t}</span>
        <span class="news-text">${item.text}</span>
      </div>`;
    }).join('');
  }

  function check(state, now) {
    state.firedNews = state.firedNews || [];
    state.newsLog   = state.newsLog   || [];

    // Resistance-triggered headlines
    NEWS_TRIGGERED.forEach(n => {
      if (!state.firedNews.includes(n.id) && state.maxResistance >= n.at) {
        state.firedNews.push(n.id);
        push(state, n.text);
      }
    });

    // Building-triggered headlines
    NEWS_BUILDINGS.forEach(n => {
      if (!state.firedNews.includes(n.id) && (state.buildings[n.buildingId] || 0) >= n.count) {
        state.firedNews.push(n.id);
        push(state, n.text);
      }
    });

    // Random headlines — only during active production
    if (state.rate > 0) {
      if (lastRandom === 0) {
        lastRandom = now;
        nextRandomDelay = randomDelay();
      }
      if (now - lastRandom >= nextRandomDelay) {
        const text = NEWS_RANDOM[Math.floor(Math.random() * NEWS_RANDOM.length)];
        push(state, text);
        lastRandom = now;
        nextRandomDelay = randomDelay();
      }
    }
  }

  function init(state) {
    lastRandom = performance.now();
    nextRandomDelay = randomDelay();
    if (state.newsLog && state.newsLog.length > 0) {
      renderLog(state.newsLog, false);
    }
  }

  return { check, init, push };
})();
