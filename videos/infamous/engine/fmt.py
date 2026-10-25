import json, sys
# usage: fmt.py SCRIPT.json — rewrites the script in the house layout (one narration line per row) and prints word/line counts
p = sys.argv[1]; d = json.load(open(p)); J = lambda x: json.dumps(x, ensure_ascii=False)
out = ["{"] + [f'  {J(k)}: {J(d[k])},' for k in d if k not in ("sections", "package")]
if "package" in d: out += ['  "package": {'] + [f'    {J(k)}: {J(v)}{"," if i < len(d["package"]) - 1 else ""}' for i, (k, v) in enumerate(d["package"].items())] + ["  },"]
out.append('  "sections": [')
for si, s in enumerate(d["sections"]):
    out.append(f'    {{ "name": {J(s["name"])}, "lines": [')
    out += [f'      {J(l)}{"," if li < len(s["lines"]) - 1 else ""}' for li, l in enumerate(s["lines"])]
    out.append("    ]}" + ("," if si < len(d["sections"]) - 1 else ""))
out += ["  ]", "}"]; open(p, "w").write("\n".join(out) + "\n"); json.load(open(p))
print(sum(len(l[2].split()) for s in d["sections"] for l in s["lines"]), "words", sum(len(s["lines"]) for s in d["sections"]), "lines")
