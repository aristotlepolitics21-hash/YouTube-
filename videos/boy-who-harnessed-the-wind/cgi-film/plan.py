import json, subprocess, wave
D = "/tmp/claude-0/-home-user-YouTube-/aece8624-b638-5e16-a980-11f89b661b06/scratchpad"; R = "/home/user/YouTube-/videos/boy-who-harnessed-the-wind"
FPS = 24
nar = json.load(open(f"{R}/cgi-film/narration.json"))["acts"]
base = {x["shot"]: x["duration_s"] for x in json.load(open(f"{R}/cgi-batch/shots.json"))["shots"]}
SAY = {"TEDGlobal": "Ted Global", "Kamkwamba": "Kam-kwam-ba", "misala": "mee-sah-lah"}
params = None; out_frames = []; shots = []; caps = []; chapters = []; t = 0.0; li = 0
audio = wave.open(f"{D}/film/narration.wav", "wb")
for a in nar:
    act_start = t; chapters.append((t, a["name"])); segs = []
    lead = 0.8
    for j, line in enumerate(a["lines"]):
        say = line
        for k, v in SAY.items(): say = say.replace(k, v)
        f = f"{D}/film/vo/{li:03d}.wav"; li += 1
        subprocess.run([f"{D}/tts/bin/piper", "-m", f"{D}/voices/en_US-ryan-high.onnx", "--length_scale", "1.12", "--sentence_silence", "0.35", "-f", f], input=say.encode(), check=True, capture_output=True)
        with wave.open(f) as w:
            if params is None: params = w.getparams(); audio.setparams(params)
            fr = w.readframes(w.getnframes()); d = w.getnframes() / w.getframerate()
        gap = 1.1 if j < len(a["lines"]) - 1 else (1.8 if a is not nar[-1] else 3.0)
        segs.append((fr, d, gap, line))
    rate, sw, ch = params.framerate, params.sampwidth, params.nchannels
    sil = lambda s: b"\x00" * (int(round(s * rate)) * sw * ch)
    audio.writeframes(sil(lead)); cur = t + lead
    for fr, d, gap, line in segs:
        caps.append((cur, cur + d, line)); audio.writeframes(fr + sil(gap)); cur += d + gap
    ids0 = list(range(a["shots"][0], a["shots"][1] + 1)); need = 3.8 * len(ids0)
    if cur - t < need: pad = need - (cur - t); audio.writeframes(sil(pad)); cur += pad
    act_len = cur - t
    ids = list(range(a["shots"][0], a["shots"][1] + 1)); bsum = sum(base[i] for i in ids); acc = 0.0
    for i in ids:
        d = base[i] * act_len / bsum; acc += d
        shots.append({"n": i, "act": a["act"], "dur": d})
    t = cur
audio.close()
# frame counts with cumulative rounding so video length matches audio
cum = 0.0; fcum = 0
for s in shots:
    cum += s["dur"]; target = round(cum * FPS); s["frames"] = target - fcum; fcum = target
for i, s in enumerate(shots):
    s["fadeIn"] = i == 0 or shots[i - 1]["act"] != s["act"]; s["fadeOut"] = i == len(shots) - 1 or shots[i + 1]["act"] != s["act"]
json.dump({"fps": FPS, "shots": shots, "total": t}, open(f"{D}/film/plan.json", "w"), indent=1)
def ts(x): ms = int(round(x * 1000)); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
open(f"{D}/film/film.srt", "w").write("\n".join(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{l}\n" for i, (a, b, l) in enumerate(caps)))
ch = "\n".join(f"{int(x // 60)}:{int(x % 60):02d} {n}" for x, n in chapters)
open(f"{D}/film/chapters.txt", "w").write(ch + "\n")
print("total", round(t, 1), "s  frames", fcum, "\n" + ch)
print("shot range", round(min(s['dur'] for s in shots), 2), round(max(s['dur'] for s in shots), 2))
