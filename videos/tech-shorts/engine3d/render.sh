#!/bin/bash
# usage: render.sh SCRIPT.json WORKDIR OUTNAME [voice] [rate]
# Voices the script (offline RHVoice, ../engine/voice.py), builds the 3D page, renders it in 4 parallel segments, then muxes narration.
set -e
H=$(cd "$(dirname "$0")" && pwd); W=$2; FPS=30; N=2
VOICE=${4:-$(python3 -c "import json,sys;print(json.load(open(sys.argv[1])).get('voice','slt'))" $1)}
[ -f $W/durs.json ] || python3 -I $H/../engine/voice.py $1 $W $VOICE ${5:-100}
python3 -I $H/build_page.py $1 $W $W/page3d.html
TOT=$(python3 -c "import json;print(round(sum(json.load(open('$W/durs.json')))*$FPS))"); S=$(( (TOT + N - 1) / N ))
for i in $(seq 0 $((N-1))); do a=$((i*S)); b=$(( (i+1)*S < TOT ? (i+1)*S : TOT )); NODE_PATH=$(npm root -g) node $H/seg.cjs $W/page3d.html $W/seg3d$i.mp4 $a $b $FPS > $W/seg3d$i.log 2>&1 & done; wait
for i in $(seq 0 $((N-1))); do echo "file '$W/seg3d$i.mp4'"; done > $W/concat3d.txt
ffmpeg -v error -y -f concat -safe 0 -i $W/concat3d.txt -c copy $W/video3d.mp4
ffmpeg -v error -y -i $W/video3d.mp4 -i $W/narration.wav -af "highpass=f=70,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-14:TP=-1.5:LRA=9" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart $W/$3.mp4
ls -la $W/$3.mp4; ffprobe -v error -show_entries format=duration -of csv=p=0 $W/$3.mp4; grep -h ERR $W/seg3d*.log | head -3 || true
