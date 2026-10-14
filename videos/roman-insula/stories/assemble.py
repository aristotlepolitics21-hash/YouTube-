# usage: python3 assemble.py STORY_DIR OUT.mp4 [--fps-in 15]
# Edits the rendered shots into the finished reel:
#   picture  each shot upscaled to 1080x1920 and smoothed to 30 fps, soft dips between scenes,
#            the flashback graded sepia with grain and a dip to white in and out, vignette throughout
#   text     a title card, and big word-chunk captions timed to the voice (like the reference reels)
#   sound    the narration, warmed, over the score, which ducks under the voice
import argparse, json, os, subprocess

p = argparse.ArgumentParser()
p.add_argument("story")
p.add_argument("out")
p.add_argument("--fps-in", type=int, default=15)
p.add_argument("--interp", default="minterpolate", choices=["minterpolate", "dup"])
a = p.parse_args()
B = os.path.join(a.story, "build")
story = json.load(open(os.path.join(a.story, "story.json")))
tl = json.load(open(os.path.join(B, "timeline.json")))
run = lambda *c: subprocess.run([str(x) for x in c], check=True)

# ------------------------------------------------------------------- per-shot clips
clips = []
for k, s in enumerate(tl["shots"]):
    first, last = k == 0, k == len(tl["shots"]) - 1
    fb = s["flashback"]
    nxt_fb = not last and tl["shots"][k + 1]["flashback"]
    prv_fb = not first and tl["shots"][k - 1]["flashback"]
    dur = s["dur"]
    vf = ["scale=1080:1920:flags=lanczos"]
    vf.append("minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" if a.interp == "minterpolate"
              else "fps=30")
    vf.append(f"trim=duration={dur},setpts=PTS-STARTPTS")
    if fb:
        vf += ["colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131",
               "eq=contrast=1.05:brightness=0.02:saturation=0.9", "noise=alls=10:allf=t+u", "vignette=PI/3.2"]
    else:
        vf += ["eq=saturation=1.06", "vignette=PI/5"]
    fin = 1.5 if first else 0.45
    fout = 2.5 if last else 0.45
    white_in, white_out = fb or prv_fb, fb or nxt_fb
    vf.append(f"fade=t=in:d={fin}" + (":c=white" if white_in else ""))
    vf.append(f"fade=t=out:st={dur - fout}:d={fout}" + (":c=white" if white_out else ""))
    out = os.path.join(B, f"clip_{k}.mp4")
    run("ffmpeg", "-v", "error", "-y", "-framerate", a.fps_in, "-start_number", 1,
        "-i", os.path.join(B, "frames", s["id"], "%04d.png"), "-vf", ",".join(vf),
        "-c:v", "libx264", "-crf", 16, "-preset", "medium", "-pix_fmt", "yuv420p", "-r", 30, out)
    clips.append(out)
    print("clip", s["id"], flush=True)
with open(os.path.join(B, "clips.txt"), "w") as f:
    f.writelines(f"file '{os.path.abspath(c)}'\n" for c in clips)
picture = os.path.join(B, "picture.mp4")
run("ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", 0, "-i", os.path.join(B, "clips.txt"), "-c", "copy", picture)


# ------------------------------------------------------------------- captions (ASS)
def ts(x):
    cs = int(round(x * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def chunks(text, n=4):
    words, out, cur = text.split(), [], []
    for w in words:
        cur.append(w)
        if len(cur) >= n or w[-1] in ".,:;!?":
            out.append(" ".join(cur))
            cur = []
    if cur:
        out.append(" ".join(cur))
    return out


ev = []
for ln in tl["lines"]:
    parts = chunks(ln["text"])
    total_chars = sum(len(c) + 3 for c in parts)
    t = ln["start"]
    for c in parts:
        d = (ln["end"] - ln["start"]) * (len(c) + 3) / total_chars
        style = "Flash" if tl["shots"][ln["shot"]]["flashback"] else "Cap"
        ev.append(f"Dialogue: 1,{ts(t)},{ts(t + d)},{style},,0,0,0,,{{\\fad(80,60)}}{c}")
        t += d
title, series = story["title"], story["series"]
ev.append(f"Dialogue: 2,{ts(0.6)},{ts(5.2)},Title,,0,0,0,,{{\\fad(900,700)}}{title}")
ev.append(f"Dialogue: 2,{ts(1.2)},{ts(5.2)},Sub,,0,0,0,,{{\\fad(900,700)}}A story from ancient Rome")
end = tl["total"]
ev.append(f"Dialogue: 2,{ts(end - 2.6)},{ts(end)},Sub,,0,0,0,,{{\\fad(600,0)}}{series} · Episode {story['episode']}")
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,DejaVu Sans,66,&H00FFFFFF,&H00FFFFFF,&H00101010,&H90000000,1,0,0,0,100,100,0,0,1,5,3,2,70,70,560,1
Style: Flash,DejaVu Serif,62,&H00D8ECF6,&H00FFFFFF,&H00142030,&H90000000,0,1,0,0,100,100,0,0,1,4,3,2,70,70,560,1
Style: Title,DejaVu Serif,84,&H00E6F2FA,&H00FFFFFF,&H00101828,&H80000000,1,0,0,0,100,100,1,0,1,5,4,8,60,60,300,1
Style: Sub,DejaVu Serif,44,&H00C8DCE8,&H00FFFFFF,&H00101828,&H80000000,0,1,0,0,100,100,2,0,1,3,2,8,60,60,420,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(ev) + "\n"
ass_path = os.path.join(B, "captions.ass")
open(ass_path, "w").write(ass)
# plain SRT too, for uploading as closed captions
srt = []
for i, ln in enumerate(tl["lines"]):
    f = lambda x: f"{int(x // 3600):02d}:{int(x // 60 % 60):02d}:{int(x % 60):02d},{int(round(x * 1000)) % 1000:03d}"
    srt.append(f"{i + 1}\n{f(ln['start'])} --> {f(ln['end'])}\n{ln['text']}\n")
open(os.path.join(a.story, "captions.srt"), "w").write("\n".join(srt))

# ------------------------------------------------------------------- final mix + burn-in
af = ("[1:a]aresample=48000,pan=stereo|c0=c0|c1=c0,highpass=f=70,"
      "equalizer=f=200:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=2.5:attack=10:release=200,"
      "aecho=0.8:0.6:45|90:0.12|0.07,asplit=2[vo][key];"
      "[2:a]lowpass=f=7000,volume=0.5[mus];"
      "[mus][key]sidechaincompress=threshold=0.03:ratio=5:attack=60:release=900[duck];"
      "[vo][duck]amix=inputs=2:normalize=0:duration=longest,"
      "loudnorm=I=-14:TP=-1.5:LRA=9[a]")
run("ffmpeg", "-v", "error", "-y", "-i", picture, "-i", os.path.join(B, "narration.wav"), "-i", os.path.join(B, "music.wav"),
    "-filter_complex", f"[0:v]ass={ass_path}[v];{af}", "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-crf", 18, "-preset", "slow", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", 192, "-ar", 48000, "-t", tl["total"], "-movflags", "+faststart", a.out)
print("wrote", a.out)
