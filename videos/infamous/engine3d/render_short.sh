#!/bin/bash
# usage: render_short.sh SHORT.md PLAN.json WORKDIR OUT.mp4 — voices and renders one vertical 60-second Short.
set -e
H=$(cd "$(dirname "$0")" && pwd); M=$1; PL=$2; E=$3; OUT=$4; FPS=24; N=${SEGS:-3}; PY=${PY:-$WORK/tts/bin/python3}
mkdir -p $E
$PY -I $H/short_audio.py $M $PL $E
python3 -I $H/short_page.py $PL $E/words.json $E/page.html
TOT=$((60 * FPS)); S=$(( (TOT + N - 1) / N ))
for i in $(seq 0 $((N-1))); do a=$((i*S)); b=$(( (i+1)*S < TOT ? (i+1)*S : TOT )); CANVAS=out NODE_PATH=$(npm root -g) node $H/seg.cjs $E/page.html $E/seg$i.mp4 $a $b $FPS > $E/seg$i.log 2>&1 & done; wait
: > $E/concat.txt; for i in $(seq 0 $((N-1))); do echo "file '$E/seg$i.mp4'" >> $E/concat.txt; done
ffmpeg -v error -y -f concat -safe 0 -i $E/concat.txt -c copy $E/video.mp4
ffmpeg -v error -y -i $E/video.mp4 -i $E/audio.wav -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:v copy -c:a aac -b:a 128k -ar 48000 -shortest -movflags +faststart $OUT
ls -la $OUT; grep -h ERR $E/seg*.log | head -3 || true
