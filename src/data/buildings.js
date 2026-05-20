// Movement structures — auto-generators of Resistance.
// Each grows the movement from a single voice to a global force.
// Cost scales 1.15× per unit purchased.
const BUILDINGS = [
  {
    id: 'activist',
    icon: '✊',
    name: 'Lone Voice',
    flavor: 'One person. One sign. A beginning.',
    baseCost: 15,
    baseRate: 0.1
  },
  {
    id: 'pamphlet',
    icon: '📰',
    name: 'Pamphlet Press',
    flavor: 'A thousand arguments, in every hand.',
    baseCost: 100,
    baseRate: 1
  },
  {
    id: 'demo',
    icon: '🪧',
    name: 'Street Protests',
    flavor: 'Every Saturday. Reliable. Loud.',
    baseCost: 1100,
    baseRate: 8
  },
  {
    id: 'blog',
    icon: '💻',
    name: 'Underground Blog',
    flavor: 'Written anonymously. Read everywhere.',
    baseCost: 12000,
    baseRate: 47
  },
  {
    id: 'ngo',
    icon: '🏛️',
    name: 'Foundation',
    flavor: 'Finally full-time against the machines.',
    baseCost: 130000,
    baseRate: 260
  },
  {
    id: 'press',
    icon: '📡',
    name: 'Investigative Newsroom',
    flavor: 'Leaks now reach the world directly.',
    baseCost: 1400000,
    baseRate: 1400
  },
  {
    id: 'initiative',
    icon: '⚖️',
    name: 'Citizen Initiative',
    flavor: 'A million signatures, and counting.',
    baseCost: 20000000,
    baseRate: 7800
  },
  {
    id: 'alliance',
    icon: '🔬',
    name: 'Research Alliance',
    flavor: 'Science has finally reached consensus.',
    baseCost: 330000000,
    baseRate: 44000
  },
  {
    id: 'un',
    icon: '🌐',
    name: 'UN Resolution',
    flavor: 'The first joint decision of all nations.',
    baseCost: 5100000000,
    baseRate: 260000
  },
  {
    id: 'movement',
    icon: '🌍',
    name: 'Global Movement',
    flavor: 'Eight billion people, one single no.',
    baseCost: 75000000000,
    baseRate: 1600000
  }
];

const COST_GROWTH = 1.15;

function buildingCost(b, owned) {
  return Math.ceil(b.baseCost * Math.pow(COST_GROWTH, owned));
}

function buildingBulkCost(b, owned, n) {
  if (n <= 0) return 0;
  const r = COST_GROWTH;
  const a = b.baseCost * Math.pow(r, owned);
  return Math.ceil(a * (Math.pow(r, n) - 1) / (r - 1));
}

function buildingMaxAffordable(b, owned, budget) {
  if (budget <= 0) return 0;
  const r = COST_GROWTH;
  const a = b.baseCost * Math.pow(r, owned);
  const limit = budget * (r - 1) / a + 1;
  if (limit <= 1) return 0;
  return Math.floor(Math.log(limit) / Math.log(r));
}
