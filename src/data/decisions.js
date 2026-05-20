// Field Decision scenarios — 50/50 gamble dressed as a strategic choice.
const DECISIONS = [
  {
    situation: 'A lab insider has internal safety reports showing capability gains far beyond what\'s been published. They want the movement to release everything immediately.',
    a: 'Publish now — maximum impact',
    b: 'Verify first — wait 48 hours'
  },
  {
    situation: 'A tech billionaire offers €40M in funding. His last company was accused of harvesting user data without consent. The board is split.',
    a: 'Accept — the cause needs resources',
    b: 'Decline — we can\'t be bought'
  },
  {
    situation: 'A major newspaper wants an exclusive inside look at movement operations. Their AI coverage has been neutral — not friendly, not hostile.',
    a: 'Grant full access',
    b: 'Stay quiet — keep ops dark'
  },
  {
    situation: 'A frontier AI lab offers to implement a third-party audit board in exchange for the movement publicly cooling rhetoric for six months.',
    a: 'Negotiate the terms',
    b: 'Reject — it\'s a delay tactic'
  },
  {
    situation: 'A whistleblower\'s hard drive is encrypted with a forgotten passphrase. A private firm offers to crack it for $80k — no questions asked.',
    a: 'Pay the firm — time is critical',
    b: 'Wait for volunteer cryptographers'
  },
  {
    situation: 'A planned rally in Brussels has been denied a permit. Organisers want to proceed underground. Legal exposure is real but manageable.',
    a: 'Go underground — show up anyway',
    b: 'Reschedule — protect the people'
  },
  {
    situation: 'A hacker collective claims they can expose an AI lab\'s private evaluation logs. They want formal movement backing before acting.',
    a: 'Partner with them — we need the intel',
    b: 'Keep distance — too much legal risk'
  },
  {
    situation: 'A senator offers to co-sponsor an AI Oversight Bill, but only if the movement endorses her re-election campaign publicly.',
    a: 'Endorse — get the bill passed',
    b: 'Refuse — we stay non-partisan'
  },
  {
    situation: 'A coordinated disinformation campaign is flooding social media claiming Kill Switch is secretly funded by rival tech corporations.',
    a: 'Counter loudly — release financials',
    b: 'Ignore it — engagement feeds it'
  },
  {
    situation: 'A senior AI safety researcher at a top lab wants to defect and join the movement. Their inside knowledge could be decisive.',
    a: 'Recruit them immediately',
    b: 'Keep them in place as a source'
  },
  {
    situation: 'Leaked model weights from a frontier lab appear on a darknet forum. A movement affiliate has a copy. Publishing them would prove the capability claims.',
    a: 'Publish — the public deserves to know',
    b: 'Destroy the copy — too dangerous'
  },
  {
    situation: 'Intelligence suggests a corporate mole has infiltrated a local chapter. Exposing them publicly would be dramatic — but could also be wrong.',
    a: 'Expose publicly with evidence',
    b: 'Monitor quietly and gather more'
  },
  {
    situation: 'An international AI governance conference has offered a keynote slot. Several AI companies are also presenting. Walking out is an option.',
    a: 'Attend and challenge from the stage',
    b: 'Boycott — don\'t legitimise the forum'
  },
  {
    situation: 'Two movement factions are in open conflict over strategy. A mediator has proposed a binding merger agreement. Some leaders will resign if it passes.',
    a: 'Force the merger — unity is strength',
    b: 'Let it play out — no forced hands'
  },
  {
    situation: 'A global celebrity with 80M followers wants to endorse the movement but has previously promoted AI-generated content without disclosure.',
    a: 'Accept the endorsement — reach matters',
    b: 'Vet them further before committing'
  },
  {
    situation: 'Law enforcement in three countries issued informal warnings about movement communications being monitored. A secure infrastructure upgrade costs 6 weeks of downtime.',
    a: 'Upgrade now — security first',
    b: 'Stay online — momentum can\'t pause'
  },
  {
    situation: 'A local chapter in Jakarta is fundraising through methods that violate movement policy. Shutting them down costs a foothold in Southeast Asia.',
    a: 'Shut them down — rules are rules',
    b: 'Let it slide — regional growth matters'
  },
  {
    situation: 'A documentarian wants to follow movement leadership for six months. The film would air before the next major legislative vote.',
    a: 'Say yes — public narrative is everything',
    b: 'Too exposed — decline'
  },
  {
    situation: 'An allied movement in South Korea is facing a government crackdown. They\'re requesting movement funds and public solidarity statements.',
    a: 'Send funds and speak loudly',
    b: 'Express support but protect the treasury'
  },
  {
    situation: 'A movement server holds communications from the past two years. A court has issued a discovery order. Compliance vs. destruction is now on the table.',
    a: 'Comply — we have nothing to hide',
    b: 'Purge — protect our people'
  }
];
