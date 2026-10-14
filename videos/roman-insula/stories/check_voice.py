# usage: WHISPER_PY/python check_voice.py STORY_DIR
# Listens to build/narration.wav with Whisper (faster-whisper, small.en) and
#   - prints each line as written next to what was heard, flagging lines that differ,
#   - writes build/words.json: word-level timings that assemble.py uses for the captions.
import json, re, subprocess, sys
import numpy as np
from difflib import SequenceMatcher
from faster_whisper import WhisperModel

d = sys.argv[1]
tl = json.load(open(f"{d}/build/timeline.json"))
m = WhisperModel("small.en", device="cpu", compute_type="int8")
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{d}/build/narration.wav", "-ac", "1", "-ar", "16000",
                      "-f", "s16le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
segs, _ = m.transcribe(audio, word_timestamps=True, beam_size=5, vad_filter=False)
words = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
json.dump(words, open(f"{d}/build/words.json", "w"))
norm = lambda s: re.sub(r"[^a-z0-9' ]", "", s.lower().replace("’", "'")).split()
bad = 0
for ln in tl["lines"]:
    heard = " ".join(w["w"] for w in words if ln["start"] - 0.25 <= (w["s"] + w["e"]) / 2 <= ln["end"] + 0.25)
    r = SequenceMatcher(None, norm(ln["text"]), norm(heard)).ratio()
    flag = "OK " if r > 0.85 else "?? "
    bad += r <= 0.85
    print(f"{flag}{r:.2f} [{ln.get('speaker', 'narrator')}] {ln['text']}\n         heard: {heard}")
print(f"{len(tl['lines']) - bad}/{len(tl['lines'])} lines match")
