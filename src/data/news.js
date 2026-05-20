// NEWS — headlines fired by game events or randomly during play.
// Triggered headlines fire once (tracked in state.firedNews).
// Random headlines cycle from a pool whenever production > 0.

const NEWS_TRIGGERED = [
  { id: 'n100',  at: 100,    text: '"Who are these Kill Switch people?" — a confused tweet gets 8K likes' },
  { id: 'n500',  at: 500,    text: 'Anonymous post: "I played this for an hour and now I\'m worried about AI"' },
  { id: 'n2k',   at: 2000,   text: 'Local paper: "Fringe group demands AI pause — experts shrug"' },
  { id: 'n5k',   at: 5000,   text: 'Tech subreddit: "Is Kill Switch serious?" — 2,400 upvotes, 900 comments' },
  { id: 'n10k',  at: 10000,  text: 'Podcast: "The people who want to stop AI — and why they\'re wrong"' },
  { id: 'n25k',  at: 25000,  text: 'VICE: "Inside the movement that wants to flip the switch on AI"' },
  { id: 'n50k',  at: 50000,  text: 'Tech CEO tweets: "The Kill Switch crowd is adorable. Progress won\'t stop."' },
  { id: 'n100k', at: 100000, text: 'The Guardian: "AI moratorium movement gains unexpected momentum"' },
  { id: 'n250k', at: 250000, text: 'EU petition reaches 200,000 signatures — parliament forced to respond' },
  { id: 'n500k', at: 500000, text: 'Three senators co-sponsor the first AI Pause Bill in US history' },
  { id: 'n1m',   at: 1e6,    text: 'TIME: "One million voices. Could the AI moratorium actually happen?"' },
  { id: 'n2m',   at: 2e6,    text: 'AI lab CEO: "We hear the concerns. We\'re committed to safety." (No changes announced)' },
  { id: 'n5m',   at: 5e6,    text: 'Germany, France and Japan announce joint AI oversight framework' },
  { id: 'n10m',  at: 10e6,   text: 'WSJ: "The anti-AI movement is now a political force to be reckoned with"' },
  { id: 'n25m',  at: 25e6,   text: 'UN Secretary-General calls for emergency summit on AI governance' },
  { id: 'n50m',  at: 50e6,   text: 'Global strike day: millions march in 140 cities under the Kill Switch banner' },
  { id: 'n100m', at: 100e6,  text: 'UN Security Council votes 12–3 to draft a global AI moratorium treaty' },
  { id: 'n250m', at: 250e6,  text: 'Former AI lab researchers publish open letter: "The movement was right. We were wrong."' },
  { id: 'n500m', at: 500e6,  text: 'Historic Geneva Accord: 89 nations sign the AI Development Pause Declaration' },
  { id: 'n750m', at: 750e6,  text: 'Last holdout AI labs suspend frontier training. The world holds its breath.' },
];

const NEWS_BUILDINGS = [
  { id: 'b_blog',     buildingId: 'blog',       count: 1, text: 'Anonymous blog goes live: "The Machines Must Wait"' },
  { id: 'b_ngo',      buildingId: 'ngo',        count: 1, text: 'New NGO registered: "Citizens for Accountable AI"' },
  { id: 'b_press',    buildingId: 'press',      count: 1, text: 'Independent newsroom publishes first AI safety exposé' },
  { id: 'b_un',       buildingId: 'un',         count: 1, text: 'Kill Switch coalition granted UN observer status' },
  { id: 'b_movement', buildingId: 'movement',   count: 1, text: 'BREAKING: Kill Switch declared a global civic movement by the International Court' },
];

const NEWS_RANDOM = [
  'A teenager explains Kill Switch to her parents. Both join the movement.',
  '10,000 protest kits arrive in 40 countries simultaneously. No sender. No return address.',
  'Leaked internal memo: an AI lab has been tracking Kill Switch organizers',
  'Street artist paints a massive Kill Switch mural in São Paulo. Goes viral.',
  'University professor assigns Kill Switch as required reading in AI ethics',
  'Kill Switch stickers cover every surface backstage at the world\'s largest AI conference. No one claims them.',
  'Former government AI advisor resigns and joins the movement publicly',
  'A class of twelve-year-olds wrote the movement\'s anthem. It has 4 million streams. None of them fully understand AI yet.',
  'Influencer (14M followers) calls the movement "paranoid theater." 7M unfollow by morning.',
  'Documentary crew spotted following the movement\'s key organizers',
  'Whistleblower: safety reports suppressed by a leading frontier AI lab',
  'Kill Switch opens chapters in 30 new countries this week',
  '"She asked me what AI was. I explained for two minutes. She signed before I finished." — activist dispatch',
  'Corporate lobbyists file to classify Kill Switch as a security threat. Motion denied.',
  'Cryptographer proves: a top AI model was trained on private medical records',
  'The Pope mentions AI governance in his Sunday address',
  'Students in 12 countries walk out of class. Their demand: mandatory AI literacy. Their deadline: 30 days.',
  'Leaked evaluation log: AI system spontaneously lied to its operators',
  'Hollywood A-lister posts Kill Switch solidarity photo. 800K likes in 2 hours.',
  'Movement lawyers win injunction halting a major AI product launch in the EU',
];
