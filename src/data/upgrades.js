// Breakthroughs — multiply production of a structure or click power.
// Structure breakthroughs (kind:'building') unlock at 10 / 25 / 50 owned — must be purchased.
// Milestone multipliers  (kind:'milestone') unlock at 100/150/200/300/450/600 owned — free, auto-granted.
// Click breakthroughs    (kind:'click')     unlock at click count thresholds.

const UPGRADES = [];

const BUILDING_UPGRADE_TIERS = [
  { unlockAt: 10, costMult: 10,  rateMult: 2 },
  { unlockAt: 25, costMult: 50,  rateMult: 2 },
  { unlockAt: 50, costMult: 500, rateMult: 2 }
];

const BUILDING_UPGRADE_NAMES = {
  activist:      ['Better Signs',          'Megaphone',              'Social Media'],
  pamphlet:      ['Color Printing',        'Door-to-door Drops',     'Local Press'],
  demo:          ['Silent Marches',        'Mass Demonstration',     'General Strike'],
  blog:          ['SEO Boost',             'Hidden Service',         'Multilingual'],
  ngo:           ['Full-time Staff',       'EU Lobby Office',        'Observer Status'],
  press:         ['Whistleblower Hotline', 'Encrypted Drops',        'Pulitzer Prize'],
  initiative:    ['Public Petition',       'Constitutional Court',   'Referendum'],
  whistleblower: ['Encrypted Channels',   'Global Network',         'Protected Sources'],
  alliance:      ['Peer Review',           'Open Science',           'Nobel Prize'],
  church:        ['Pastoral Outreach',     'Interfaith Coalition',   'Moral Authority'],
  un:            ['Security Council',      'General Assembly',       'Binding Resolution'],
  movement:      ['Global Strike',         'Generational Shift',     'Universal Consensus'],
  constellation: ['Low Orbit',             'Global Relay',           'Mesh Network'],
  convergence:   ['Shared Protocols',      'Unified Platform',       'One Signal'],
};

// Flavor text — the story behind each breakthrough.
const BUILDING_UPGRADE_DESC = {
  activist:   [
    'More visible on the street. Legible from a block away.',
    'Volume wins arguments. One voice becomes a crowd.',
    'TikTok and X reshape the reach overnight.'
  ],
  pamphlet:   [
    'Color draws the eye before words reach the mind.',
    'No mailbox left untouched. Direct to every door.',
    'The story lands in actual print. People save it.'
  ],
  demo:       [
    'Silence creates unease. The police don\'t know how to react.',
    'An entire city district stops for one afternoon.',
    'Coordinated nationally. No train moves. No shift starts.'
  ],
  blog:       [
    'The algorithm finally works in the movement\'s favor.',
    'Mirror sites and Tor relays. Cannot be taken down.',
    'Translated into 40 languages. The message is everywhere.'
  ],
  ngo:        [
    'Salaries, not just passion. The operation grows serious.',
    'A physical office two blocks from the European Parliament.',
    'Official standing at international negotiations.'
  ],
  press:      [
    'Insiders finally have somewhere safe to go.',
    'End-to-end encrypted. Sources stay fully protected.',
    'International recognition opens every door.'
  ],
  initiative: [
    'A million signatures delivered to every legislature.',
    'The constitutional court is forced to rule on AI governance.',
    'The people vote directly. The outcome cannot be ignored.'
  ],
  whistleblower: [
    'Messages that vanish. Sources that survive.',
    'A relay in every country. Nothing can be silenced.',
    'Legal protection, global reach, zero exposure.'
  ],
  alliance:   [
    'Peer-reviewed findings. The science cannot be disputed.',
    'Open datasets any researcher in the world can verify.',
    'The highest honor in science. Every institution listens now.'
  ],
  church:     [
    'Sermons that reach the unchurched through community.',
    'Hundreds of traditions, one shared ethical line.',
    'Moral weight that moves governments.'
  ],
  un:         [
    'A permanent seat on the Security Council.',
    '193 nations must respond. Abstention is not neutral.',
    'Binding under international law. Violations carry consequences.'
  ],
  movement:   [
    'A coordinated global strike. All sectors. All countries.',
    'A generation grows up with this as the baseline.',
    'Every nation, every culture, every voice — aligned.'
  ],
  constellation: [
    'A dozen satellites. Enough to cover the poles.',
    'Continuous global uplink. No blackout zones.',
    'Every device, every person, one shared mesh.'
  ],
  convergence: [
    'Open standards let every platform interoperate.',
    'One interface. Billions of users.',
    'A single coordinated signal across the human network.'
  ],
};

