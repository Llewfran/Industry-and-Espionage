/* Industry & Espionage — the Great Reveal scoring engine (Canon v1.9).
   Pure functions: give it what was recorded at the Reveal and it returns every score, the Iron Pacts,
   the Brass Torch and the order of the Formal Register. Used by the Chairman's device. */
(function (root) {
'use strict';

const CARDS = ['trade-agriculture','trade-medicine','influence-agriculture','influence-medicine','ore-weaponry','ore-currency','gold-weaponry','gold-currency',
  'food-agriculture','food-literacy','citizens-agriculture','citizens-literacy','timber-literacy','timber-weaponry','textile-literacy','textile-weaponry',
  'oil-currency','oil-medicine','exotics-currency','exotics-medicine','boom-time'];
const BOOM = 20;
const LAND_OF = { trade: 'ocean', influence: 'ocean', ore: 'mountain', gold: 'mountain', food: 'fields', citizens: 'fields',
  timber: 'forest', textile: 'forest', oil: 'desert', exotics: 'desert' };
const LANDS = ['ocean', 'mountain', 'fields', 'forest', 'desert'];

/* key, name, foundation (symbol: count), how it scores */
const INDUSTRIES = {
  banking:   { name: 'Banking', img: 'i_banking', need: { currency: 2, literacy: 1, influence: 1, exotics: 1 }, per: ['gold', 3] },
  cruise:    { name: 'Cruise Lines', img: 'i_cruise', need: { medicine: 1, currency: 1, trade: 1, food: 1, oil: 1 }, per: ['citizens', 3] },
  retail:    { name: 'Food Retail', img: 'i_retail', need: { agriculture: 1, currency: 1, literacy: 1, trade: 1, textile: 1 }, per: ['food', 3] },
  hotels:    { name: 'Hotels', img: 'i_hotels', need: { medicine: 1, literacy: 1, citizens: 1, timber: 1, textile: 1 }, per: ['exotics', 3] },
  fashion:   { name: 'Fashion', img: 'i_fashion', need: { agriculture: 2, trade: 2, gold: 1 }, per: ['textile', 4] },
  politics:  { name: 'Politics', img: 'i_politics', need: { literacy: 1, medicine: 2, trade: 1, citizens: 1 }, per: ['influence', 3] },
  oil:       { name: 'Oil & Gas', img: 'i_oil', need: { medicine: 1, weaponry: 2, timber: 1, ore: 1 }, per: ['oil', 3] },
  property:  { name: 'Property Development', img: 'i_property', need: { agriculture: 2, gold: 1, trade: 1 }, pairs: 10 },
  news:      { name: 'Newspapers', img: 'i_news', news: true },
  weapons:   { name: 'Weapons Manufacture', img: 'i_weapons', need: { weaponry: 4, ore: 2, timber: 2, oil: 1, influence: 1 }, flat: 20 },
  trade:     { name: 'International Trade', img: 'i_trade', need: { agriculture: 1, currency: 2, literacy: 1, medicine: 1, trade: 1, ore: 1, food: 1, textile: 1, exotics: 1 }, flat: 20 },
  wonder:    { name: 'Industrial Wonder', img: 'i_wonder', wonder: true, flat: 25 },
  phil:      { name: 'Philanthropist', img: 'i_phil', phil: true }
};
/* the Philanthropist's target by table size (canon v1.9) */
const PHIL = { 4: 19, 5: 21, 6: 24, 7: 24, 8: 25, 9: 26, 10: 28 };
const PHIL_TARGET = p => PHIL[p] || (p < 4 ? 19 : 28);
/* at 6 players or fewer International Trade and the Industrial Wonder stay in the box (canon v1.9) */
const inPlay = p => Object.keys(INDUSTRIES).filter(k => !(p <= 6 && (k === 'trade' || k === 'wonder')));
const BLOCKS = [['trade', 'wonder'], ['retail', 'fashion'], ['hotels', 'cruise'], ['property', 'news'], ['politics', 'weapons'], ['oil', 'banking']];
const validPair = (a, b) => BLOCKS.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
const face = c => { const [r, d] = CARDS[c].split('-'); return { kind: 'face', r, d, land: LAND_OF[r], c }; };

/* turn the recorded line into what each card counts as: Boom Time copies the card before it (chains included);
   first in the line it is blank. In the Wonder's line each entry is a Land (left Land-side up) or a face. */
function resolve(line, wonder){
  const out = []; let prev = null;
  for (const e of line) {
    let it;
    if (e.land) it = { kind: 'land', land: e.land };
    else if (e.c === BOOM) {
      if (!prev || prev.kind === 'blank') it = { kind: 'blank' };
      else if (wonder && e.as === 'land') it = { kind: 'land', land: prev.land };
      else if (prev.kind === 'face') it = Object.assign({}, prev);
      else it = { kind: 'blank' };            // a Boom read as a face, after a card left Land-side up: its face was never shown
      it.boom = true;
    } else it = face(e.c);
    out.push(it); prev = it;
  }
  return out;
}

function scoreOne(w, players){
  const ind = INDUSTRIES[w.ind]; if (!ind) return null;
  const items = resolve(w.line || [], !!ind.wonder), sym = {};
  for (const it of items) if (it.kind === 'face') { sym[it.r] = (sym[it.r] || 0) + 1; sym[it.d] = (sym[it.d] || 0) + 1; }
  const cards = (w.line || []).length + (w.wh && w.wh.total || 0);
  const r = { ind: w.ind, name: ind.name, items, sym, cards, base: 0, cal: 0, failed: false, missing: [], note: '' };
  if (ind.phil) {
    const target = PHIL_TARGET(players);
    r.base = Math.max(0, target - cards);
    r.note = target + ' − ' + cards + ' cards';
    r.final = r.base; return r;                                    // the Philanthropist counts cards only: no calamities
  }
  if (ind.wonder) {
    const lands = new Set(items.filter(i => i.kind === 'land').map(i => i.land));
    const devs = new Set(items.filter(i => i.kind === 'face').map(i => i.d));
    LANDS.forEach(l => { if (!lands.has(l)) r.missing.push(l[0].toUpperCase() + l.slice(1) + ' (Land)'); });
    ['medicine', 'agriculture', 'literacy', 'currency', 'weaponry'].forEach(d => { if (!devs.has(d)) r.missing.push(d[0].toUpperCase() + d.slice(1)); });
    r.failed = r.missing.length > 0; r.base = r.failed ? 0 : 25;
  } else if (ind.news) {
    const L = sym.literacy || 0; r.base = L >= 9 ? 23 : L >= 7 ? 17 : L >= 5 ? 11 : L >= 3 ? 5 : 0; r.note = L + ' Literacy';
  } else {
    for (const [s, n] of Object.entries(ind.need)) { const have = sym[s] || 0; if (have < n) r.missing.push((n - have > 1 ? (n - have) + ' × ' : '') + s[0].toUpperCase() + s.slice(1)); }
    r.failed = r.missing.length > 0;
    if (r.failed) r.base = 0;
    else if (ind.flat) r.base = ind.flat;
    else if (ind.pairs) { const p = Math.min(sym.timber || 0, sym.ore || 0); r.base = 10*p + 1; r.note = p + ' Timber + Ore pairs, +1 foundation'; }
    else { const n = sym[ind.per[0]] || 0; r.base = ind.per[1]*n + 1; r.note = n + ' ' + ind.per[0][0].toUpperCase() + ind.per[0].slice(1) + ' × ' + ind.per[1] + ', +1 foundation'; }
  }
  const wh = w.wh || {};
  r.cal = (wh.war || 0)*(w.ind === 'weapons' ? 2 : -2) - 3*(wh.dep || 0) - (wh.theft || 0);
  r.final = Math.max(0, r.base + r.cal);                           // the zero floor
  return r;
}

/* everything: individual scores, Iron Pacts, the Brass Torch and the Formal Register's order */
function scoreAll(W, pacts, players, torchPick){
  const S = {};
  for (const [seat, w] of Object.entries(W)) { const r = scoreOne(w, players); if (r) S[seat] = r; }
  // Iron Pacts: only the six Trade Blocks count; both partners receive the combined total, or both 0
  const P = [];
  for (const p of pacts || []) {
    const a = S[p.a], b = S[p.b]; if (!a || !b) continue;
    const ok = validPair(a.ind, b.ind), total = (a.final === 0 || b.final === 0) ? 0 : a.final + b.final;
    P.push({ a: p.a, b: p.b, valid: ok, total });
    if (ok) { a.pact = b.pact = { with: null, total }; a.pact.with = +p.b; S[p.b].pact = { with: +p.a, total }; }
  }
  for (const r of Object.values(S)) r.score = r.pact ? r.pact.total : r.final;
  // groups: a valid pact is one group; everyone else stands alone
  const groups = []; const done = new Set();
  for (const [seat, r] of Object.entries(S)) {
    if (done.has(+seat)) continue;
    if (r.pact) { groups.push({ seats: [+seat, r.pact.with].sort((x, y) => x - y), score: r.score, pact: true, cards: r.cards + S[r.pact.with].cards }); done.add(+seat); done.add(r.pact.with); }
    else { groups.push({ seats: [+seat], score: r.score, pact: false, cards: r.cards }); done.add(+seat); }
  }
  // the Brass Torch: highest score; an individual beats an equal pact; then fewest cards; then a show of hands
  const top = Math.max(...groups.map(g => g.score));
  let contenders = groups.filter(g => g.score === top);
  if (contenders.some(g => !g.pact)) contenders = contenders.filter(g => !g.pact);
  const fewest = Math.min(...contenders.map(g => g.cards));
  contenders = contenders.filter(g => g.cards === fewest);
  let torch = null, hands = null;
  if (contenders.length === 1) torch = contenders[0];
  else if (torchPick) torch = contenders.find(g => g.seats.join() === torchPick.join()) || null;
  if (!torch) hands = contenders;                                   // the Chairman must call a show of hands
  // the Formal Register: lowest to highest, holding the winner and the runner-up back to the end
  const rank = g => [g.score, g === torch ? 1 : 0, g.pact ? 0 : 1, -g.cards];
  const sorted = groups.slice().sort((x, y) => { const a = rank(x), b = rank(y); for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; });
  let register = null;
  if (torch) {
    const rest = sorted.filter(g => g !== torch), second = rest[rest.length - 1];
    const before = rest.slice(0, -1);
    register = before.map(g => ({ kind: 'entry', group: g })).concat([{ kind: 'hold' }, { kind: 'torch', group: torch }, { kind: 'second', group: second }]);
  }
  return { S, P, groups, torch, hands, register };
}

root.IEScore = { CARDS, BOOM, LANDS, INDUSTRIES, BLOCKS, PHIL, PHIL_TARGET, inPlay, validPair, resolve, scoreOne, scoreAll };
})(typeof window !== 'undefined' ? window : globalThis);
