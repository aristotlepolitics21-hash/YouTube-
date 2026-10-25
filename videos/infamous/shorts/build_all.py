import glob, os
# Concatenates every Shorts script, in episode order, into ALL.md.
here = os.path.dirname(os.path.abspath(__file__))
files = sorted(f for f in glob.glob(os.path.join(here, "[0-9][0-9]-*.md")))
out = ["# Infamous Shorts: all scripts\n", f"{len(files)} Shorts · 60 s each · four 15-second scenes.\n"]
out += [open(f).read().strip() + "\n" for f in files]
open(os.path.join(here, "ALL.md"), "w").write("\n\n---\n\n".join(out)); print(len(files), "scripts")