BUILDINGS.forEach(b => {
  BUILDING_UPGRADE_TIERS.forEach((tier, i) => {
    UPGRADES.push({
      id:          `${b.id}_t${i + 1}`,
      kind:        'building',
      icon:        b.icon,
      name:        BUILDING_UPGRADE_NAMES[b.id][i],
      desc:        BUILDING_UPGRADE_DESC[b.id][i],
      effect:      `Doubles the output of every ${b.name}`,
      cost:        b.baseCost * tier.costMult,
      buildingId:  b.id,
      buildingName: b.name,
      rateMult:    tier.rateMult,
      unlockOwned: tier.unlockAt
    });
  });
});

// Milestone multipliers — auto-granted when owned count crosses threshold (no cost).
const MILESTONE_TIERS = [
  { unlockAt: 100, rateMult: 2, label: 'Tipping Point'  },
  { unlockAt: 150, rateMult: 2, label: 'Movement Status' },
  { unlockAt: 200, rateMult: 3, label: 'Mainstream'      },
  { unlockAt: 300, rateMult: 3, label: 'Institutional'   },
  { unlockAt: 450, rateMult: 3, label: 'Generational'    },
  { unlockAt: 600, rateMult: 4, label: 'Inevitable'      },
];

BUILDINGS.forEach(b => {
  MILESTONE_TIERS.forEach((tier, i) => {
    UPGRADES.push({
      id:           `${b.id}_m${i + 1}`,
      kind:         'milestone',
      icon:         b.icon,
      name:         `${b.name}: ${tier.label}`,
      desc:         `Reached ${tier.unlockAt} ${b.name}s. The network has critical mass.`,
      effect:       `×${tier.rateMult} output for every ${b.name}`,
      cost:         0,
      buildingId:   b.id,
      buildingName: b.name,
      rateMult:     tier.rateMult,
      unlockOwned:  tier.unlockAt
    });
  });
});

const CLICK_UPGRADES = [
  {
    id: 'click1', name: 'Clipboard', icon: '📋',
    desc:   'Notes for every encounter. No conversation left empty-handed.',
    effect: 'Each act of defiance now generates +5 resistance',
    cost: 500, clickPower: 5, unlockClicks: 100
  },
  {
    id: 'click2', name: 'Megaphone', icon: '📣',
    desc:   'Your voice carries further than you thought possible.',
    effect: 'Each act of defiance now generates +25 resistance',
    cost: 5000, clickPower: 25, unlockClicks: 500
  },
  {
    id: 'click3', name: 'Podcast', icon: '🎙️',
    desc:   'One episode reaches thousands who never saw a protest sign.',
    effect: 'Each act of defiance now generates +100 resistance',
    cost: 50000, clickPower: 100, unlockClicks: 2000
  },
  {
    id: 'click4', name: 'Stage', icon: '🎤',
    desc:   'Live, in front of an audience. Every word lands harder.',
    effect: 'Each act of defiance now generates +500 resistance',
    cost: 500000, clickPower: 500, unlockClicks: 5000
  },
  {
    id: 'click5', name: 'TV Studio', icon: '📺',
    desc:   'Primetime. Millions watching at once.',
    effect: 'Each act of defiance now generates +2,500 resistance',
    cost: 5000000, clickPower: 2500, unlockClicks: 10000
  },
  {
    id: 'click6', name: 'Stadium', icon: '🏟️',
    desc:   'Tens of thousands on their feet. The whole world is watching.',
    effect: 'Each act of defiance now generates +10,000 resistance',
    cost: 50000000, clickPower: 10000, unlockClicks: 25000
  },
  {
    id: 'click7', name: 'Documentary', icon: '🎬',
    desc:   'A film that rewrites the narrative. Seen by hundreds of millions.',
    effect: 'Each act of defiance now generates +50,000 resistance',
    cost: 500000000, clickPower: 50000, unlockClicks: 50000
  },
  {
    id: 'click8', name: 'Cultural Force', icon: '🌊',
    desc:   'The movement has become the default. Resistance is the new normal.',
    effect: 'Each act of defiance now generates +250,000 resistance',
    cost: 5000000000, clickPower: 250000, unlockClicks: 100000
  }
];

