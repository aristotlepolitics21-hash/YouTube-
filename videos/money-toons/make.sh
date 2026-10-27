#!/bin/bash
# usage: make.sh EPDIR WORKDIR   (needs KOKORO_DIR, see ../tech-shorts/engine/setup_kokoro.sh)
# Voices script.json (one Kokoro voice per character), renders script3d.json with ../tech-shorts/engine3d and sets/money/paisa.js
# in 3 parallel segments, adds the voices, and writes the video, captions.srt and thumbnail.jpg into EPDIR.
set -e
H=$(cd "$(dirname "$0")" && pwd); E3=$H/../tech-shorts/engine3d; EP=$(cd $1 && pwd); W=$2; mkdir -p $W; FPS=30; N=3
OUT=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['out'])" $EP/script.json)
[ -f $W/durs.json ] || python3 -I $H/engine/voice.py $EP/script.json $W
python3 -I $E3/build_page.py $EP/script3d.json $W $W/page3d.html
TOT=$(python3 -c "import json;print(round(sum(json.load(open('$W/durs.json')))*$FPS))"); S=$(( (TOT + N - 1) / N ))
for i in $(seq 0 $((N-1))); do a=$((i*S)); b=$(( (i+1)*S < TOT ? (i+1)*S : TOT )); NODE_PATH=$(npm root -g) node $E3/seg.cjs $W/page3d.html $W/seg$i.mp4 $a $b $FPS > $W/seg$i.log 2>&1 & done; wait
for i in $(seq 0 $((N-1))); do echo "file '$W/seg$i.mp4'"; done > $W/concat.txt
ffmpeg -v error -y -f concat -safe 0 -i $W/concat.txt -c copy $W/video.mp4
ffmpeg -v error -y -i $W/video.mp4 -i $W/narration.wav -af "highpass=f=70,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-14:TP=-1.5:LRA=9" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart $EP/$OUT.mp4
cp $W/captions.srt $EP/
NODE_PATH=$(npm root -g) node $E3/thumb.cjs $W/page3d.html $EP/thumbnail.jpg 0
grep -h ERR $W/seg*.log | head -3 || true
echo made $EP/$OUT.mp4
