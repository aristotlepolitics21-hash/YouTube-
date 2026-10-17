# usage: python3 package.py  -> writes description.txt and tags.txt for every Short from countries.py
import os
from countries import C
here = os.path.dirname(os.path.abspath(__file__))
for i, c in enumerate(C):
    d = f"{here}/{i + 1:02d}-{c['slug']}"; nm = c["name"].replace("the ", "")
    title = f"Why {c['short']} money lives where it lives #shorts"
    desc = f"""{c['lines'][0]} Why there? Geography, the snowball of talent, and the rules.

Part of "Where the Money Lives": the full documentary on why wealth concentrates in certain places is on the channel.

Narration is an AI voice (Kokoro). Map data: Natural Earth (public domain); city populations: GeoNames (CC BY 4.0).

#shorts #economics #geography #{nm.replace(' ', '').lower()}
"""
    open(f"{d}/description.txt", "w").write(f"TITLE: {title}\n\n{desc}")
    open(f"{d}/tags.txt", "w").write(", ".join([f"{nm} economy", f"why is {nm} rich", f"{nm} geography", "economic geography", "where the money lives", "wealth concentration", "shorts"]) + "\n")
print(len(C), "packaged")
