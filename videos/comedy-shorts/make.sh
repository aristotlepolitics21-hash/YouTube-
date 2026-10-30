#!/bin/bash
# usage: make.sh EPDIR WORKDIR   (needs KOKORO_DIR, see ../tech-shorts/engine/setup_kokoro.sh, and bg/KEY.jpg from fetch_bg.py)
# Voices script.json (one Kokoro voice per character), renders it with ../business-ideas/engine over the real-photo background
# in 3 parallel segments, adds the voices, and writes the video, captions.srt and thumbnail.jpg into EPDIR.
set -e
H=$(cd "$(dirname "$0")" && pwd); E=$H/../business-ideas/engine; EP=$(cd $1 && pwd); W=$2; mkdir -p $W; export SCRIPT=script.json
OUT=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['out'])" $EP/script.json)
[ -f $W/durs.json ] || python3 -I $E/voice.py $EP/script.json $W
TOT=$(python3 -c "import json;print(round(sum(json.load(open('$W/durs.json')))*30))"); N=3; S=$(( (TOT + N - 1) / N ))
for i in $(seq 0 $((N-1))); do a=$((i*S)); b=$(( (i+1)*S < TOT ? (i+1)*S : TOT )); NODE_PATH=$(npm root -g) node $E/render.cjs $EP $W $W/seg$i.mp4 $a $b & done; wait
for i in $(seq 0 $((N-1))); do echo "file '$W/seg$i.mp4'"; done > $W/concat.txt
ffmpeg -v error -y -f concat -safe 0 -i $W/concat.txt -c copy $W/video.mp4
ffmpeg -v error -y -i $W/video.mp4 -i $W/narration.wav -af "highpass=f=70,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-14:TP=-1.5:LRA=9" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart $EP/$OUT.mp4
cp $W/captions.srt $EP/
NODE_PATH=$(npm root -g) node $E/render.cjs $EP $W $EP/thumbnail.jpg --still $(python3 -c "import json;d=json.load(open('$W/durs.json'));print(round(sum(d[:-2])+d[-2]*.6,2))")
echo made $EP/$OUT.mp4
