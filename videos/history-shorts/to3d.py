# Writes NN-slug/script3d.json for the cartoon 3D cut: the same narration as script.json, with one 3D set
# per line from engine3d/sets/body/hNN.js (keys hNN_1 .. hNN_6). The first line carries the title for the hook signs.
import json, glob
for f in sorted(glob.glob("[0-9][0-9]-*/script.json")):
    sc = json.load(open(f)); n = sc["episode"]
    if n < 3: continue
    words = sc["title"].upper().split(); cut = (len(words) + 1) // 2
    lines = [[f"h{n:02d}_{i + 1}", ({"top": " ".join(words[:cut]), "bottom": " ".join(words[cut:])} if i == 0 else {}), l[2]] for i, l in enumerate(sc["sections"][0]["lines"])]
    out = {"series": sc["series"], "episode": n, "title": sc["title"], "out": sc["out"], "sets": f"body/h{n:02d}.js", "voice": sc["voice"], "style": "lively",
           "sections": [{"name": sc["title"], "lines": lines}]}
    json.dump(out, open(f.replace("script.json", "script3d.json"), "w"), indent=1, ensure_ascii=False)
print("ok")
