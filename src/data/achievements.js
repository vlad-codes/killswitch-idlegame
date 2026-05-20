// ACHIEVEMENTS — 60 collectibles tracking player milestones.
// Each check(state) returns true when the achievement should be earned.
// Depends on: BUILDINGS (from buildings.js, loaded first)
// Conviction: each earned achievement adds +2% to global production (see game.js).

const ACHIEVEMENTS = [

  // ── Resistance thresholds ──────────────────────────────────────────────────
  {
    id: 'first_click', icon: '✊', name: 'First Voice',
    desc: 'Make your first act of defiance.',
    check: s => s.totalClicks >= 1
  },
  {
    id: 'spark', icon: '⚡', name: 'Spark',
    desc: 'Reach 1,000 resistance.',
    check: s => s.maxResistance >= 1e3
  },
  {
    id: 'ten_thousand', icon: '📻', name: 'Local Signal',
    desc: 'Reach 10,000 resistance.',
    check: s => s.maxResistance >= 1e4
  },
  {
    id: 'fifty_thousand', icon: '🗞️', name: 'On the Map',
    desc: 'Reach 50,000 resistance.',
    check: s => s.maxResistance >= 5e4
  },
  {
    id: 'going_viral', icon: '📡', name: 'Going Viral',
    desc: 'Reach 100,000 resistance.',
    check: s => s.maxResistance >= 1e5
  },
  {
    id: 'half_million', icon: '📣', name: 'Can\'t Ignore This',
    desc: 'Reach 500,000 resistance.',
    check: s => s.maxResistance >= 5e5
  },
  {
    id: 'millionaire', icon: '🎙️', name: 'A Million Voices',
    desc: 'Reach 1,000,000 resistance.',
    check: s => s.maxResistance >= 1e6
  },
  {
    id: 'five_million', icon: '🗣️', name: 'National Story',
    desc: 'Reach 5,000,000 resistance.',
    check: s => s.maxResistance >= 5e6
  },
  {
    id: 'ten_million', icon: '📺', name: 'Prime Time',
    desc: 'Reach 10,000,000 resistance.',
    check: s => s.maxResistance >= 1e7
  },
  {
    id: 'fifty_million', icon: '🛰️', name: 'Global Reach',
    desc: 'Reach 50,000,000 resistance.',
    check: s => s.maxResistance >= 5e7
  },
  {
    id: 'hundred_million', icon: '🌏', name: 'Unstoppable Wave',
    desc: 'Reach 100,000,000 resistance.',
    check: s => s.maxResistance >= 1e8
  },
  {
    id: 'half_billion', icon: '🌐', name: 'Final Countdown',
    desc: 'Reach 500,000,000 resistance.',
    check: s => s.maxResistance >= 5e8
  },
  {
    id: 'billionaire', icon: '🌍', name: 'One in a Billion',
    desc: 'Reach 1,000,000,000 resistance.',
    check: s => s.maxResistance >= 1e9
  },
  {
    id: 'ten_billion', icon: '🔱', name: 'The Tide Turns',
    desc: 'Reach 10,000,000,000 resistance.',
    check: s => s.maxResistance >= 1e10
  },
  {
    id: 'hundred_billion', icon: '⚜️', name: 'Century of Resistance',
    desc: 'Reach 100,000,000,000 resistance.',
    check: s => s.maxResistance >= 1e11
  },
  {
    id: 'trillion', icon: '🏛️', name: 'The New World',
    desc: 'Force a worldwide moratorium. Reach 1,000,000,000,000 resistance.',
    check: s => s.maxResistance >= 1e12
  },

  // ── Production rate ────────────────────────────────────────────────────────
  {
    id: 'first_rate', icon: '💧', name: 'First Current',
    desc: 'Produce at least 1 resistance per second.',
    check: s => s.rate >= 1
  },
  {
    id: 'rate_hundred', icon: '🌊', name: 'Signal Boost',
    desc: 'Produce 100 resistance per second.',
    check: s => s.rate >= 100
  },
  {
    id: 'unstoppable', icon: '🚀', name: 'Unstoppable',
    desc: 'Produce 10,000 resistance per second.',
    check: s => s.rate >= 10000
  },
  {
    id: 'rate_hundred_k', icon: '⚡', name: 'Broadcast Power',
    desc: 'Produce 100,000 resistance per second.',
    check: s => s.rate >= 1e5
  },
  {
    id: 'rate_million', icon: '🔋', name: 'Viral Infrastructure',
    desc: 'Produce 1,000,000 resistance per second.',
    check: s => s.rate >= 1e6
  },
  {
    id: 'rate_hundred_m', icon: '☢️', name: 'Global Network',
    desc: 'Produce 100,000,000 resistance per second.',
    check: s => s.rate >= 1e8
  },

  // ── Buildings: total count ─────────────────────────────────────────────────
  {
    id: 'first_building', icon: '📰', name: 'The Pamphlet',
    desc: 'Purchase your first building.',
    check: s => Object.values(s.buildings).some(n => n >= 1)
  },
  {
    id: 'first_ten', icon: '🪧', name: 'Getting Organized',
    desc: 'Own 10 operations total.',
    check: s => Object.values(s.buildings).reduce((a, b) => a + b, 0) >= 10
  },
  {
    id: 'movement', icon: '✊', name: 'Critical Mass',
    desc: 'Own 100 operations total.',
    check: s => Object.values(s.buildings).reduce((a, b) => a + b, 0) >= 100
  },
  {
    id: 'mass_movement', icon: '🏙️', name: 'Mass Movement',
    desc: 'Own 250 operations total.',
    check: s => Object.values(s.buildings).reduce((a, b) => a + b, 0) >= 250
  },
  {
    id: 'army', icon: '🛡️', name: 'The Movement',
    desc: 'Own 500 operations total.',
    check: s => Object.values(s.buildings).reduce((a, b) => a + b, 0) >= 500
  },
  {
    id: 'legion', icon: '⚔️', name: 'Legion',
    desc: 'Own 1,000 operations total.',
    check: s => Object.values(s.buildings).reduce((a, b) => a + b, 0) >= 1000
  },

  // ── Buildings: breadth & depth ─────────────────────────────────────────────
  {
    id: 'full_spectrum', icon: '🌐', name: 'Full Network',
    desc: 'Own at least one of every operation.',
    check: s => BUILDINGS.every(b => (s.buildings[b.id] || 0) >= 1)
  },
  {
    id: 'fifty_deep', icon: '🎯', name: 'Committed',
    desc: 'Own 50 of any single operation.',
    check: s => Object.values(s.buildings).some(n => n >= 50)
  },
  {
    id: 'hundred_deep', icon: '💎', name: 'Relentless',
    desc: 'Own 100 of any single operation.',
    check: s => Object.values(s.buildings).some(n => n >= 100)
  },
  {
    id: 'diverse', icon: '🗺️', name: 'Diversified',
    desc: 'Own at least 5 of five different operation types.',
    check: s => Object.values(s.buildings).filter(n => n >= 5).length >= 5
  },

  // ── Clicks ─────────────────────────────────────────────────────────────────
  {
    id: 'century', icon: '💯', name: 'No Hesitation',
    desc: 'Make 100 acts of defiance.',
    check: s => s.totalClicks >= 100
  },
  {
    id: 'dedicated', icon: '🖱️', name: 'Dedicated',
    desc: 'Make 500 acts of defiance.',
    check: s => s.totalClicks >= 500
  },
  {
    id: 'obsessed', icon: '🔥', name: 'Obsessed',
    desc: 'Make 5,000 acts of defiance.',
    check: s => s.totalClicks >= 5000
  },
  {
    id: 'fanatic', icon: '💀', name: 'Fanatic',
    desc: 'Make 25,000 acts of defiance.',
    check: s => s.totalClicks >= 25000
  },
  {
    id: 'ten_k_clicks', icon: '🎮', name: 'Iron Will',
    desc: 'Make 10,000 acts of defiance.',
    check: s => s.totalClicks >= 10000
  },
  {
    id: 'hundred_k_clicks', icon: '🏅', name: 'The Click Heard \'Round the World',
    desc: 'Make 100,000 acts of defiance.',
    check: s => s.totalClicks >= 100000
  },

  // ── Upgrades ───────────────────────────────────────────────────────────────
  {
    id: 'first_upgrade', icon: '🔓', name: 'First Breakthrough',
    desc: 'Purchase your first upgrade.',
    check: s => s.upgrades.length >= 1
  },
  {
    id: 'five_upgrades', icon: '🔑', name: 'Growing Arsenal',
    desc: 'Purchase 5 upgrades.',
    check: s => s.upgrades.length >= 5
  },
  {
    id: 'fifteen_upgrades', icon: '🗝️', name: 'Well Equipped',
    desc: 'Purchase 15 upgrades.',
    check: s => s.upgrades.length >= 15
  },
  {
    id: 'true_believer', icon: '🏹', name: 'True Believer',
    desc: 'Purchase all base upgrades.',
    check: s => {
      const baseIds = UPGRADES.filter(u => u.kind === 'building' || u.kind === 'click').map(u => u.id);
      return baseIds.every(id => s.upgrades.includes(id));
    }
  },
  {
    id: 'all_click_upgrades', icon: '📢', name: 'Full Voice',
    desc: 'Own all click power upgrades.',
    check: s => UPGRADES.filter(u => u.kind === 'click').every(u => s.upgrades.includes(u.id))
  },
  {
    id: 'click_power_100', icon: '🔊', name: 'Amplified',
    desc: 'Reach 100 click power.',
    check: s => (s.clickPower || 1) >= 100
  },
  {
    id: 'click_power_10k', icon: '📯', name: 'Deafening',
    desc: 'Reach 10,000 click power.',
    check: s => (s.clickPower || 1) >= 10000
  },

  // ── Prestige ───────────────────────────────────────────────────────────────
  {
    id: 'second_wave', icon: '🌊', name: 'Second Wave',
    desc: 'Launch the Second Wave.',
    check: s => (s.prestige || 0) >= 1
  },
  {
    id: 'veteran', icon: '🏴', name: 'Veteran',
    desc: 'Launch 3 waves of resistance.',
    check: s => (s.prestige || 0) >= 3
  },
  {
    id: 'wave_five', icon: '🌀', name: 'Recurring Wave',
    desc: 'Launch 5 waves of resistance.',
    check: s => (s.prestige || 0) >= 5
  },
  {
    id: 'decade', icon: '🔟', name: 'The Decade',
    desc: 'Launch 10 waves of resistance.',
    check: s => (s.prestige || 0) >= 10
  },

  // ── Playtime ───────────────────────────────────────────────────────────────
  {
    id: 'long_game', icon: '⌛', name: 'The Long Game',
    desc: 'Accumulate 5 hours of total playtime.',
    check: s => (s.totalPlaytime || 0) >= 5 * 3600000
  },
  {
    id: 'one_hour', icon: '🕐', name: 'In It for Real',
    desc: 'Accumulate 1 hour of total playtime.',
    check: s => (s.totalPlaytime || 0) >= 3600000
  },
  {
    id: 'ten_hours', icon: '🕙', name: 'Long Hauler',
    desc: 'Accumulate 10 hours of total playtime.',
    check: s => (s.totalPlaytime || 0) >= 10 * 3600000
  },
  {
    id: 'twenty_four_hours', icon: '🌅', name: 'Around the Clock',
    desc: 'Accumulate 24 hours of total playtime.',
    check: s => (s.totalPlaytime || 0) >= 24 * 3600000
  },

  // ── Special ────────────────────────────────────────────────────────────────
  {
    id: 'speedrun', icon: '⏱️', name: 'Speed Run',
    desc: 'Reach 1 billion resistance in under 90 minutes.',
    check: s => s.maxResistance >= 1e9 && (Date.now() - s.startedAt) < 90 * 60000
  },
  {
    id: 'persistence', icon: '🌙', name: 'Persistence',
    desc: 'Return to the movement after 2+ hours away.',
    check: s => s.hadLongOffline === true
  },
  {
    id: 'conviction_25', icon: '🌱', name: 'Conviction',
    desc: 'Earn 25 achievements.',
    check: s => (s.achievements || []).length >= 25
  },
  {
    id: 'conviction_50', icon: '🔰', name: 'Unbreakable',
    desc: 'Earn 50 achievements.',
    check: s => (s.achievements || []).length >= 50
  },
  {
    id: 'completionist', icon: '🏆', name: 'Completionist',
    desc: 'Earn all other achievements.',
    check: s => ACHIEVEMENTS.filter(a => a.id !== 'completionist').every(a => (s.achievements || []).includes(a.id))
  },
];
