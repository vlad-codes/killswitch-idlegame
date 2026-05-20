// Movement structures — auto-generators of Resistance.
// Each grows the movement from a single voice to a global force.
// Cost scales per-building costGrowth exponent (lower tiers smoother, higher tiers 1.15×).
const BUILDINGS = [
  {
    id: 'activist',
    icon: '✊',
    name: 'Lone Voice',
    flavor: 'One person. One sign. A beginning.',
    baseCost: 15,
    baseRate: 0.1,
    costGrowth: 1.12
  },
  {
    id: 'pamphlet',
    icon: '📰',
    name: 'Pamphlet Press',
    flavor: 'A thousand arguments, in every hand.',
    baseCost: 100,
    baseRate: 1,
    costGrowth: 1.13
  },
  {
    id: 'demo',
    icon: '🪧',
    name: 'Street Protests',
    flavor: 'Every Saturday. Reliable. Loud.',
    baseCost: 1100,
    baseRate: 8,
    costGrowth: 1.14
  },
  {
    id: 'blog',
    icon: '💻',
    name: 'Underground Blog',
    flavor: 'Written anonymously. Read everywhere.',
    baseCost: 12000,
    baseRate: 47,
    costGrowth: 1.15
  },
  {
    id: 'ngo',
    icon: '🏛️',
    name: 'Foundation',
    flavor: 'Finally full-time against the machines.',
    baseCost: 130000,
    baseRate: 260,
    costGrowth: 1.15
  },
  {
    id: 'press',
    icon: '📡',
    name: 'Investigative Newsroom',
    flavor: 'Leaks now reach the world directly.',
    baseCost: 1400000,
    baseRate: 1400,
    costGrowth: 1.15
  },
  {
    id: 'initiative',
    icon: '⚖️',
    name: 'Citizen Initiative',
    flavor: 'A million signatures, and counting.',
    baseCost: 20000000,
    baseRate: 7800,
    costGrowth: 1.15
  },
  {
    id: 'whistleblower',
    icon: '🕵️',
    name: 'Whistleblower Network',
    flavor: 'Protected. Anonymous. Unstoppable.',
    baseCost: 130000000,
    baseRate: 22000,
    costGrowth: 1.15
  },
  {
    id: 'alliance',
    icon: '🔬',
    name: 'Research Alliance',
    flavor: 'Science has finally reached consensus.',
    baseCost: 330000000,
    baseRate: 44000,
    costGrowth: 1.15
  },
  {
    id: 'church',
    icon: '⛪',
    name: 'Ethical Order',
    flavor: 'Two billion people with one moral voice.',
    baseCost: 2000000000,
    baseRate: 110000,
    costGrowth: 1.15
  },
  {
    id: 'un',
    icon: '🌐',
    name: 'UN Resolution',
    flavor: 'The first joint decision of all nations.',
    baseCost: 5100000000,
    baseRate: 260000,
    costGrowth: 1.15
  },
  {
    id: 'constellation',
    icon: '🛰️',
    name: 'Satellite Constellation',
    flavor: 'Every corner of the Earth, in the loop.',
    baseCost: 18000000000,
    baseRate: 640000,
    costGrowth: 1.15
  },
  {
    id: 'movement',
    icon: '🌍',
    name: 'Global Movement',
    flavor: 'Eight billion people, one single no.',
    baseCost: 75000000000,
    baseRate: 1600000,
    costGrowth: 1.15
  },
  {
    id: 'convergence',
    icon: '🌊',
    name: 'Human Convergence',
    flavor: 'Seven billion minds. One shared decision.',
    baseCost: 500000000000,
    baseRate: 8000000,
    costGrowth: 1.15
  }
];

const COST_GROWTH = 1.15;

function buildingCost(b, owned) {
  const r = b.costGrowth || COST_GROWTH;
  return Math.ceil(b.baseCost * Math.pow(r, owned));
}

function buildingBulkCost(b, owned, n) {
  if (n <= 0) return 0;
  const r = b.costGrowth || COST_GROWTH;
  const a = b.baseCost * Math.pow(r, owned);
  return Math.ceil(a * (Math.pow(r, n) - 1) / (r - 1));
}

function buildingMaxAffordable(b, owned, budget) {
  if (budget <= 0) return 0;
  const r = b.costGrowth || COST_GROWTH;
  const a = b.baseCost * Math.pow(r, owned);
  const limit = budget * (r - 1) / a + 1;
  if (limit <= 1) return 0;
  return Math.floor(Math.log(limit) / Math.log(r));
}
