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
