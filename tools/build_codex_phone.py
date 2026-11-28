"""Build the phone Codex from the printed Codex (codex.html, the A5 booklet source).

Each printed page becomes one HTML fragment with a hashed name (join/codex/<hash>.html), so a page can only be
found once the phone has earned it. Print styling is stripped; tables are marked to stack as cards on a phone;
images are copied, resized for phones, into join/codex/img/.  Run:
    python3 tools/build_codex_phone.py /path/to/codex.html /path/to/codex/img
It rewrites the PAGE map at the top of join/codex-reader.js."""
import sys, re, os, hashlib, json
from bs4 import BeautifulSoup
from PIL import Image

SRC, IMGDIR = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'join', 'codex'); OIMG = os.path.join(OUT, 'img')
os.makedirs(OIMG, exist_ok=True)
PAGES = list(range(6, 27))
SALT = 'ie-codex-phone-v1'

soup = BeautifulSoup(open(SRC, encoding='utf-8').read(), 'html.parser')
secs = soup.select('section.page')
for f in os.listdir(OUT):
    if f.endswith('.html'): os.remove(os.path.join(OUT, f))
images, pagemap = set(), {}

def stack_table(t):
    rows = t.find_all('tr')
    if not rows: return
    head = rows[0].find_all('th')
    if not head or len(head) > 4:          # wide numeric tables (the Philanthropist's targets) keep their grid
        t['class'] = (t.get('class') or []) + ['grid']; return
    labels = [h.get_text(' ', strip=True) for h in head]
    t['class'] = (t.get('class') or []) + ['stack']
    rows[0]['class'] = ['head']
    group_left = 0
    for r in rows[1:]:
        cells = r.find_all(['td', 'th'], recursive=False)
        if not cells: continue
        offset = 0
        if cells[0].get('rowspan'):
            g = soup.new_tag('tr'); g['class'] = ['grp']
            td = soup.new_tag('td'); td.string = cells[0].get_text(' ', strip=True); g.append(td)
            r.insert_before(g)
            group_left = int(cells[0]['rowspan']); cells[0].decompose(); cells = cells[1:]
        if group_left > 0:
            offset = 1; group_left -= 1
        for i, c in enumerate(cells):
            col = i + offset
            cls = c.get('class') or []
            if col == 0 and ('ind' in cls or 'sec' in cls): c['class'] = cls + ['title']; continue
            if col < len(labels) and labels[col]: c['data-label'] = labels[col]

def clean(node):
    for el in node.select('.pno, .mini, .lines'): el.decompose()
    for el in node.find_all(True):
        if el.has_attr('style'): del el['style']
    for img in node.find_all('img'):
        name = os.path.basename(img['src']); images.add(name); img['src'] = 'codex/img/' + name; img['loading'] = 'lazy'
    for h in node.find_all('h1'): h.name = 'h2'; h['class'] = ['ph']
    for t in node.find_all('table'): stack_table(t)
    return node


# ---------- phone-only enrichment: Industry art on the Scoring Reference, Development emblems, a fuller Lands page ----------
DEVS = ['medicine', 'agriculture', 'literacy', 'currency', 'weaponry']
DEV_WORD = re.compile(r'\b(Medicine|Agriculture|Literacy|Currency|Weaponry)\b')
IND_IMG = {'Banking': 'i_banking', 'Cruise Lines': 'i_cruise', 'Food Retail': 'i_retail', 'Hotels': 'i_hotels', 'Fashion': 'i_fashion',
           'Politics': 'i_politics', 'Oil & Gas': 'i_oil', 'Property Dev.': 'i_property', 'Newspapers': 'i_news', 'Weapons Mfr.': 'i_weapons',
           "Int'l Trade": 'i_trade', 'Ind. Wonder': 'i_wonder', 'Philanthropist': 'i_phil'}
LANDS = [('ocean', 'Ocean', 'Sapphire Coast', ['trade', 'influence'], ['medicine', 'agriculture']),
         ('mountain', 'Mountain', 'Argent Peaks', ['ore', 'gold'], ['weaponry', 'currency']),
         ('fields', 'Fields', 'Verdant Expanse', ['food', 'citizens'], ['agriculture', 'literacy']),
         ('forest', 'Forest', 'Umberwild', ['timber', 'textile'], ['literacy', 'weaponry']),
         ('desert', 'Desert', 'Ember Wastes', ['oil', 'exotics'], ['currency', 'medicine'])]
NEEDS = {'medicine': 'Cruise Lines, Hotels, Politics (two), Oil & Gas, International Trade and the Industrial Wonder',
         'agriculture': 'Food Retail, Fashion (two), Property Development (two), International Trade and the Industrial Wonder',
         'literacy': 'Banking, Food Retail, Hotels, Politics, International Trade and the Industrial Wonder. Newspapers scores by it alone',
         'currency': 'Banking (two), Cruise Lines, Food Retail, International Trade (two) and the Industrial Wonder',
         'weaponry': 'Oil & Gas (two), Weapons Manufacture (four) and the Industrial Wonder'}
