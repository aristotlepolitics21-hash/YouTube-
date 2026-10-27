# usage: KOKORO_DIR/venv/bin/python say.py KOKORO_DIR JOBS.json
# JOBS.json is a list of [text, out.wav, voice, speed]; voice "a+b" blends two voices. Hindi voices (h*) read Devanagari with lang hi.
import json, sys, soundfile as sf
from kokoro_onnx import Kokoro
d, jobs = sys.argv[1], json.load(open(sys.argv[2]))
k = Kokoro(f"{d}/model_q8.onnx", f"{d}/voices.npz")
for text, out, voice, speed in jobs:
    names = voice.split("+"); style = sum(k.get_voice_style(n) for n in names) / len(names)
    lang = "hi" if names[0][0] == "h" else "en-gb" if names[0][0] == "b" else "en-us"
    samples, sr = k.create(text, voice=style, speed=speed, lang=lang)
    sf.write(out, samples, sr)
