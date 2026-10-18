#!/bin/bash
# usage: make.sh EPDIR WORKDIR
# Voices the script (Kokoro am_michael at 108%), renders the 3D short with ../tech-shorts/engine3d,
# then copies the video, captions and a caption-free thumbnail of the hook into EPDIR.
set -e
H=$(cd "$(dirname "$0")" && pwd); E3=$H/../tech-shorts/engine3d; EP=$(cd $1 && pwd); W=$2; mkdir -p $W
OUT=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['out'])" $EP/script.json)
$E3/render.sh $EP/script.json $W $OUT kokoro:am_michael 108
cp $W/$OUT.mp4 $W/captions.srt $EP/
NODE_PATH=$(npm root -g) node $E3/thumb.cjs $W/page3d.html $EP/thumbnail.jpg 0
echo made $EP
