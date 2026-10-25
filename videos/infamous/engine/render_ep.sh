#!/bin/bash
# usage: render_ep.sh WORKDIR SCRIPT OUTNAME   (WORKDIR already holds narration.wav + durs.json from voice.py)
set -e
H=$(cd "$(dirname "$0")" && pwd); HD=$H/../../historic-disasters/engine; E=$1; FPS=30; N=${SEGS:-3}
python3 -I $H/build_page.py $2 $E/durs.json $E/page.html
TOT=$(python3 -c "import json;print(round(sum(json.load(open('$E/durs.json')))*$FPS))"); S=$(( (TOT + N - 1) / N ))
for i in $(seq 0 $((N-1))); do a=$((i*S)); b=$(( (i+1)*S < TOT ? (i+1)*S : TOT )); NODE_PATH=$(npm root -g) node $H/seg.cjs $E/page.html $E/seg$i.mp4 $a $b $FPS > $E/seg$i.log 2>&1 & done; wait
: > $E/concat.txt; for i in $(seq 0 $((N-1))); do echo "file '$E/seg$i.mp4'" >> $E/concat.txt; done
ffmpeg -v error -y -f concat -safe 0 -i $E/concat.txt -c copy $E/video.mp4
ffmpeg -v error -y -i $E/video.mp4 -i $E/narration.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:v copy -c:a aac -b:a 96k -shortest -movflags +faststart $E/$3.mp4
ls -la $E/$3.mp4; ffprobe -v error -show_entries format=duration -of csv=p=0 $E/$3.mp4; grep -h ERR $E/seg*.log | head -3 || true