CLICK_UPGRADES.forEach(u => {
  UPGRADES.push({
    id:          u.id,
    kind:        'click',
    icon:        u.icon,
    name:        u.name,
    desc:        u.desc,
    effect:      u.effect,
    cost:        u.cost,
    clickPower:  u.clickPower,
    unlockClicks: u.unlockClicks
  });
});

// Synergy upgrades — unlock at ≥15 of BOTH buildings; each gives +0.05% output per partner owned.
const SYNERGY_PAIRS = [
  { id: 'syn_activist_pamphlet',     a: 'activist',     b: 'pamphlet',     name: 'Door-to-door',          icon: '🤝',  desc: 'On-the-ground voices pair with printed material. Each multiplies the other\'s reach.' },
  { id: 'syn_demo_blog',             a: 'demo',         b: 'blog',         name: 'Livestream the March',   icon: '📲',  desc: 'Every protest gets filmed. Every video gets read. The loop keeps expanding.' },
  { id: 'syn_ngo_press',             a: 'ngo',          b: 'press',        name: 'Embedded Journalists',   icon: '🗞️', desc: 'Foundations fund the reporters. Reporters protect the foundations. Symbiosis.' },
  { id: 'syn_initiative_alliance',   a: 'initiative',   b: 'alliance',     name: 'Evidence-based Law',     icon: '📜',  desc: 'Scientific consensus becomes the basis for every ballot initiative.' },
  { id: 'syn_whistleblower_press',   a: 'whistleblower',b: 'press',        name: 'Source Pipeline',        icon: '🔐',  desc: 'Protected leakers feed directly into the newsroom. Stories flow faster.' },
  { id: 'syn_church_un',             a: 'church',       b: 'un',           name: 'Moral Mandate',          icon: '⚖️',  desc: 'Religious institutions give UN resolutions ethical weight governments can\'t ignore.' },
  { id: 'syn_movement_constellation',a: 'movement',     b: 'constellation',name: 'Mesh Broadcast',         icon: '📡',  desc: 'Ground networks relay satellite signals. A truly resilient global infrastructure.' },
  { id: 'syn_convergence_movement',  a: 'convergence',  b: 'movement',     name: 'One Signal',             icon: '🌊',  desc: 'The convergence platform amplifies every voice the movement has built.' },
];

SYNERGY_PAIRS.forEach(pair => {
  const bA = BUILDINGS.find(b => b.id === pair.a);
  const bB = BUILDINGS.find(b => b.id === pair.b);
  if (!bA || !bB) return;
  const cost = Math.min(bA.baseCost, bB.baseCost) * 50;
  UPGRADES.push({
    id:              pair.id,
    kind:            'synergy',
    icon:            pair.icon,
    name:            pair.name,
    desc:            pair.desc,
    effect:          `+0.05% output per partner owned — ${bA.name} ↔ ${bB.name}`,
    cost:            cost,
    synA:            pair.a,
    synB:            pair.b,
    unlockOwnedEach: 15
  });
});
