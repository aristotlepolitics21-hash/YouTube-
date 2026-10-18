# usage: assemble.py SCRIPT.json WORKDIR CLIPDIR OUT.mp4
# For episodes whose shots are AI-generated clips ("visuals": "ai-clips"): WORKDIR holds narration.wav, durs.json and
# caps.json from ../tech-shorts/engine/voice.py; CLIPDIR holds 00.mp4, 01.mp4, ... one clip per script line.
# Each clip is fitted to its line's length (slowed down if it is too short), cropped to 1080x1920, and the
# captions are burned in as short white chunks low in the frame, the same way the 3D story style draws them.
import json, os, subprocess, sys
script, w, clips, out = sys.argv[1:5]
sc = json.load(open(script)); texts = [l[2] for s in sc["sections"] for l in s["lines"]]
durs, caps = json.load(open(f"{w}/durs.json")), json.load(open(f"{w}/caps.json"))
FONT = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"

def chunks(text):  # same chunking as storyCaption in engine3d/pixar.js
    out, cur = [], []
    for wd in text.split():
        cur.append(wd)
        if len(cur) >= 3 or wd[-1] in ".,?!": out.append(" ".join(cur)); cur = []
    return out + ([" ".join(cur)] if cur else [])

parts = []
for i, d in enumerate(durs):
    src, seg = f"{clips}/{i:02d}.mp4", f"{w}/fit{i:02d}.mp4"
    n = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], capture_output=True, text=True).stdout)
    slow = max(1.0, d / (n - .05))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-an", "-vf", f"setpts={slow:.4f}*PTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p",
                    "-t", f"{d:.3f}", "-c:v", "libx264", "-crf", "18", "-preset", "fast", seg], check=True)
    parts.append(seg)
open(f"{w}/fit.txt", "w").write("".join(f"file '{p}'\n" for p in parts))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{w}/fit.txt", "-c", "copy", f"{w}/fit.mp4"], check=True)

draws = []
for (a, b, _), text in zip(caps, texts):
    ch = chunks(text); tot = sum(len(c) + 3 for c in ch); t = a
    for c in ch:
        e = t + (b - a) * (len(c) + 3) / tot; tf = f"{w}/cap{len(draws):03d}.txt"; open(tf, "w").write(c.rstrip(".,!"))
        draws.append(f"drawtext=fontfile={FONT}:textfile={tf}:fontsize=72:fontcolor=white:shadowcolor=black@0.75:shadowx=0:shadowy=4:borderw=3:bordercolor=black@0.35:x=(w-text_w)/2:y=1330-text_h/2:enable='between(t,{t:.3f},{e + (.1 if c is ch[-1] else 0):.3f})'")
        t = e
open(f"{w}/caps.filter", "w").write(",".join(draws))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{w}/fit.mp4", "-i", f"{w}/narration.wav", "-filter_complex_script", f"{w}/caps.filter",
                "-af", "highpass=f=70,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-14:TP=-1.5:LRA=9",
                "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-shortest", "-movflags", "+faststart", out], check=True)
print("wrote", out)
