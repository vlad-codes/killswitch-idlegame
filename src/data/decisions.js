// Field Decision scenarios — branching choices with building-biased outcomes.
// Each scenario has:
//   aKind / bKind: 'rate' (×2.5 rate, 45s) or 'click' (×3 click power, 45s)
//   aBuildingId / bBuildingId: which building's count biases success probability
//     successChance = clamp(0.15 + owned/50, 0.15, 0.85)
// On failure: consolation = 60s of current production added instantly.
// Cascade (5% chance): both bonuses fire for 20s simultaneously.
const DECISIONS = [
  {
    situation: 'A lab insider has internal safety reports showing capability gains far beyond what\'s been published. They want the movement to release everything immediately.',
    a: 'Publish now — maximum impact',
    aKind: 'click', aBuildingId: 'press',
    b: 'Verify first — wait 48 hours',
    bKind: 'rate', bBuildingId: 'alliance'
  },
  {
    situation: 'A tech billionaire offers €40M in funding. His last company was accused of harvesting user data without consent. The board is split.',
    a: 'Accept — the cause needs resources',
    aKind: 'rate', aBuildingId: 'ngo',
    b: 'Decline — we can\'t be bought',
    bKind: 'click', bBuildingId: 'activist'
  },
  {
    situation: 'A major newspaper wants an exclusive inside look at movement operations. Their AI coverage has been neutral — not friendly, not hostile.',
    a: 'Grant full access',
    aKind: 'rate', aBuildingId: 'press',
    b: 'Stay quiet — keep ops dark',
    bKind: 'click', bBuildingId: 'blog'
  },
  {
    situation: 'A frontier AI lab offers to implement a third-party audit board in exchange for the movement publicly cooling rhetoric for six months.',
    a: 'Negotiate the terms',
    aKind: 'rate', aBuildingId: 'initiative',
    b: 'Reject — it\'s a delay tactic',
    bKind: 'click', bBuildingId: 'demo'
  },
  {
    situation: 'A whistleblower\'s hard drive is encrypted with a forgotten passphrase. A private firm offers to crack it for $80k — no questions asked.',
    a: 'Pay the firm — time is critical',
    aKind: 'click', aBuildingId: 'ngo',
    b: 'Wait for volunteer cryptographers',
    bKind: 'rate', bBuildingId: 'alliance'
  },
  {
    situation: 'A planned rally in Brussels has been denied a permit. Organisers want to proceed underground. Legal exposure is real but manageable.',
    a: 'Go underground — show up anyway',
    aKind: 'click', aBuildingId: 'demo',
    b: 'Reschedule — protect the people',
    bKind: 'rate', bBuildingId: 'initiative'
  },
  {
    situation: 'A hacker collective claims they can expose an AI lab\'s private evaluation logs. They want formal movement backing before acting.',
    a: 'Partner with them — we need the intel',
    aKind: 'click', aBuildingId: 'blog',
    b: 'Keep distance — too much legal risk',
    bKind: 'rate', bBuildingId: 'ngo'
  },
  {
    situation: 'A senator offers to co-sponsor an AI Oversight Bill, but only if the movement endorses her re-election campaign publicly.',
    a: 'Endorse — get the bill passed',
    aKind: 'rate', aBuildingId: 'initiative',
    b: 'Refuse — we stay non-partisan',
    bKind: 'click', bBuildingId: 'activist'
  },
  {
    situation: 'A coordinated disinformation campaign is flooding social media claiming Kill Switch is secretly funded by rival tech corporations.',
    a: 'Counter loudly — release financials',
    aKind: 'click', aBuildingId: 'press',
    b: 'Ignore it — engagement feeds it',
    bKind: 'rate', bBuildingId: 'ngo'
  },
  {
    situation: 'A senior AI safety researcher at a top lab wants to defect and join the movement. Their inside knowledge could be decisive.',
    a: 'Recruit them immediately',
    aKind: 'rate', aBuildingId: 'alliance',
    b: 'Keep them in place as a source',
    bKind: 'click', bBuildingId: 'blog'
  },
  {
    situation: 'Leaked model weights from a frontier lab appear on a darknet forum. A movement affiliate has a copy. Publishing them would prove the capability claims.',
    a: 'Publish — the public deserves to know',
    aKind: 'click', aBuildingId: 'press',
    b: 'Destroy the copy — too dangerous',
    bKind: 'rate', bBuildingId: 'ngo'
  },
  {
    situation: 'Intelligence suggests a corporate mole has infiltrated a local chapter. Exposing them publicly would be dramatic — but could also be wrong.',
    a: 'Expose publicly with evidence',
    aKind: 'click', aBuildingId: 'demo',
    b: 'Monitor quietly and gather more',
    bKind: 'rate', bBuildingId: 'blog'
  },
  {
    situation: 'An international AI governance conference has offered a keynote slot. Several AI companies are also presenting. Walking out is an option.',
    a: 'Attend and challenge from the stage',
    aKind: 'click', aBuildingId: 'press',
    b: 'Boycott — don\'t legitimise the forum',
    bKind: 'rate', bBuildingId: 'initiative'
  },
  {
    situation: 'Two movement factions are in open conflict over strategy. A mediator has proposed a binding merger agreement. Some leaders will resign if it passes.',
    a: 'Force the merger — unity is strength',
    aKind: 'rate', aBuildingId: 'ngo',
    b: 'Let it play out — no forced hands',
    bKind: 'click', bBuildingId: 'activist'
  },
  {
    situation: 'A global celebrity with 80M followers wants to endorse the movement but has previously promoted AI-generated content without disclosure.',
    a: 'Accept the endorsement — reach matters',
    aKind: 'click', aBuildingId: 'press',
    b: 'Vet them further before committing',
    bKind: 'rate', bBuildingId: 'alliance'
  },
  {
    situation: 'Law enforcement in three countries issued informal warnings about movement communications being monitored. A secure infrastructure upgrade costs 6 weeks of downtime.',
    a: 'Upgrade now — security first',
    aKind: 'rate', aBuildingId: 'blog',
    b: 'Stay online — momentum can\'t pause',
    bKind: 'click', bBuildingId: 'demo'
  },
  {
    situation: 'A local chapter in Jakarta is fundraising through methods that violate movement policy. Shutting them down costs a foothold in Southeast Asia.',
    a: 'Shut them down — rules are rules',
    aKind: 'rate', aBuildingId: 'initiative',
    b: 'Let it slide — regional growth matters',
    bKind: 'click', bBuildingId: 'activist'
  },
  {
    situation: 'A documentarian wants to follow movement leadership for six months. The film would air before the next major legislative vote.',
    a: 'Say yes — public narrative is everything',
    aKind: 'click', aBuildingId: 'press',
    b: 'Too exposed — decline',
    bKind: 'rate', bBuildingId: 'ngo'
  },
  {
    situation: 'An allied movement in South Korea is facing a government crackdown. They\'re requesting movement funds and public solidarity statements.',
    a: 'Send funds and speak loudly',
    aKind: 'click', aBuildingId: 'demo',
    b: 'Express support but protect the treasury',
    bKind: 'rate', bBuildingId: 'un'
  },
  {
    situation: 'A movement server holds communications from the past two years. A court has issued a discovery order. Compliance vs. destruction is now on the table.',
    a: 'Comply — we have nothing to hide',
    aKind: 'rate', aBuildingId: 'initiative',
    b: 'Purge — protect our people',
    bKind: 'click', bBuildingId: 'blog'
  }
];
