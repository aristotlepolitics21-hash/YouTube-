#!/bin/bash
# usage: setup_depth.sh DIR
# Installs the depth model for stills parallax into DIR: Depth Anything V2 small (quantised ONNX, Apache-2.0)
# from Hugging Face, checked by sha256, plus onnxruntime, numpy and pillow from PyPI.
set -e
D=$1; mkdir -p $D && cd $D
[ -f model_q.onnx ] || curl -sSL -o model_q.onnx https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model_quantized.onnx
echo "fcf51f1b230362b28690bb9d1809bf0431f29cad20534e3f589bd7285547f20d  model_q.onnx" | sha256sum -c -
[ -d venv ] || python3 -m venv venv
./venv/bin/pip install -q onnxruntime numpy pillow
echo "Depth ready in $D. Use DEPTH_DIR=$D"
