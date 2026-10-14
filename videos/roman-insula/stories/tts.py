# usage: KOKORO_DIR/venv/bin/python tts.py KOKORO_DIR JOBS.json
# JOBS.json: [{"text", "voice", "speed", "out"}]. "voice" is a Kokoro voice ("af_heart") or a weighted
# blend ("af_heart:0.8,af_nicole:0.2"), which gives a narrator a timbre of its own.
# Uses the full-precision model (model_fp32.onnx) when it is there, else the q8 one.
import json, os, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

d, jobs = sys.argv[1], json.load(open(sys.argv[2]))
model = f"{d}/model_fp32.onnx" if os.path.exists(f"{d}/model_fp32.onnx") else f"{d}/model_q8.onnx"
k = Kokoro(model, f"{d}/voices.npz")


def style(spec):
    if ":" not in spec:
        return spec
    parts = [p.split(":") for p in spec.split(",")]
    total = sum(float(w) for _, w in parts)
    return sum(k.get_voice_style(v) * (float(w) / total) for v, w in parts)


for j in jobs:
    first = j["voice"].split(":")[0].split(",")[0]
    samples, sr = k.create(j["text"], voice=style(j["voice"]), speed=j["speed"],
                           clause_pause=j.get("clause_pause", 0.15), lang="en-gb" if first[0] == "b" else "en-us")
    sf.write(j["out"], np.asarray(samples, dtype=np.float32), sr)
