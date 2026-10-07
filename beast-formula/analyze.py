"""Classify MrBeast long-form titles into formats and summarise views/length per format.

Usage: python3 beast-formula/analyze.py [beast-formula/data/mrbeast_longform.csv]
"""
import csv, re, statistics, sys
from collections import defaultdict

FORMATS = [  # first match wins
    ("$1 vs $X tiers",        r"^\$1 vs \$"),
    ("Survive N days, win $", r"every day you survive|survive .*(\$|keep it)"),
    ("Last to leave",         r"last to leave"),
    ("N people/ages fight",   r"(\d[\d,]*|ages 1 - 100) .*(fight|vs|race|decide)|\bvs\b.*\d"),
    ("I survived/spent X",    r"^i (survived|spent)|stranded|trapped|buried"),
    ("Spectacle X vs Y",      r"^[a-z' ]+ vs [a-z' ]+!?$"),
    ("Philanthropy",          r"(adopted|saved|helped|built .*school|clean water|feed|granted|save kids)"),
    ("World's most/largest",  r"world.s (most|largest|deadliest|biggest|strongest|fastest)"),
    ("Dare for $",            r"(would you|beat |press this|face your|how much would|lose \d)"),
]

def minutes(iso):
    h, m, s = (int(x or 0) for x in re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso).groups())
    return h * 60 + m + s / 60

def fmt(title):
    t = title.lower()
    return next((name for name, rx in FORMATS if re.search(rx, t)), "Other")

rows = list(csv.DictReader(open(sys.argv[1] if len(sys.argv) > 1 else "beast-formula/data/mrbeast_longform.csv")))
for r in rows:
    r["views"], r["min"], r["fmt"] = int(r["views"]), minutes(r["duration"]), fmt(r["title"])

for subset in ("popular", "recent"):
    rs = [r for r in rows if r["set"] == subset]
    print(f"\n== {subset} (n={len(rs)}) median views {statistics.median(r['views'] for r in rs)/1e6:.0f}M,"
          f" median length {statistics.median(r['min'] for r in rs):.1f} min")
    g = defaultdict(list)
    for r in rs: g[r["fmt"]].append(r)
    for name, grp in sorted(g.items(), key=lambda kv: -len(kv[1])):
        print(f"  {name:24} {len(grp):2}  median {statistics.median(x['views'] for x in grp)/1e6:5.0f}M  "
              f"{statistics.median(x['min'] for x in grp):4.1f} min")

titles = [r["title"] for r in rows]
words = [len(t.split()) for t in titles]
print(f"\nTitle words: median {statistics.median(words)}, max {max(words)}")
print(f"Titles with a $ amount: {sum('$' in t for t in titles)}/{len(titles)}")
print(f"Titles with a number:   {sum(bool(re.search(r'\d', t)) for t in titles)}/{len(titles)}")
print(f"Titles ending in '!':   {sum(t.endswith('!') for t in titles)}/{len(titles)}")
print(f"First-person 'I ...':   {sum(t.startswith('I ') for t in titles)}/{len(titles)}")
