/* Industry & Espionage — the Herald's Codex on a phone (canon v1.9).
   The printed Codex, rebuilt as chapters with tabs, large type and scrolling. Each printed page is a fragment
   with a hashed name (join/codex/<hash>.html), fetched only once the phone has earned it.
   Used by the player's phone (join/index.html) and by the PC test bench (join/preview.html → codex-test.html).
   Built by tools/build_codex_phone.py, which rewrites the PAGE map below. */
(function () {
'use strict';
const PAGE = {"6": "cad922f02bf0baa1", "7": "2531cf0322eb6224", "8": "05751ca26cf5f16b", "9": "e3233406e1d142cf", "10": "5d841c751ad10d77", "11": "67c8d975a259257d", "12": "2a77760d954086fd", "13": "471fff65793ec35d", "14": "5dd496415a3bdb81", "15": "45c8fbd63b27cae2", "16": "45b8d7f3d8b23ef7", "17": "71ac494897ea7de9", "18": "2748cb3eb1e8d405", "19": "4b9e342b728aac77", "20": "aac7de82fa5bfa8a", "21": "64602b6edf9bf904", "22": "55fc7ab0d908598f", "23": "93bd225d012b3b6b", "24": "7ac64eb9fed4bd5a", "25": "c9d6392b23ce5186", "26": "f3442d381288876e"};

/* the chapters, in the order the tabs show them; `until` is what a sealed tab says */
const CHAPTERS = [
  { id: 'score',  tab: 'Scoring',          title: 'Scoring Reference',              pages: [21], until: 'you leave the Port in Year One' },
  { id: 'lands',  tab: 'Lands',            title: 'What Each Land May Hide',        pages: [22], until: 'you leave the Port in Year One' },
  { id: 'port',   tab: 'Chamber & Port',   title: 'In the Chamber · In the Port',   pages: [23], until: 'you leave the Port in Year One' },
  { id: 'fm',     tab: 'Force Majeure',    title: 'Force Majeure',                  pages: [24, 25], until: 'the Honour of the Pin' },
  { id: 'decade', tab: 'The Decade',       title: 'The Shape of the Decade',        pages: [26], until: 'the Warning, in Year Three' },
  { id: 'p1',     tab: 'I · Welcome',      title: 'Proclamation I · The Welcome',   pages: [6, 7, 8, 9, 10], until: 'Year One opens' },
  { id: 'p2',     tab: 'II · The Pin',     title: 'Proclamation II · The Honour of the Pin', pages: [11, 12, 13, 14, 15], until: 'the end of Year One' },
  { id: 'p3',     tab: 'III · Warning',    title: 'Proclamation III · The Warning', pages: [16], until: 'Year Three' },
  { id: 'p4',     tab: 'IV · Year Five',   title: 'Proclamation IV · Year Five',    pages: [17], until: 'Year Five' },
  { id: 'p5',     tab: 'V · Procession',   title: 'Proclamation V · The Silent Procession', pages: [18], until: 'the end of Year Five' },
  { id: 'p6',     tab: 'VI · Year Ten',    title: 'Proclamation VI · Year Ten',     pages: [19], until: 'Year Ten' },
  { id: 'p7',     tab: 'VII · Reveal',     title: 'Proclamation VII · The Great Reveal', pages: [20], until: 'the end of the Decade' }];

/* which pages a player holds at each point of the Decade (the same schedule as the phone's pagesFor) */
function pagesAt(k) {
  const p = [];
  if (k.started >= 1) p.push(6, 7, 8, 9, 10);
  if (k.yearOneDone) p.push(21, 22, 23);
  if (k.started >= 2) p.push(11, 12, 13, 14, 15, 24, 25);
  if (k.started >= 3) p.push(16, 26);
  if (k.started >= 5) p.push(17);
  if (k.completed >= 5) p.push(18);
  if (k.started >= 10) p.push(19);
  if (k.completed >= 10) p.push(20);
  return p.sort((a, b) => a - b);
}

const CSS = `
.cxw{position:fixed;inset:0;z-index:38;background:#120a05;display:flex;flex-direction:column;--cxf:19px}
.cxw[hidden]{display:none}
.cxtop{display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top) + 10px) 12px 8px;background:#120a05}
.cxtop .cxh{flex:1;min-width:0}
.cxtop .cxk{font:700 11px "Cinzel",serif;letter-spacing:.3em;text-transform:uppercase;color:#c9973f}
.cxtop .cxt{font:700 19px "Cinzel",serif;color:#f2d48a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cxb{min-height:46px;min-width:46px;padding:0 12px;border-radius:12px;border:2px solid #6b4517;background:rgba(201,151,63,.12);color:#f2d48a;font:700 15px "Cinzel",serif;cursor:pointer}
.cxtabs{display:flex;gap:8px;overflow-x:auto;padding:4px 12px 10px;background:#120a05;border-bottom:1px solid #4d300c;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.cxtabs::-webkit-scrollbar{display:none}
.cxtab{flex:none;min-height:44px;padding:0 14px;border-radius:22px;border:2px solid #6b4517;background:#2a1606;color:#f2d48a;font:700 14px "Cinzel",serif;letter-spacing:.03em;cursor:pointer;position:relative;white-space:nowrap}
.cxtab.on{background:#c9973f;color:#2a1606;border-color:#f2d48a}
.cxtab.sealed{opacity:.45;border-style:dashed}
.cxtab.new::after{content:"";position:absolute;top:4px;right:6px;width:9px;height:9px;border-radius:50%;background:#ffcf6e;box-shadow:0 0 8px #ffcf6e}
.cxbody{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 12px calc(env(safe-area-inset-bottom) + 24px)}
.cxpage{background:#f3e6c8;color:#2a1606;border-radius:10px;border:2px solid #6b4517;padding:18px 16px 20px;margin:0 0 16px;box-shadow:0 6px 18px rgba(0,0,0,.5);
  font:400 var(--cxf)/1.5 "Crimson Text",Georgia,serif;overflow-wrap:break-word}
.cxpage p{margin:0 0 .75em}
.cxpage strong,.cxpage b{color:#3b1c08;font-weight:600}
.cxpage .kicker,.cxpage .hdr{font:700 calc(var(--cxf)*.62) "Cinzel",serif;letter-spacing:.22em;text-transform:uppercase;color:#8a5a1c;margin:0 0 .6em;display:block}
.cxpage h2{font:700 calc(var(--cxf)*1.12)/1.25 "Cinzel",serif;color:#6e1f16;margin:.9em 0 .4em;letter-spacing:.02em}
.cxpage h2.ph{font-size:calc(var(--cxf)*1.3);margin-top:.1em;color:#3b1c08}
.cxpage h2:first-child{margin-top:0}
.cxpage .rule{height:2px;background:linear-gradient(90deg,transparent,#8a5a1c,transparent);margin:.4em 0 .9em}
.cxpage .lead{font-size:calc(var(--cxf)*1.12);font-style:italic}
.cxpage .cue{font-style:italic;color:#6b4a22;border-left:4px solid #c9973f;padding:.2em 0 .2em .7em;margin:0 0 .8em}
.cxpage .closing{font:700 calc(var(--cxf)*.95) "Cinzel",serif;text-align:center;color:#6e1f16;margin-top:1em}
.cxpage .cap{font-style:italic;text-align:center;color:#5a3a1a}
.cxpage .center{text-align:center}
.cxpage .note-box,.cxpage .note{border:2px solid #8a5a1c;background:rgba(255,240,200,.6);padding:.6em .8em;margin:.8em 0;font-style:italic;border-radius:8px}
.cxpage .note{border:0;background:none;padding:0;font-style:normal}
.cxpage .note b{display:block;font:700 calc(var(--cxf)*.8) "Cinzel",serif;color:#6e1f16}
.cxpage .row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:.8em 0}
.cxpage .card{width:calc(33.3% - 7px);min-width:92px;max-width:200px;text-align:center}
.cxpage .row .card{flex:0 1 auto}
.cxpage .card img{width:100%;display:block;border-radius:6px;box-shadow:0 3px 8px rgba(40,20,5,.55)}
.cxpage .card span{display:block;font:700 calc(var(--cxf)*.6) "Cinzel",serif;letter-spacing:.08em;text-transform:uppercase;color:#5a3410;margin-top:4px}
.cxpage > .card{margin:.6em auto;width:70%;max-width:320px}
.cxpage .anatomy{display:flex;flex-direction:column;align-items:center;gap:10px;margin:.8em 0}
.cxpage .anatomy .card{width:55%}
.cxpage .anatomy .note{text-align:center!important}
.cxpage .plaque{border:3px double #8a5a1c;border-radius:10px;background:linear-gradient(#f9eccd,#ead3a0);text-align:center;padding:.8em;margin:1em 0}
.cxpage .plaque .t{font:700 calc(var(--cxf)*.7) "Cinzel",serif;letter-spacing:.2em;text-transform:uppercase;color:#8a5a1c}
.cxpage .plaque .big{font:900 calc(var(--cxf)*1.4)/1.2 "Cinzel Decorative","Cinzel",serif;color:#3b1c08;margin:.2em 0}
.cxpage .plaque .s{font-style:italic;color:#4a2e0e}
.cxpage .pairs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:.8em 0}
.cxpage .pair{text-align:center;font:600 calc(var(--cxf)*.78)/1.25 "Crimson Text",serif}
.cxpage .pair .two{display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:4px}
.cxpage .pair img{width:44%;border-radius:5px;box-shadow:0 2px 6px rgba(0,0,0,.45)}
.cxpage .pair .x{color:#8a5a1c;font-size:18px}
.cxpage .fm{display:grid;grid-template-columns:30% 1fr;gap:12px;align-items:start;margin:0 0 1em}
.cxpage .fm .card{width:100%;min-width:0}
.cxpage .fm .fmn{font:700 calc(var(--cxf)*1.05) "Cinzel",serif;color:#6e1f16;margin-bottom:.2em}
.cxpage .twocol{display:block}
.cxpage ol.steps{list-style:none;padding:0;margin:.6em 0 1em;counter-reset:s}
.cxpage ol.steps li{counter-increment:s;position:relative;padding-left:2.2em;margin:0 0 .7em;min-height:1.7em}
.cxpage ol.steps li::before{content:counter(s);position:absolute;left:0;top:.05em;width:1.55em;height:1.55em;border-radius:50%;background:#c9973f;border:2px solid #3b210b;
  display:flex;align-items:center;justify-content:center;font:700 calc(var(--cxf)*.8) "Cinzel",serif;color:#2a1606;box-sizing:border-box}
.cxpage .cues{list-style:none;padding:0}
.cxpage table{width:100%;border-collapse:collapse;margin:.6em 0 1em}
.cxpage table.grid th,.cxpage table.grid td{border:1px solid rgba(110,70,25,.45);padding:.3em .25em;text-align:center;font-size:calc(var(--cxf)*.85)}
.cxpage table.grid th{background:#4a2a0c;color:#f2d48a;font:700 calc(var(--cxf)*.7) "Cinzel",serif}
.cxpage table.grid td.sec{font-weight:600;text-align:left}
.cxpage table.stack,.cxpage table.stack tbody,.cxpage table.stack tr,.cxpage table.stack td{display:block;width:auto}
.cxpage table.stack tr.head{display:none}
.cxpage table.stack tr{border:2px solid rgba(110,70,25,.5);border-radius:8px;background:rgba(255,248,228,.7);padding:.55em .75em;margin:0 0 .6em}
.cxpage table.stack tr.grp{background:#4a2a0c;border-color:#4a2a0c;color:#f2d48a;font:700 calc(var(--cxf)*.85) "Cinzel",serif;letter-spacing:.12em;text-transform:uppercase;padding:.35em .75em}
.cxpage table.stack td{padding:.1em 0;border:0}
.cxpage table.stack td.title{font:700 calc(var(--cxf)*1.02) "Cinzel",serif;color:#6e1f16;margin-bottom:.2em}
.cxpage table.stack td[data-label]::before{content:attr(data-label);display:block;font:700 calc(var(--cxf)*.58) "Cinzel",serif;letter-spacing:.16em;text-transform:uppercase;color:#8a5a1c;margin-top:.35em}
.cxpage td.ind sup{font-size:.6em}
.cxpage .opener{text-align:center;padding:1.2em .5em}
.cxpage .okick{font:700 calc(var(--cxf)*.65) "Cinzel",serif;letter-spacing:.3em;text-transform:uppercase;color:#8a5a1c}
.cxpage .onum{font:900 calc(var(--cxf)*3) "Cinzel Decorative","Cinzel",serif;color:#6e1f16;line-height:1.1}
.cxpage .ottl{font:900 calc(var(--cxf)*1.6)/1.15 "Cinzel Decorative","Cinzel",serif;color:#3b1c08;margin:.2em 0 .5em}
.cxpage .osub{font-style:italic;color:#5a3a1a}
.cxseal{text-align:center;color:#cfb27a;padding:48px 18px;font:400 19px/1.5 "Crimson Text",serif}
.cxseal .wax{width:96px;height:96px;margin:0 auto 18px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#c0473a,#7a1f16 60%,#3e0d08);
  display:flex;align-items:center;justify-content:center;color:#f2d48a;font:900 30px "Cinzel Decorative",serif;box-shadow:0 6px 18px rgba(0,0,0,.6)}
.cxseal b{display:block;font:700 22px "Cinzel",serif;color:#f2d48a;margin-bottom:6px}
.cxnext{display:flex;gap:10px;justify-content:space-between;margin:6px 0 0}
.cxnext .cxb{flex:1}
.cxload{color:#cfb27a;text-align:center;padding:30px;font:italic 18px "Crimson Text",serif}`;

const $e = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const cache = {};
async function fragment(p) {
  if (cache[p]) return cache[p];
  const r = await fetch((R.base || '') + 'codex/' + PAGE[p] + '.html', { cache: 'force-cache' });
  if (!r.ok) throw new Error('page ' + p);
  const html = (await r.text()).replace(/src="codex\/img\//g, 'src="' + (R.base || '') + 'codex/img/');
  return (cache[p] = html);
}

let W = null, opts = null, cur = null, size = 19;
function build() {
  if (W) return;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  try { size = +localStorage.getItem('ie-codex-size') || 19; } catch (e) {}
  W = $e('div', 'cxw'); W.hidden = true;
  W.innerHTML = `<div class="cxtop"><div class="cxh"><div class="cxk">The Herald's Codex</div><div class="cxt" id="cxTitle"></div></div>
    <button class="cxb" id="cxSmall" aria-label="Smaller text">A−</button><button class="cxb" id="cxBig" aria-label="Larger text">A+</button>
    <button class="cxb" id="cxClose">Close</button></div>
    <div class="cxtabs" id="cxTabs" role="tablist"></div><div class="cxbody" id="cxBody"></div>`;
  document.body.appendChild(W);
  W.querySelector('#cxClose').onclick = () => R.close();
  W.querySelector('#cxSmall').onclick = () => setSize(size - 2);
  W.querySelector('#cxBig').onclick = () => setSize(size + 2);
  W.querySelector('#cxTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.dataset.id); });
  setSize(size);
}
function setSize(n) {
  size = Math.max(15, Math.min(29, n)); W.style.setProperty('--cxf', size + 'px');
  try { localStorage.setItem('ie-codex-size', size); } catch (e) {}
}
const held = ch => ch.pages.filter(p => opts.pages.includes(p));
const isNew = ch => held(ch).some(p => !opts.seen.includes(p));
function tabs() {
  W.querySelector('#cxTabs').innerHTML = CHAPTERS.map(ch => {
    const has = held(ch).length;
    return `<button role="tab" data-id="${ch.id}" class="cxtab${ch.id === cur ? ' on' : ''}${has ? '' : ' sealed'}${has && isNew(ch) ? ' new' : ''}">${has ? '' : '🔒 '}${ch.tab}</button>`;
  }).join('');
  const on = W.querySelector('.cxtab.on'); if (on) on.scrollIntoView({ inline: 'center', block: 'nearest' });
}
async function show(id) {
  const ch = CHAPTERS.find(c => c.id === id) || CHAPTERS[0]; cur = ch.id;
  W.querySelector('#cxTitle').textContent = ch.title; tabs();
  const body = W.querySelector('#cxBody'); body.scrollTop = 0;
  const pages = held(ch);
  if (!pages.length) {
    body.innerHTML = `<div class="cxseal"><div class="wax">⚙</div><b>${ch.title}</b>Sealed until ${ch.until}.</div>`; return;
  }
  body.innerHTML = '<div class="cxload">Unrolling the page…</div>';
  try {
    const parts = await Promise.all(pages.map(fragment));
    if (cur !== ch.id) return;
    body.innerHTML = parts.map(h => `<article class="cxpage">${h}</article>`).join('');
  } catch (e) { body.innerHTML = '<div class="cxseal">The Codex could not be opened. Check your connection and try again.</div>'; return; }
  const i = CHAPTERS.indexOf(ch), open = CHAPTERS.filter(c => held(c).length);
  const k = open.indexOf(ch), prev = open[k - 1], next = open[k + 1];
  const nav = $e('div', 'cxnext', (prev ? `<button class="cxb" data-go="${prev.id}">‹ ${prev.tab}</button>` : '') + (next ? `<button class="cxb" data-go="${next.id}">${next.tab} ›</button>` : ''));
  nav.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.dataset.go); });
  body.appendChild(nav);
  pages.forEach(p => { if (!opts.seen.includes(p)) { opts.seen.push(p); opts.onSeen && opts.onSeen(p); } });
  tabs();
}

const R = {
  CHAPTERS, pagesAt, base: '',
  /* opts: { pages: [earned page numbers], seen: [pages already read], onSeen(page), onClose(), start: chapter id } */
  open(o) {
    build(); opts = Object.assign({ pages: [], seen: [] }, o); opts.seen = opts.seen.slice();
    const firstNew = CHAPTERS.find(c => held(c).length && isNew(c)), first = CHAPTERS.find(c => held(c).length);
    W.hidden = false; show(opts.start || (firstNew || first || CHAPTERS[0]).id);
  },
  close() { if (!W || W.hidden) return; W.hidden = true; opts && opts.onClose && opts.onClose(); },
  get isOpen() { return !!W && !W.hidden; }
};
window.CodexReader = R;
})();
