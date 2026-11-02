#!/bin/bash
# usage: make.sh EPDIR WORKDIR   (needs KOKORO_DIR, see ../tech-shorts/engine/setup_kokoro.sh)
# Voices script.json, renders it with engine/page.html (the 2D toon engine plus riddle.js) in 3 parallel segments,
# adds the voice, and writes the video, captions.srt and thumbnail.jpg (the question card) into EPDIR.
set -e
H=$(cd "$(dirname "$0")" && pwd); E=$H/../business-ideas/engine; EP=$(cd $1 && pwd); W=$2; mkdir -p $W; export SCRIPT=script.json PAGE=$H/engine/page.html
OUT=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['out'])" $EP/script.json)
[ -f $W/durs.json ] || python3 -I $E/voice.py $EP/script.json $W
TOT=$(python3 -c "import json;print(round(sum(json.load(open('$W/durs.json')))*30))"); N=3; S=$(( (TOT + N - 1) / N ))
for i in $(seq 0 $((N-1))); do a=$((i*S)); b=$(( (i+1)*S < TOT ? (i+1)*S : TOT )); NODE_PATH=$(npm root -g) node $E/render.cjs $EP $W $W/seg$i.mp4 $a $b & done; wait
for i in $(seq 0 $((N-1))); do echo "file '$W/seg$i.mp4'"; done > $W/concat.txt
ffmpeg -v error -y -f concat -safe 0 -i $W/concat.txt -c copy $W/video.mp4
ffmpeg -v error -y -i $W/video.mp4 -i $W/narration.wav -af "highpass=f=70,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-14:TP=-1.5:LRA=9" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart $EP/$OUT.mp4
cp $W/captions.srt $EP/
T=$(python3 -c "
import json;d=json.load(open('$W/durs.json'));L=json.load(open('$EP/script.json'))['sections'][0]['lines'];i=[k for k,l in enumerate(L) if l[1].get('ask')][0];print(round(sum(d[:i])+2.2,2))")
NODE_PATH=$(npm root -g) node $E/render.cjs $EP $W $EP/thumbnail.jpg --still $T
echo made $EP/$OUT.mp4
