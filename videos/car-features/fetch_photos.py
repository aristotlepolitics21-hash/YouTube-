# Car Features: find freely licensed photos on Wikimedia Commons for each car.
# usage: python3 fetch_photos.py search OUTDIR       -> candidates.json + numbered thumbnails per car, for picking by eye
#        python3 fetch_photos.py get PICKS.json EPROOT -> downloads the picked files (1920 px) into EPROOT/NN-slug/photos/ and writes credits
import json, os, re, sys, time, urllib.parse, urllib.request

UA = 'ShortsResearch/1.0 (https://github.com/aristotlepolitics21-hash; contact via github) python-urllib'
API = 'https://commons.wikimedia.org/w/api.php'
OK_LICENSES = re.compile(r'^(CC BY(-SA)? [0-9.]+|CC0|Public domain|PD.*)', re.I)
CARS = {
    'vw-virtus': 'Volkswagen Virtus', 'kia-seltos': 'Kia Seltos', 'kia-sorento': 'Kia Sorento 2021', 'fortuner': 'Toyota Fortuner 2021', 'tata-safari': 'Tata Safari',
    'nexon-ev': 'Tata Nexon EV', 'byd-atto3': 'BYD Atto 3', 'ioniq5': 'Hyundai Ioniq 5', 'mg-zs-ev': 'MG ZS EV', 'xuv400': 'Mahindra XUV400',
}

def get(params, tries=5):
    url = API + '?' + urllib.parse.urlencode(params)
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30) as r: return json.load(r)
        except Exception as e:
            time.sleep(5 * (i + 1))
    raise SystemExit(f'failed: {url}')

def fetch(url, path, tries=6):
    if os.path.exists(path) and os.path.getsize(path) > 1000: return True
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r: open(path, 'wb').write(r.read()); return True
        except Exception: time.sleep(15 * (i + 1))
    print('skip', url); return False

def strip(html): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', html or '')).strip()

if sys.argv[1] == 'search':
    out = sys.argv[2]; os.makedirs(out, exist_ok=True); cf = f'{out}/candidates.json'; allc = json.load(open(cf)) if os.path.exists(cf) else {}
    for slug, q in CARS.items():
        if slug in allc and len(allc[slug]) > 3: continue
        d = get(dict(action='query', format='json', generator='search', gsrsearch=q + ' filetype:bitmap', gsrnamespace=6, gsrlimit=50, prop='imageinfo', iiprop='url|size|extmetadata|mime', iiurlwidth=1920))
        cands = []
        for p in sorted(d.get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 0)):
            ii = (p.get('imageinfo') or [{}])[0]; md = ii.get('extmetadata', {}); lic = md.get('LicenseShortName', {}).get('value', '')
            if ii.get('mime') != 'image/jpeg' or ii.get('width', 0) < 1400 or ii.get('width', 0) < ii.get('height', 1) or not OK_LICENSES.match(lic): continue
            cands.append(dict(title=p['title'], thumb=re.sub(r'\?.*$', '', (ii.get('thumburl') or ii['url']).replace('https://thumb.wikimedia.org/wikipedia/commons/thumb/', 'https://upload.wikimedia.org/wikipedia/commons/thumb/')), page=ii.get('descriptionurl'), license=lic, artist=strip(md.get('Artist', {}).get('value', '')), lurl=md.get('LicenseUrl', {}).get('value', '')))
        allc[slug] = cands[:30]; json.dump(allc, open(cf, 'w'), indent=1); print(slug, len(cands)); [print('   ', i, c['title'][5:], '|', c['license']) for i, c in enumerate(cands[:30])]; time.sleep(3)
    json.dump(allc, open(f'{out}/candidates.json', 'w'), indent=1)

elif sys.argv[1] == 'get':
    picks = json.load(open(sys.argv[2])); root = sys.argv[3]
    for folder, items in picks.items():
        os.makedirs(f'{root}/{folder}/photos', exist_ok=True); lines = ['PHOTO CREDITS (paste into the YouTube description)', '']
        for i, c in enumerate(items):
            fetch(c['thumb'], f'{root}/{folder}/photos/p{i + 1}.jpg'); time.sleep(4)
            lines.append(f"- \"{c['title'][5:]}\" by {c['artist'] or 'unknown'}, {c['license']}, {c['page']}")
        open(f'{root}/{folder}/photo-credits.txt', 'w').write('\n'.join(lines) + '\n'); print(folder, len(items))
