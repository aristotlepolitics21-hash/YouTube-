# Comedy Shorts: freely licensed real-photo backgrounds from Wikimedia Commons.
# usage: python3 fetch_bg.py search OUTDIR          -> OUTDIR/candidates.json + small thumbnails per scene (pick by eye)
#        python3 fetch_bg.py get PICKS.json BGDIR   -> downloads the picks (1280 px) into BGDIR and writes BGDIR/credits.json
import json, os, re, sys, time, urllib.parse, urllib.request
UA = 'ShortsResearch/1.0 (https://github.com/aristotlepolitics21-hash; contact via github) python-urllib'
API = 'https://commons.wikimedia.org/w/api.php'
OK = re.compile(r'^(CC BY(-SA)? [0-9.]+|CC0|Public domain|PD.*)', re.I)
SCENES = {'road': 'road construction India asphalt', 'office': 'office interior desks India', 'classroom': 'classroom India school students',
  'clinic': 'doctor clinic India', 'living': 'living room India house interior', 'kirana': 'grocery shop India', 'traffic': 'traffic India road junction',
  'exam': 'examination hall India students', 'boardroom': 'conference room meeting table', 'street': 'residential street India colony', 'teastall': 'tea stall India roadside', 'bank': 'bank interior counter'}
def get(params, tries=6):
    url = API + '?' + urllib.parse.urlencode(params)
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30) as r: return json.load(r)
        except Exception: time.sleep(30 * (i + 1))
    raise SystemExit('failed ' + url)
def fetch(url, path, tries=6):
    if os.path.exists(path) and os.path.getsize(path) > 1000: return True
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r: open(path, 'wb').write(r.read()); return True
        except Exception: time.sleep(15 * (i + 1))
    print('skip', url); return False
strip = lambda h: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', h or '')).strip()
thumb = lambda u, w: re.sub(r'/\d+px-', f'/{w}px-', u)
if sys.argv[1] == 'search':
    out = sys.argv[2]; os.makedirs(out, exist_ok=True); cf = f'{out}/candidates.json'; allc = json.load(open(cf)) if os.path.exists(cf) else {}
    for key, q in SCENES.items():
        if allc.get(key): continue
        d = get(dict(action='query', format='json', generator='search', gsrsearch=q + ' filetype:bitmap', gsrnamespace=6, gsrlimit=30, prop='imageinfo', iiprop='url|size|extmetadata|mime', iiurlwidth=330))
        cs = []
        for p in sorted(d.get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 0)):
            ii = (p.get('imageinfo') or [{}])[0]; md = ii.get('extmetadata', {}); lic = md.get('LicenseShortName', {}).get('value', '')
            if ii.get('mime') != 'image/jpeg' or not OK.match(lic) or ii.get('width', 0) < 1200: continue
            cs.append(dict(title=p['title'], thumb=ii['thumburl'], license=lic, artist=strip(md.get('Artist', {}).get('value', '')), page=ii['descriptionurl'], w=ii['width'], h=ii['height']))
            if len(cs) >= 6: break
        allc[key] = cs; json.dump(allc, open(cf, 'w'), indent=1)
        for i, c in enumerate(cs): fetch(c['thumb'], f'{out}/{key}_{i}.jpg'); time.sleep(2)
        print(key, len(cs), flush=True); time.sleep(20)
else:
    picks, bg = json.load(open(sys.argv[2])), sys.argv[3]; os.makedirs(bg, exist_ok=True); cred = {}
    for key, c in picks.items():
        if fetch(thumb(c['thumb'], 1280), f'{bg}/{key}.jpg'): cred[key] = f"{c['title'][5:]} by {c['artist'] or 'unknown'}, {c['license']}, {c['page']}"
        time.sleep(4)
    json.dump(cred, open(f'{bg}/credits.json', 'w'), indent=1); print(len(cred), 'backgrounds')
