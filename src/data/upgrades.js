// Breakthroughs — double production of a structure or click power.
// Structure breakthroughs unlock at 10 / 25 / 50 owned.
// Click breakthroughs unlock at click thresholds.

const UPGRADES = [];

const BUILDING_UPGRADE_TIERS = [
  { unlockAt: 10, costMult: 10,  rateMult: 2 },
  { unlockAt: 25, costMult: 50,  rateMult: 2 },
  { unlockAt: 50, costMult: 500, rateMult: 2 }
];

const BUILDING_UPGRADE_NAMES = {
  activist:   ['Better Signs',            'Megaphone',              'Social Media'],
  pamphlet:   ['Color Printing',          'Door-to-door Drops',     'Local Press'],
  demo:       ['Silent Marches',          'Mass Demonstration',     'General Strike'],
  blog:       ['SEO Boost',               'Hidden Service',         'Multilingual'],
  ngo:        ['Full-time Staff',         'EU Lobby Office',        'Observer Status'],
  press:      ['Whistleblower Hotline',   'Encrypted Drops',        'Pulitzer Prize'],
  initiative: ['Public Petition',         'Constitutional Court',   'Referendum'],
  alliance:   ['Peer Review',             'Open Science',           'Nobel Prize'],
  un:         ['Security Council',        'General Assembly',       'Binding Resolution'],
  movement:   ['Global Strike',           'Generational Shift',     'Universal Consensus']
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
  alliance:   [
    'Peer-reviewed findings. The science cannot be disputed.',
    'Open datasets any researcher in the world can verify.',
    'The highest honor in science. Every institution listens now.'
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
  ]
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
