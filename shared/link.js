/* Industry & Espionage — shared link layer
   QR:   a small QR Code encoder (byte mode, error correction M, versions 1–15).
   Link: an encrypted message channel between the Port clock (iPad) and the phones.
         Messages travel through the public ntfy.sh relay, the same service Prosperitas Arcana uses.
         Every message is sealed with AES-GCM; the key comes from tonight's game key, which only
         lives inside the join QR. The relay sees a random-looking topic and unreadable text.
         Add ?relay=local to a page to use a BroadcastChannel instead (tests on one computer). */
(function (root) {
'use strict';

/* ======================= QR CODE ======================= */
const ECC_M = [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24];
const BLK_M = [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10];
function rawModules(v){ let r = (16*v + 128)*v + 64; if (v >= 2){ const n = Math.floor(v/7) + 2; r -= (25*n - 10)*n - 55; if (v >= 7) r -= 36; } return r; }
const dataCodewords = v => Math.floor(rawModules(v)/8) - ECC_M[v]*BLK_M[v];
function gmul(x, y){ let z = 0; for (let i = 7; i >= 0; i--){ z = (z << 1) ^ ((z >>> 7)*0x11D); z ^= ((y >>> i) & 1)*x; } return z & 255; }
function rsDivisor(d){ const r = new Array(d).fill(0); r[d-1] = 1; let root = 1;
  for (let i = 0; i < d; i++){ for (let j = 0; j < d; j++){ r[j] = gmul(r[j], root); if (j + 1 < d) r[j] ^= r[j+1]; } root = gmul(root, 2); } return r; }
function rsRemainder(data, div){ const r = div.map(() => 0);
  for (const b of data){ const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => r[i] ^= gmul(c, f)); } return r; }
function alignPos(v, size){ if (v === 1) return []; const n = Math.floor(v/7) + 2, step = Math.ceil((v*4 + 4)/(n*2 - 2))*2, r = [6];
  for (let p = size - 7; r.length < n; p -= step) r.splice(1, 0, p); return r; }

function qrMatrix(text){
  const bytes = Array.from(new TextEncoder().encode(text));
  let v = 1; for (; v <= 15; v++){ const cc = v < 10 ? 8 : 16; if (4 + cc + bytes.length*8 <= dataCodewords(v)*8) break; }
  if (v > 15) throw new Error('Text too long for this QR encoder');
  const cap = dataCodewords(v)*8, bits = [];
  const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
  put(0, Math.min(4, cap - bits.length)); put(0, (8 - bits.length % 8) % 8);
  for (let p = 0xEC; bits.length < cap; p ^= 0xEC ^ 0x11) put(p, 8);
  const data = []; for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  // split into blocks, add error correction, interleave
  const nb = BLK_M[v], ecl = ECC_M[v], raw = Math.floor(rawModules(v)/8), nShort = nb - raw % nb, shortLen = Math.floor(raw/nb);
  const div = rsDivisor(ecl), blocks = [];
  for (let i = 0, k = 0; i < nb; i++){ const dat = data.slice(k, k + shortLen - ecl + (i < nShort ? 0 : 1)); k += dat.length;
    const ec = rsRemainder(dat, div); if (i < nShort) dat.push(0); blocks.push(dat.concat(ec)); }
  const cw = []; for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== shortLen - ecl || j >= nShort) cw.push(b[i]); });
  // function patterns
  const size = v*4 + 17, M = [], F = [];
  for (let y = 0; y < size; y++){ M.push(new Array(size).fill(false)); F.push(new Array(size).fill(false)); }
  const setF = (x, y, d) => { M[y][x] = d; F[y][x] = true; };
  for (let i = 0; i < size; i++){ setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
  [[3,3],[size-4,3],[3,size-4]].forEach(([cx, cy]) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++){
    const d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy; if (x >= 0 && x < size && y >= 0 && y < size) setF(x, y, d !== 2 && d !== 4); } });
  const ap = alignPos(v, size), L = ap.length - 1;
  ap.forEach((ax, i) => ap.forEach((ay, j) => { if ((i === 0 && j === 0) || (i === 0 && j === L) || (i === L && j === 0)) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setF(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }));
  const formatBits = mask => { const d = (0 << 3) | mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9)*0x537);
    const b = ((d << 10) | r) ^ 0x5412, g = i => ((b >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) setF(8, i, g(i)); setF(8, 7, g(6)); setF(8, 8, g(7)); setF(7, 8, g(8));
    for (let i = 9; i < 15; i++) setF(14 - i, 8, g(i));
    for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, g(i));
    for (let i = 8; i < 15; i++) setF(8, size - 15 + i, g(i));
    setF(8, size - 8, true); };
  formatBits(0);
  if (v >= 7){ let r = v; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11)*0x1F25); const b = (v << 12) | r;
    for (let i = 0; i < 18; i++){ const d = ((b >>> i) & 1) === 1, a = size - 11 + i % 3, c = Math.floor(i/3); setF(a, c, d); setF(c, a, d); } }
  // codewords in the zigzag
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2){ if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++){
      const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
      if (!F[y][x] && bi < cw.length*8){ M[y][x] = ((cw[bi >>> 3] >>> (7 - (bi & 7))) & 1) === 1; bi++; } } }
  // masks: try all eight, keep the lowest penalty
  const MASKS = [(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,
    (x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
  const apply = m => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && MASKS[m](x, y)) M[y][x] = !M[y][x]; };
  const penalty = () => { let p = 0, dark = 0;
    const line = get => { let run = 1, s = ''; for (let i = 0; i < size; i++){ const c = get(i); s += c ? '1' : '0';
        if (i && c === get(i-1)){ run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; }
      const re = /(?=(10111010000|00001011101))/g; while (re.exec(s)){ p += 40; re.lastIndex++; } };
    for (let y = 0; y < size; y++) line(i => M[y][i]);
    for (let x = 0; x < size; x++) line(i => M[i][x]);
    for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++){ const c = M[y][x]; if (c === M[y][x+1] && c === M[y+1][x] && c === M[y+1][x+1]) p += 3; }
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (M[y][x]) dark++;
    return p + Math.floor(Math.abs(dark*20 - size*size*10)/(size*size))*10; };
  let best = 0, bestP = Infinity;
  for (let m = 0; m < 8; m++){ apply(m); formatBits(m); const p = penalty(); if (p < bestP){ bestP = p; best = m; } apply(m); }
  apply(best); formatBits(best);
  return { size, version: v, get: (x, y) => M[y][x] };
}
function qrSvg(text, o){ o = o || {}; const q = qrMatrix(text), m = o.margin == null ? 4 : o.margin, n = q.size + m*2; let d = '';
  for (let y = 0; y < q.size; y++) for (let x = 0; x < q.size; x++) if (q.get(x, y)) d += `M${x+m} ${y+m}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"${o.cls ? ` class="${o.cls}"` : ''}>`
    + `<rect width="${n}" height="${n}" fill="${o.light || '#fff'}"/><path d="${d}" fill="${o.dark || '#000'}"/></svg>`; }