cap = lambda w: w[0].upper() + w[1:]
dev = lambda d, big=False: f'<span class="dv{" big" if big else ""}"><img src="codex/img/dev_{d}.png" alt="">{cap(d)}</span>'

def emblems(html):
    """put each Development's emblem beside its name, inside table cells only"""
    frag = BeautifulSoup(html, 'html.parser')
    for td in frag.find_all('td'):
        if 'title' in (td.get('class') or []): continue
        for t in list(td.find_all(string=True)):
            if DEV_WORD.search(t):
                t.replace_with(BeautifulSoup(DEV_WORD.sub(lambda m: dev(m.group(1).lower()), t), 'html.parser'))
    return str(frag)

def scoring(html):
    frag = BeautifulSoup(emblems(html), 'html.parser')
    for td in frag.select('td.title'):
        name = td.get_text(' ', strip=True).rstrip('7+').strip()
        key = IND_IMG.get(name)
        if key:
            td.insert(0, BeautifulSoup(f'<img class="indimg" src="cards/{key}.jpg" alt="">', 'html.parser'))
    return str(frag)

def lands_page(html):
    old = BeautifulSoup(html, 'html.parser'); note = old.select_one('.note-box')
    out = ['<div class="kicker">The Reference Sheet · Front</div><h2 class="ph">What Each Land May Hide</h2>',
           '<p>The <b>back</b> of every Resource card shows its Land. The <b>face</b> shows a Resource, the large name, and one Development emblem at its foot. Each Land hides two Resources and two Developments, in four designs.</p>']
    for key, name, place, res, devs in LANDS:
        cards = ''.join(f'<div class="card"><img src="cards/{r}-{d}.jpg" alt="" loading="lazy"><span>{cap(r)} · {cap(d)}</span></div>' for r in res for d in devs)
        out.append(f'<div class="land"><div class="lhead"><img class="lback" src="codex/img/l_{key}.jpg" alt=""><div><div class="lname">{name}</div><div class="lplace">{place}</div>'
                   f'<div class="lrow"><b>Resources</b> {cap(res[0])} · {cap(res[1])}</div><div class="lrow"><b>Developments</b> {dev(devs[0])} {dev(devs[1])}</div></div></div>'
                   f'<div class="row four">{cards}</div></div>')
    out.append('<h2>The five Developments</h2><p>Every face carries one Development emblem at its foot. Learn them: across a Warehouse, an emblem is the quickest way to read a card.</p>')
    for d in DEVS:
        lands = ' and '.join(n for k, n, p, r, ds in LANDS if d in ds)
        out.append(f'<div class="devrow"><img src="codex/img/dev_{d}.png" alt=""><div><div class="lname">{cap(d)}</div><div>Found on <b>{lands}</b> cards.</div><div class="muted">Needed by {NEEDS[d]}.</div></div></div>')
    if note: out.append(str(note))
    return ''.join(out)

def welcome_cards(html):
    """page 7 (Of the cards): show the five emblems by name under the card anatomy"""
    row = '<div class="devs">' + ''.join(f'<div><img src="codex/img/dev_{d}.png" alt=""><span>{cap(d)}</span></div>' for d in DEVS) + '</div>'
    i = html.find('</div>', html.find('class="anatomy"'))
    j = html.find('<p>', i)
    return html[:j] + '<p class="cap">The five Development emblems</p>' + row + html[j:] if j > 0 else html + row

ENRICH = {7: welcome_cards, 21: scoring, 22: lands_page}

for p in PAGES:
    sec = secs[p - 1]
    if 'opener' in sec.get('class', []):
        inner = sec.select_one('.inner')
        kick = inner.select_one('.kick'); num = inner.select_one('.numeral'); ttl = inner.select_one('.ttl'); sub = inner.select_one('.sub')
        html = '<div class="opener">' + (f'<div class="okick">{kick.get_text()}</div>' if kick else '') \
             + (f'<div class="onum">{num.get_text()}</div>' if num else '') \
             + (f'<h2 class="ottl">{ttl.decode_contents()}</h2>' if ttl else '') \
             + (f'<p class="osub">{sub.get_text()}</p>' if sub else '') + '</div>'
    else:
        panel = clean(sec.select_one('.panel'))
        html = panel.decode_contents().strip()
        if p in ENRICH: html = ENRICH[p](html)
    h = hashlib.sha256(f'{SALT}-{p}-brasshaven'.encode()).hexdigest()[:16]
    open(os.path.join(OUT, h + '.html'), 'w', encoding='utf-8').write(html + '\n')
    pagemap[p] = h

for name in sorted(images):
    im = Image.open(os.path.join(IMGDIR, name)).convert('RGB')
    if im.width > 720: im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
    im.save(os.path.join(OIMG, name), quality=84)

js = os.path.join(ROOT, 'join', 'codex-reader.js')
s = open(js, encoding='utf-8').read()
s = re.sub(r'const PAGE = \{[^}]*\};', 'const PAGE = ' + json.dumps({str(k): v for k, v in pagemap.items()}) + ';', s, count=1)
open(js, 'w', encoding='utf-8').write(s)
print(len(pagemap), 'pages,', len(images), 'images')
