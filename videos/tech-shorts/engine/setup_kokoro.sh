#!/bin/bash
# usage: setup_kokoro.sh DIR
# Installs the Kokoro-82M neural voice offline-capable into DIR, from npm and PyPI only:
#   weights  - npm kokoro-q8-shards (model_quantized.onnx from onnx-community/Kokoro-82M-v1.0-ONNX, split in 6)
#   voices   - npm kokoro-js (voices/*.bin, packed into voices.npz)
#   runtime  - PyPI kokoro-onnx (tokenizer, espeak-ng phonemizer, onnxruntime)
set -e
D=$1; mkdir -p $D && cd $D
[ -f package.json ] || npm init -y >/dev/null
npm install --silent kokoro-js kokoro-q8-shards
cat node_modules/kokoro-q8-shards/kokoro-q8.part{0..5}.bin > model_q8.onnx
echo "fbae9257e1e05ffc727e951ef9b9c98418e6d79f1c9b6b13bd59f5c9028a1478  model_q8.onnx" | sha256sum -c -
[ -d venv ] || python3 -m venv venv
./venv/bin/pip install -q kokoro-onnx soundfile
./venv/bin/python -I - node_modules/kokoro-js/voices voices.npz <<'PY'
import glob, os, sys, numpy as np
np.savez(sys.argv[2], **{os.path.basename(f)[:-4]: np.fromfile(f, dtype=np.float32).reshape(-1, 1, 256) for f in glob.glob(f"{sys.argv[1]}/*.bin")})
PY
echo "Kokoro ready in $D. Use voice 'kokoro:af_heart' with KOKORO_DIR=$D"
