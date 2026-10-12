#!/bin/bash
# usage: render.sh SCRIPT.json WORKDIR OUTNAME [voice] [rate]
# Voices the script, builds the page, renders it in 3 parallel segments with Playwright, then muxes narration.
set -e
H=$(cd "$(dirname "$0")" && pwd); W=$2; FPS=30
python3 -I $H/voice.py $1 $W ${4:-slt} ${5:-100}
python3 -I $H/build_page.py $1 $W $W/page.html
TOT=$(python3 -c "import json;print(round(sum(json.load(open('$W/durs.json')))*$FPS))")
N=3; S=$(( (TOT + N - 1) / N ))
for i in 0 1 2; do a=$((i*S)); b=$(( (i+1)*S < TOT ? (i+1)*S : TOT )); NODE_PATH=$(npm root -g) node $H/seg.cjs $W/page.html $W/seg$i.mp4 $a $b $FPS > $W/seg$i.log 2>&1 & done; wait
printf "file '%s'\n" $W/seg0.mp4 $W/seg1.mp4 $W/seg2.mp4 > $W/concat.txt
ffmpeg -v error -y -f concat -safe 0 -i $W/concat.txt -c copy $W/video.mp4
ffmpeg -v error -y -i $W/video.mp4 -i $W/narration.wav -af "highpass=f=70,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-14:TP=-1.5:LRA=9" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart $W/$3.mp4
ls -la $W/$3.mp4; ffprobe -v error -show_entries format=duration -of csv=p=0 $W/$3.mp4; grep -h ERR $W/seg*.log | head -3 || true
