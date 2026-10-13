# usage: KOKORO_DIR/venv/bin/python kokoro_say.py KOKORO_DIR VOICE SPEED JOBS.json
# JOBS.json is a list of [text, out.wav]; the model loads once for all of them.
import json, sys, soundfile as sf
from kokoro_onnx import Kokoro
d, voice, speed, jobs = sys.argv[1], sys.argv[2], float(sys.argv[3]), json.load(open(sys.argv[4]))
k = Kokoro(f"{d}/model_q8.onnx", f"{d}/voices.npz")
for text, out in jobs:
    samples, sr = k.create(text, voice=voice, speed=speed, lang="en-gb" if voice[0] == "b" else "en-us")
    sf.write(out, samples, sr)