/* ======================= LINK ======================= */
const RELAY = 'https://ntfy.sh/';
const enc = new TextEncoder(), dec = new TextDecoder();
const b64u = { to: b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''),
               from: s => Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0)) };
const hex = b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');
const rand = n => crypto.getRandomValues(new Uint8Array(n));
const newKey = () => b64u.to(rand(16));
const newId = () => b64u.to(rand(9));
const sha = async (label, raw) => crypto.subtle.digest('SHA-256', new Uint8Array([...enc.encode(label), ...raw]));
const localMode = () => /[?&]relay=local\b/.test(location.search) || root.__IE_RELAY === 'local';

async function open(gameKey, onMsg, opts){
  opts = opts || {};
  const raw = b64u.from(gameKey);
  const topic = 'ie-' + hex(await sha('ie-topic|', raw)).slice(0, 30);
  const key = await crypto.subtle.importKey('raw', await sha('ie-key|', raw), 'AES-GCM', false, ['encrypt', 'decrypt']);
  const me = newId(), seen = new Set();
  let es = null, bc = null, closed = false, status = 'connecting';
  const setStatus = s => { if (s !== status){ status = s; opts.onStatus && opts.onStatus(s); } };
  async function seal(obj){ const iv = rand(12); const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)));
    return b64u.to(new Uint8Array([...iv, ...new Uint8Array(ct)])); }
  async function unseal(s){ const b = b64u.from(s); const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, key, b.slice(12)); return JSON.parse(dec.decode(pt)); }
  async function deliver(text){ let m; try { m = await unseal(text); } catch (e){ return; }     // not ours, or tampered with: ignore
    if (!m || m._from === me || seen.has(m._id)) return; seen.add(m._id); try { onMsg(m); } catch (e){ console.error(e); } }
  if (localMode()){
    bc = new BroadcastChannel(topic); bc.onmessage = e => deliver(e.data); setTimeout(() => setStatus('live'), 0);
  } else {
    es = new EventSource(RELAY + topic + '/sse?since=' + (opts.since || '10m'));
    es.onopen = () => setStatus('live');
    es.onerror = () => setStatus('reconnecting');
    es.onmessage = e => { let d; try { d = JSON.parse(e.data); } catch (x){ return; } if (d.event && d.event !== 'message') return; if (d.message) deliver(d.message); };
  }
  async function send(obj){
    const body = await seal(Object.assign({}, obj, { _from: me, _id: newId(), _at: Date.now() }));
    if (bc){ bc.postMessage(body); return true; }
    for (let i = 0; i < 3; i++){ try { const r = await fetch(RELAY + topic, { method: 'POST', body }); if (r.ok) return true; } catch (e){}
      await new Promise(r => setTimeout(r, 800*(i + 1))); }
    return false;
  }
  return { send, close(){ closed = true; es && es.close(); bc && bc.close(); }, get status(){ return status; }, topic };
}

root.IE = { QR: { matrix: qrMatrix, svg: qrSvg }, Link: { open, newKey, newId, local: localMode } };
})(window);
