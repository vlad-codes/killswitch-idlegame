// ACHIEVEMENTS — 20 collectibles tracking player milestones.
// Each check(state) returns true when the achievement should be earned.
// Depends on: BUILDINGS (from buildings.js, loaded first)

const ACHIEVEMENTS = [
  {
    id:   'first_click',
    icon: '✊',
    name: 'First Voice',
    desc: 'Make your first act of defiance.',
    check: s => s.totalClicks >= 1
  },
  {
    id:   'first_building',
    icon: '📰',
    name: 'The Pamphlet',
    desc: 'Purchase your first building.',
    check: s => Object.values(s.buildings).some(n => n >= 1)
  },
  {
    id:   'spark',
    icon: '⚡',
    name: 'Spark',
    desc: 'Reach 1,000 resistance.',
    check: s => s.maxResistance >= 1000
  },
  {
    id:   'going_viral',
    icon: '📡',
    name: 'Going Viral',
    desc: 'Reach 100,000 resistance.',
    check: s => s.maxResistance >= 100000
  },
  {
    id:   'millionaire',
    icon: '💰',
    name: 'Millionaire',
    desc: 'Reach 1,000,000 resistance.',
    check: s => s.maxResistance >= 1e6
  },
  {
    id:   'billionaire',
    icon: '🌍',
    name: 'One in a Billion',
    desc: 'Reach 1,000,000,000 resistance and trigger the moratorium.',
    check: s => s.maxResistance >= 1e9
  },
  {
    id:   'dedicated',
    icon: '🖱️',
    name: 'Dedicated',
    desc: 'Make 500 acts of defiance.',
    check: s => s.totalClicks >= 500
  },
  {
    id:   'obsessed',
    icon: '🔥',
    name: 'Obsessed',
    desc: 'Make 5,000 acts of defiance.',
    check: s => s.totalClicks >= 5000
  },
  {
    id:   'fanatic',
    icon: '💀',
    name: 'Fanatic',
    desc: 'Make 25,000 acts of defiance.',
    check: s => s.totalClicks >= 25000
  },
  {
    id:   'first_upgrade',
    icon: '🔓',
    name: 'First Breakthrough',
    desc: 'Purchase your first upgrade.',
    check: s => s.upgrades.length >= 1
  },
  {
    id:   'true_believer',
    icon: '⚔️',
    name: 'True Believer',
    desc: 'Purchase all 30 upgrades.',
    check: s => s.upgrades.length >= 30
  },
  {
    id:   'full_spectrum',
    icon: '🌐',
    name: 'Full Spectrum',
    desc: 'Own at least one of every operation.',
    check: s => BUILDINGS.every(b => (s.buildings[b.id] || 0) >= 1)
  },
  {
    id:   'movement',
    icon: '🪧',
    name: 'Movement',
    desc: 'Own 100 operations total.',
    check: s => Object.values(s.buildings).reduce((a, b) => a + b, 0) >= 100
  },
  {
    id:   'unstoppable',
    icon: '🚀',
    name: 'Unstoppable',
    desc: 'Produce 10,000 resistance per second.',
    check: s => s.rate >= 10000
  },
  {
    id:   'speedrun',
    icon: '⏱️',
    name: 'Speed Run',
    desc: 'Win in under 90 minutes.',
    check: s => s.maxResistance >= 1e9 && (Date.now() - s.startedAt) < 90 * 60000
  },
  {
    id:   'persistence',
    icon: '🌙',
    name: 'Persistence',
    desc: 'Return to the movement after 2+ hours away.',
    check: s => s.hadLongOffline === true
  },
  {
    id:   'second_wave',
    icon: '🌊',
    name: 'Second Wave',
    desc: 'Launch the Second Wave.',
    check: s => (s.prestige || 0) >= 1
  },
  {
    id:   'veteran',
    icon: '🏴',
    name: 'Veteran',
    desc: 'Launch 3 waves of resistance.',
    check: s => (s.prestige || 0) >= 3
  },
  {
    id:   'long_game',
    icon: '⌛',
    name: 'The Long Game',
    desc: 'Accumulate 5 hours of total playtime.',
    check: s => (s.totalPlaytime || 0) >= 5 * 3600000
  },
  {
    id:   'completionist',
    icon: '🏆',
    name: 'Completionist',
    desc: 'Earn all other 19 achievements.',
    check: s => ACHIEVEMENTS.filter(a => a.id !== 'completionist').every(a => (s.achievements || []).includes(a.id))
  },
];
