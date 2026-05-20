// Movement Strategy — Defector-funded meta-progression tree.
// Three paths of 6 nodes each (5 regular + 1 capstone).
// Unlocks after first prestige. Resets each wave; Defectors persist.
// Capstone requires all 5 non-capstone nodes in the same path.
const META_TREE = [
  // ===== PATH A: SABOTAGE (Active / Clicks) =====
  {
    id: 'tree_a1', path: 'a', slot: 1, isCapstone: false,
    name: 'Sleeper Cells',
    icon: '🕵️',
    desc: 'Dormant operatives. One signal and they all move.',
    effect: 'Click power +50%',
    cost: 5
  },
  {
    id: 'tree_a2', path: 'a', slot: 2, isCapstone: false,
    name: 'Day-zero Disclosure',
    icon: '💥',
    desc: 'Release everything at once. No warning.',
    effect: 'Critical hits deal ×8 instead of ×5',
    cost: 10
  },
  {
    id: 'tree_a3', path: 'a', slot: 3, isCapstone: false,
    name: 'Burn Notice',
    icon: '🔥',
    desc: 'The window widens. Strike while attention holds.',
    effect: 'Critical window extended to 6 seconds',
    cost: 20
  },
  {
    id: 'tree_a4', path: 'a', slot: 4, isCapstone: false,
    name: 'Bricked Servers',
    icon: '⚡',
    desc: 'Every intercepted signal is worth more.',
    effect: 'Phantom Nodes also grant +60s of production on capture',
    cost: 40
  },
  {
    id: 'tree_a5', path: 'a', slot: 5, isCapstone: false,
    name: 'Glass Datacenters',
    icon: '🏗️',
    desc: 'The larger the network, the harder each blow lands.',
    effect: 'Click power gains +1 per total building owned (bonus scales)',
    cost: 100
  },
  {
    id: 'tree_a6', path: 'a', slot: 6, isCapstone: true,
    name: 'Kill the Lights',
    icon: '🌑',
    desc: '10 rapid strikes in 2 seconds triggers a blackout — everything stops.',
    effect: '10 clicks in 2s → ×100 rate for 10s (once per wave)',
    cost: 300
  },

  // ===== PATH B: PROPAGANDA (Idle / Production) =====
  {
    id: 'tree_b1', path: 'b', slot: 1, isCapstone: false,
    name: 'Viral Loops',
    icon: '📣',
    desc: 'Content spreads faster than it can be removed.',
    effect: '+10% global production',
    cost: 5
  },
  {
    id: 'tree_b2', path: 'b', slot: 2, isCapstone: false,
    name: 'Trusted Voices',
    icon: '🤝',
    desc: 'Synergies between structures become far more potent.',
    effect: 'All synergy upgrade bonuses +50% more effective',
    cost: 10
  },
  {
    id: 'tree_b3', path: 'b', slot: 3, isCapstone: false,
    name: 'Counter-narrative',
    icon: '📢',
    desc: 'The framing shifts. Decision outcomes last longer.',
    effect: 'Field Decision success buffs last 60s instead of 45s',
    cost: 20
  },
  {
    id: 'tree_b4', path: 'b', slot: 4, isCapstone: false,
    name: 'Mass Conversion',
    icon: '🌐',
    desc: 'Critical mass is reached earlier. The threshold drops.',
    effect: 'Building milestones trigger 25 owned earlier',
    cost: 40
  },
  {
    id: 'tree_b5', path: 'b', slot: 5, isCapstone: false,
    name: 'Cultural Saturation',
    icon: '🎭',
    desc: 'Each achievement reflects deeper systemic change.',
    effect: 'Achievements grant +3% conviction instead of +2%',
    cost: 100
  },
  {
    id: 'tree_b6', path: 'b', slot: 6, isCapstone: true,
    name: 'Generational Turn',
    icon: '🌱',
    desc: 'The movement lives on even when no one is watching.',
    effect: 'Offline production efficiency 50% → 90%, time cap 4h → 16h',
    cost: 300
  },

  // ===== PATH C: DIPLOMACY (Meta / Structural) =====
  {
    id: 'tree_c1', path: 'c', slot: 1, isCapstone: false,
    name: 'Diplomatic Pouch',
    icon: '💼',
    desc: 'The next wave starts with existing resources.',
    effect: 'Start each new wave with 1M resistance',
    cost: 5
  },
  {
    id: 'tree_c2', path: 'c', slot: 2, isCapstone: false,
    name: 'Sympathetic Insider',
    icon: '🤫',
    desc: 'Allies already in place. The network begins at depth.',
    effect: 'Start each new wave with 10 of the first 5 operations',
    cost: 10
  },
  {
    id: 'tree_c3', path: 'c', slot: 3, isCapstone: false,
    name: 'Frozen Assets',
    icon: '❄️',
    desc: 'Seized records unlock faster than they can be destroyed.',
    effect: 'Dossiers compile 30% faster (Phase C)',
    cost: 20
  },
  {
    id: 'tree_c4', path: 'c', slot: 4, isCapstone: false,
    name: 'Backchannels',
    icon: '🔗',
    desc: 'Private agreements. Official deniability. Real leverage.',
    effect: 'Unlocks the Challenges system (Phase C)',
    cost: 40
  },
  {
    id: 'tree_c5', path: 'c', slot: 5, isCapstone: false,
    name: 'Treaty Architecture',
    icon: '📋',
    desc: 'Each milestone comes packaged with intelligence.',
    effect: '+1 Dossier per wave checkpoint reached (Phase C)',
    cost: 100
  },
  {
    id: 'tree_c6', path: 'c', slot: 6, isCapstone: true,
    name: 'Soft Power',
    icon: '🕊️',
    desc: 'Influence held in reserve multiplies faster.',
    effect: 'Unspent Defectors grant +2% production instead of +1%',
    cost: 300
  },
];
